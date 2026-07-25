# ❄️ Arti Air Con — Enterprise AC Services & HVAC Management Platform

![Next.js 16](https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Firebase FCM](https://img.shields.io/badge/Firebase-FCM%20Push-FFCA28?style=for-the-badge&logo=firebase)
![Build Status](https://img.shields.io/badge/Build-Passing%20(26%2F26%20Routes)-2e7d32?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A production-ready, full-stack enterprise digital HVAC & air conditioning service booking and fleet management platform. Built with **Next.js 16 (App Router & Turbopack)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, **Firebase Cloud Messaging (FCM)**, **Zustand**, and **jsPDF**.

---

## ✨ Features & Functional Modules

### 👤 Customer Experience & Portal
- **Service Booking Wizard (`/book`)**: 3-step interactive booking flow tailored for 10 core AC services with dynamic pricing.
- **Real-Time Notification Bell & Badge Counter**: Persistent in-app notification dropdown with unread badge counter (`1`, `2`, `3+`), popover panel, and one-click item navigation.
- **Firebase Web Push Notifications**: Service Worker background push notifications (`firebase-messaging-sw.js`), custom permission modal, and mobile vibration alerts.
- **Customer Account Hub (`/dashboard`)**: Live order status tracker (`PENDING`, `ACCEPTED`, `EN_ROUTE`, `IN_PROGRESS`, `COMPLETED`), active technician contacts, and instant cancellation controls.
- **PDF Receipt Generator**: Automatically compiles downloadable PDF service receipts complete with tax invoices, booking IDs, and itemized pricing breakdowns using `jsPDF`.
- **OTP Authentication & Secure Logout (`/login`)**: Mobile phone-based login and signup backed by Web Crypto HMAC session cookies. Server-side cookie destruction on `/api/auth/logout` preventing ghost logins.
- **Bilingual Interface**: Native support for **English** and **Hindi** with real-time language toggle and custom translation dictionaries.

### 🛡️ Admin Management Operations
- **Admin Gateway Portal (`/admin/login`)**: Role-based access control (RBAC) authentication securing administrative capabilities.
- **Admin Command Center (`/admin/dashboard`)**: Metrics bento grid displaying total revenue, active orders, completed jobs, and customer analytics.
- **Live Order Dispatching**: One-click booking management (`ACCEPT`, `REJECT`, `COMPLETE`, `DELETE`) with real-time customer push triggers and technician assignment.
- **Site Settings Configuration**: Live site settings management for updating support phone numbers, WhatsApp links, and technician profiles.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 + Lucide React Icons |
| **Database & ORM** | Prisma ORM with MySQL / PostgreSQL Provider |
| **Client State** | Zustand (Auth, Booking, Notification, Language, Settings stores) |
| **Push Notifications** | Firebase Cloud Messaging (FCM) & Service Worker Web Push |
| **Form & Validation** | React Hook Form & Zod Schemas |
| **Document Export** | jsPDF (Client & Server PDF rendering) |
| **Security & Auth** | `scrypt` Password Hashing, Web Crypto API HMAC Tokens, HTML Entity XSS Escaping |
| **Deployment** | Vercel Edge Network / Railway / Docker Container |

---

## 📁 Repository Structure

```text
arti-air-con/
├── prisma/
│   ├── schema.prisma         # Database models (User, FcmToken, Booking, TechnicianActivity, SiteSetting)
│   └── seed.ts               # Database seeder script
├── public/                   # Static assets, branding logos, favicon icons, and firebase-messaging-sw.js
├── src/
│   ├── app/                  # Next.js App Router Page & API Routes
│   │   ├── (auth)/           # Authentication views (/login, /admin/login)
│   │   ├── (customer)/       # Protected customer portal (/dashboard, /book)
│   │   ├── (public)/         # Public landing page (/)
│   │   ├── admin/            # Protected admin portal (/admin/dashboard)
│   │   ├── api/              # RESTful API route handlers (auth, bookings, notifications, stats)
│   │   ├── layout.tsx        # Global App layout & Font declarations
│   │   ├── sitemap.ts        # Dynamic SEO sitemap generator
│   │   └── robots.ts         # Search engine indexing rules
│   ├── components/           # Modular UI Components
│   │   ├── admin/            # Admin Sidebar & Dashboard Navigation
│   │   ├── notifications/    # NotificationBellDropdown, NotificationListener, Permission Modal
│   │   ├── shared/           # Header, Footer, Language Modal, Hydrators
│   │   └── ui/               # Tailored UI Primitives (Button, Badge)
│   ├── lib/                  # Core Utilities & Security Libraries
│   │   ├── auth.ts           # Web Crypto HMAC-SHA256 Session Engine
│   │   ├── firebase/         # Client-side Firebase App & Messaging SDK
│   │   ├── notifications/    # Server-side Firebase Admin Push SDK
│   │   ├── password.ts       # Native scrypt Salt & Hash logic
│   │   ├── rate-limit.ts     # Sliding window rate limiter & KV cloud adapter
│   │   ├── sanitizer.ts      # HTML Entity XSS Protection Engine
│   │   └── generate-receipt-pdf.ts # PDF Receipt Export Generator
│   ├── store/                # Zustand State Stores (Auth, Booking, Notification, Language, Settings)
│   ├── types/                # TypeScript Interfaces & Definitions
│   └── validators/           # Zod Input Validation Schemas
├── .env                      # Local Environment Variables
├── next.config.ts            # Next.js Configuration & Security Headers
├── package.json              # Project Dependencies & Build Scripts
└── tsconfig.json             # TypeScript Compiler Configuration
```

---

## 🔒 Security & Quality Audit Metrics

| Security / Quality Dimension | Benchmark Result | Implementation Detail |
| :--- | :---: | :--- |
| **Password Storage** | **100% Salted `scrypt`** | 16-byte random salts with `timingSafeEqual()` constant-time verification |
| **Session Security** | **HMAC-SHA256 Tokens** | Signed via Web Crypto API with `httpOnly`, `sameSite: lax`, and `secure` flags |
| **Session Destruction** | **Explicit Cookie Wipe** | MaxAge: 0 & Expires: 1970 set on `/api/auth/logout` |
| **XSS Protection** | **HTML Entity Escaping** | Input strings sanitized to neutralize script injection & event handlers |
| **Multi-Tenant Isolation** | **Strict Scoped Queries** | Customer records strictly filtered by user ID at database layer |
| **Build & Quality Status** | **0 Errors / 0 Warnings** | `npm run build` static pre-renders 26/26 routes cleanly |

---

## ⚡ Quick Start & Local Development

### 1. Prerequisites
- **Node.js** v20.0.0 or higher
- **npm** v10.0.0 or higher
- **MySQL** or **PostgreSQL** database server

### 2. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MohitShukla2024/Arti-air-con-booking.git
   cd Arti-air-con-booking
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**  
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/arti_ac_con"
   SESSION_SECRET="your-at-least-32-character-session-secret-key"
   NEXTAUTH_SECRET="your-at-least-32-character-nextauth-secret-key"

   NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="artiaircon-96905"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

   FIREBASE_PROJECT_ID="artiaircon-96905"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@artiaircon-96905.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   ```

4. **Sync Database Schema:**
   ```bash
   npx prisma db push
   ```

5. **Start Local Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 🌐 Production Deployment Guide (Vercel)

1. **Push source code to your GitHub Repository.**
2. **Import project into [Vercel](https://vercel.com).**
3. **Configure Production Environment Variables:**
   - Set `DATABASE_URL` to your production cloud database URL (e.g. Aiven / PlanetScale / Railway / Supabase).
   - Set `SESSION_SECRET`, `NEXTAUTH_SECRET`, and Firebase keys.
4. **Deploy Project!** Next.js Turbopack will compile the production bundle and deploy to Vercel Edge locations globally.

---

## 📜 Available NPM Scripts

- `npm run dev`: Starts local Next.js development server with Turbopack.
- `npm run build`: Compiles production build and pre-renders static pages (**26/26 routes**).
- `npm run start`: Starts production Node.js server.
- `npm run lint`: Runs ESLint code quality audit (**0 errors, 0 warnings**).
- `npm run db:push`: Pushes Prisma schema to target database.
- `npm run db:generate`: Regenerates Prisma Client types.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more details.

---
**Built with ❄️ for Arti Air Con Services.**
