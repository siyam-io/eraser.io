import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { escapeRegExp, normalizeEmail } from "@/lib/validation";
import { ensurePersonalTeam } from "@/lib/onboarding";

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

          if (!existingUser) {
            await User.create({
              name: user.name,
              email,
              image: user.image,
            });
          }

          await ensurePersonalTeam(email, user.name);
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
        // @ts-expect-error id is added to the session user at runtime
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
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
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
