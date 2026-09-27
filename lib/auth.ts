import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { escapeRegExp, normalizeEmail } from "@/lib/validation";
import { ensurePersonalTeam } from "@/lib/onboarding";
import { claimGuestFiles } from "@/lib/guest";
import { getSettings } from "@/lib/settings";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          throw new Error("Invalid credentials");
        }

        try {
          await connectToDatabase();

          // Primary lookup uses the canonical email. The case-insensitive fallback
          // keeps accounts created before normalization (or via OAuth) working.
          let user = await User.findOne({ email });
          if (!user) {
            user = await User.findOne({
              email: { $regex: `^${escapeRegExp(email)}$`, $options: "i" },
            });
          }

          if (!user || !user.password) {
            throw new Error("No account found for this email with a password");
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            throw new Error("Incorrect password");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: (user.role as "user" | "admin" | undefined) ?? "user",
          };
        } catch (error) {
          // NextAuth swallows errors from authorize() and returns a bare 401, so log
          // the real reason here (without the password) to make failures debuggable.
          console.error(
            "[auth] credentials sign-in failed:",
            error instanceof Error ? error.message : error
          );
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Persist the user record and make sure they own a team so they can create
      // files immediately. Runs for every provider (credentials + OAuth).
      if (user.email) {
        const email = normalizeEmail(user.email);
        try {
          await connectToDatabase();
          const existingUser = await User.findOne({ email });
          const settings = await getSettings();
          const isAdmin = existingUser?.role === "admin";

          // Access control gates live here because this is the one choke point
          // every provider passes through. Admins are exempt from maintenance
          // so the platform can never lock its operators out.
          if (existingUser?.banned) {
            console.warn(`[auth] blocked sign-in for banned user: ${email}`);
            return false;
          }
          if (settings.maintenance && !isAdmin && process.env.NODE_ENV !== "development") {
            console.warn(`[auth] blocked sign-in during maintenance: ${email}`);
            return false;
          }
          if (!existingUser && !settings.allowSignups && process.env.NODE_ENV !== "development") {
            console.warn(`[auth] blocked new signup (signups disabled): ${email}`);
            return false;
          }

          if (!existingUser) {
            await User.create({
              name: user.name,
              email,
              image: user.image,
            });
          } else {
            // Expose the role to the jwt callback that runs next.
            user.role = existingUser.role === "admin" ? "admin" : "user";
          }

          const personalTeam = await ensurePersonalTeam(email, user.name);

          // Adopt any anonymous workspace this browser created before signing
          // up, so a guest never loses the work that brought them here. This
          // runs after the team exists because a claimed file needs a teamId.
          const claimed = await claimGuestFiles(email, personalTeam._id.toString());
          if (claimed > 0) {
            console.info(`[auth] claimed ${claimed} guest file(s) for ${email}`);
          }
        } catch (error) {
          // Never block sign-in because provisioning failed.
          console.error(
            "[auth] post-sign-in provisioning failed:",
            error instanceof Error ? error.message : error
          );
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Keep the session email canonical so every ownership lookup matches.
        session.user.email = normalizeEmail(session.user.email);
        if (token.sub) session.user.id = token.sub;
        session.user.role = token.role ?? "user";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role ?? "user";
      } else if (!token.role) {
        // Sessions issued before roles existed: hydrate once from the database
        // so the middleware guard has a role claim to read.
        try {
          const email = token.email ? normalizeEmail(token.email) : null;
          if (email) {
            await connectToDatabase();
            const dbUser = await User.findOne({ email })
              .select("role")
              .lean();
            token.role = dbUser?.role === "admin" ? "admin" : "user";
          }
        } catch {
          token.role = "user";
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Returns the signed-in user for a server context (route handler / server
 * component), or null when the request is unauthenticated.
 *
 * Also re-validates the account against the database in a single indexed
 * query, so banning a user revokes API access immediately (JWT sessions are
 * otherwise valid until they expire) and `role` is always fresh.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user ?? null;
  if (!user?.email) return null;

  try {
    await connectToDatabase();
    const dbUser = await User.findOne({ email: user.email })
      .select("role banned")
      .lean();

    if (dbUser?.banned) return null;

    user.role = dbUser?.role === "admin" ? "admin" : "user";
  } catch (error) {
    // Fail open only on infrastructure errors — the session itself is valid.
    console.error(
      "[auth] user re-validation failed:",
      error instanceof Error ? error.message : error
    );
    user.role = user.role ?? "user";
  }

  return user;
}
