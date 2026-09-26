<div align="center">
  <br />
  <h1>✏️ Erasior</h1>
  <p>
    <strong>A professional, real-time collaborative workspace bridging the gap between documents and whiteboards.</strong>
  </p>
  <p>
    <a href="https://eraser-io-one.vercel.app/" target="_blank">Live Demo</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
  <br />
</div>

## 📖 Overview

Erasior is an all-in-one workspace designed for engineering and product teams. It eliminates context switching by combining a powerful block-based document editor with an infinite canvas whiteboard (powered by Excalidraw) in a single, resizable split-screen interface. 

Whether you are writing an RFC, designing system architectures, or brainstorming with your team, Erasior keeps your context in one place.

## ✨ Features

- **Split-Screen Workspace:** Edit documents and draw architecture diagrams side-by-side. Context never leaves your screen.
- **Block-Based Editor:** Rich text editing using Editor.js with support for Headers, Lists, Code Blocks, Quotes, Tables, and Checklists.
- **Infinite Canvas:** Sketch flows and diagrams using the integrated Excalidraw whiteboard.
- **Real-Time Collaboration:** Team spaces where documents and boards live together.
- **Admin Dashboard:** Manage users, monitor metrics, and handle roles via a secure `/admin` panel.
- **SaaS Ready:** Metered billing, Stripe integration, and Pro tiers built-in.
- **Modern Authentication:** Secure credential and Google OAuth sign-in powered by NextAuth.js.

## 🛠 Tech Stack

Built for speed, scalability, and developer experience.

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **UI & Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + Radix UI + DaisyUI
- **Database:** [MongoDB](https://www.mongodb.com/) + Mongoose ODM
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Editor:** [Editor.js](https://editorjs.io/) (JSON-based structured text)
- **Whiteboard:** [Excalidraw](https://excalidraw.com/)
- **Payments:** [Stripe](https://stripe.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 24 recommended)
- MongoDB Database (Local or MongoDB Atlas)
- Stripe Account (for payments)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siyam-io/eraser.io.git
   cd eraser.io
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Rename `.env.example` to `.env` and fill in your credentials.
   ```env
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_SECRET=your_super_secret
   NEXTAUTH_URL=http://localhost:3000
   # Stripe & other keys...
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to see the application.

5. **Seed the Admin User:**
   To access the admin panel, seed an admin user via the terminal:
   ```bash
   npm run admin:seed your-email@example.com
   ```

## 🌐 Deployment (Vercel)

If you are deploying to Vercel, please ensure your **Build Command** in Vercel settings is set to `npm run build` or `next build` to prevent legacy Convex scripts from running.

---
*Constructed with pure functional design.*
