# Food Delivery Platform - Frontend Application

Next.js 15 App Router web client for the Food Delivery Platform.

## Technology Stack
- **Next.js 15 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State management: `authStore`, `cartStore`, `notificationStore`)
- **Axios** (API client with JWT bearer interceptor)
- **React Hook Form & Zod** (Form validation)
- **Lucide React** (Modern icons)
- **STOMP.js & SockJS Client** (Real-time WebSocket event listeners)

## Environment Variables
Configured in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
```

## Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build for production:
   ```bash
   npm run build
   ```
3. Run the application:
   ```bash
   npm run start
   ```
   Or for development hot-reloading:
   ```bash
   npm run dev
   ```
4. Access at `http://localhost:3000`.

## Quick Demo Credentials
The login page (`/login`) includes 1-click login buttons for all 4 roles:
- **Customer**: `customer@gmail.com` / `customer123`
- **Restaurant Owner**: `owner@gmail.com` / `owner123`
- **Driver**: `driver@gmail.com` / `driver123`
- **Admin**: `admin@gmail.com` / `admin123`
