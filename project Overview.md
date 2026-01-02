# Inventory & POS System - Documentation

## Project Overview
A modern, production-ready SaaS Inventory and POS system built with Next.js 16, MongoDB, and Tailwind CSS. Designed for retail stores, minimarts, and small businesses to track stock, manage sales, and checkout customers efficiently.

## Features Built
- **Landing Page**: Enterprise-grade SaaS landing page with Hero, Features, How It Works, and CTAs.
- **Authentication**: JWT-based secure auth with role-based access (Owner, Manager, Cashier).
- **POS Terminal**: Real-time checkout with barcode support, cart management, and payment processing.
- **Inventory Management**: Real-time stock tracking, automated alerts, and detailed activity logs.
- **Product Management**: Full CRUD operations with barcode/SKU generation and supplier tracking.
- **Reports Dashboard**: Sales analytics, revenue trends, top products, and performance metrics.
- **Audit Logs**: System-wide activity tracking for security and compliance.

## Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB (via `mongodb` and `mongoose` models)
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **Auth**: Custom JWT session management with BCrypt
- **Icons**: Lucide React
- **Validation**: Zod for schema and form validation

## File Structure
- `app/`: Route handlers and page components
- `components/landing/`: Landing page specific components
- `components/pos/`, `components/inventory/`, etc.: Feature-specific UI
- `lib/db/`: MongoDB connection and Mongoose models
- `lib/actions/`: Server Actions for database operations
- `lib/auth/`: Authentication logic and middleware

## Getting Started
1. Ensure MongoDB is running and set `MONGODB_URI` environment variable.
2. Set `JWT_SECRET` for session security.
3. First registered user will be assigned the `OWNER` role.
