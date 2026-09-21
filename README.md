<div align="center">

# 🍔 Cravery — Enterprise Food Delivery Platform

**A production-grade, full-stack food delivery platform built for modern on-demand delivery.**

[![Java](https://img.shields.io/badge/Java-25-orange?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-mobile-02569B?logo=flutter&logoColor=white)](https://flutter.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-6+-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## 📖 Overview

**Cravery** is a production-style, full-stack food delivery platform inspired by modern on-demand delivery systems such as Foodpanda and GrabFood. It is designed with a **modular-monolithic architecture** and supports four distinct user personas:

| Persona | Description |
| :--- | :--- |
| 🛒 **Customer** | Discover restaurants, order food, track deliveries in real time |
| 🏪 **Restaurant Owner** | Manage menus, process orders, run promotional campaigns |
| 🛵 **Driver** | Accept jobs, navigate deliveries, simulate GPS movement |
| 🛡️ **Admin** | Moderate merchants, verify drivers, view platform-wide analytics |

> ⚠️ This project is strictly configured to run **natively on the host machine** — no Docker required.

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Java** | 25 (`temurin-25.jdk`) | Core language |
| **Spring Boot** | 3.4.3 | Application framework |
| **Spring Security + JWT** | — | Access Token + Refresh Token auth flow |
| **Spring Data JPA + Hibernate** | — | ORM & database access |
| **PostgreSQL** | 14+ | Primary relational database |
| **Redis** | 6+ | Caching & real-time driver coordinate storage |
| **WebSocket (STOMP/SockJS)** | — | Live order tracking & push notifications |
| **Lombok** | 1.18.38 | Boilerplate reduction |
| **JUnit 5 + Mockito** | — | Unit testing (15 tests, 0 failures) |
| **SpringDoc OpenAPI / Swagger** | — | Interactive API documentation |

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | 15 (App Router) | React-based web framework |
| **TypeScript** | — | Type-safe development |
| **Tailwind CSS** | — | Glassmorphism design system |
| **Axios** | — | HTTP client with JWT interceptor |
| **Zustand** | — | Global state (`authStore`, `cartStore`, `notificationStore`) |
| **React Hook Form + Zod** | — | Form validation |
| **STOMP.js + SockJS** | — | Real-time WebSocket listeners |
| **Lucide React** | — | Modern icon library |

### Mobile
| Technology | Purpose |
| :--- | :--- |
| **Flutter (Dart)** | Cross-platform mobile app (iOS & Android) |

---

## 📐 Architecture

```
food_delivery_platform/
├── backend/              # Spring Boot REST API + WebSocket server
│   └── src/main/java/
│       └── com/example/fooddelivery/
│           ├── auth/         # JWT authentication & role management
│           ├── restaurant/   # Restaurant & menu management
│           ├── order/        # Order lifecycle & status pipeline
│           ├── cart/         # Shopping cart with restaurant lock
│           ├── driver/       # Driver dispatch & GPS tracking
│           ├── admin/        # Platform moderation & analytics
│           └── coupon/       # Voucher & discount engine
├── frontend/             # Next.js 15 web app (App Router)
│   └── src/app/
│       ├── (customer)/   # Customer browsing & checkout
│       ├── restaurant/   # Owner portal
│       ├── driver/       # Driver dispatch portal
│       └── admin/        # Admin management console
└── mobile/               # Flutter mobile app (cravery_customer)
```

---

## ✨ Features

### 🛒 Customer Experience
- **Restaurant & Cuisine Discovery** — instant search with debounce, category filters (Fast Food, Asian, Pizza, Drinks, etc.), minimum rating filters
- **Menu Browsing & Cart Lock** — browse dishes by category, dish image previews, single-restaurant cart enforcement
- **Vouchers & Discounts** — percentage discounts (with max cap) and fixed-amount coupon support
- **Checkout & Address Book** — saved address management, order instructions, payment mode toggle (Cash on Delivery / Online Payment)
- **Live Order Tracking Pipeline** — visual step-by-step pipeline:
  `PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED`
- **Real-time GPS Tracking** — live simulated driver coordinates, vehicle info, and call-to-driver link
- **Post-Delivery Ratings & Reviews** — star rating (1–5) and written feedback

### 🏪 Restaurant Owner Portal (`/restaurant/dashboard`)
- **Kitchen KPIs** — Today's orders, gross revenue, pending orders, average rating
- **Live Order Management** — Accept / Reject → Start Cooking → Mark Ready for Pickup (triggers nearest-driver assignment)
- **Menu & Dish Catalog** — Create dishes with prep times, prices, and instant stock toggle (`In Stock` / `Sold Out`)
- **Promotions Engine** — Launch limited-time discount campaigns

### 🛵 Driver Dispatch Portal (`/driver/dashboard`)
- **Online / Offline Toggle** — live availability switch to receive nearby orders
- **Earnings & Metrics** — real-time summary of completed trips and daily wallet payouts
- **Job Queue** — available deliveries with amounts and payout info
- **Active Delivery Flow** — Pick Up → Out for Delivery → Confirm Delivered
- **Interactive GPS Simulator** — simulate movement along route with WebSocket broadcast to customer screens

### 🛡️ Admin Management Console (`/admin/dashboard`)
- **Platform KPIs** — Total customers, restaurants, drivers, lifetime GMV, monthly/daily volume
- **Merchant Moderation** — Approve, reject, or suspend restaurants
- **Fleet Verification** — Review driver license, vehicle plate, authorize delivery partners
- **Orders Ledger** — Audit cross-merchant orders and fulfillment statuses
- **Category & Coupon Management** — Configure platform-wide promo vouchers and cuisine categories

---

## ⚙️ Local Setup (No Docker)

### Prerequisites

| Requirement | Version |
| :--- | :--- |
| Java (Temurin) | 21 or 25 |
| Node.js + npm | 18+ |
| PostgreSQL | 14+ (running on `localhost:5432`) |
| Redis | 6+ (running on `localhost:6379`) |
| Flutter SDK | Latest stable |

```bash
# Start Redis (macOS)
brew services start redis
```

---

### 1. Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE food_delivery;
```

> Hibernate `ddl-auto: update` will automatically create all tables on first launch.
> `DataInitializer.java` will seed demo users, restaurants, menu items, and coupons automatically.

---

### 2. Backend Configuration

Copy the example environment file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DB_URL=jdbc:postgresql://localhost:5432/food_delivery
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_256_bit_hex_secret
JWT_ACCESS_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

REDIS_HOST=localhost
REDIS_PORT=6379

FRONTEND_URL=http://localhost:3000

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

> 💡 Generate a secure JWT secret with: `openssl rand -hex 32`

---

### 3. Backend Run

```bash
cd backend

# Run unit tests
mvn test

# Package and run
mvn clean package -DskipTests
java -jar target/food-delivery-backend-1.0.0.jar
```

Backend runs at → `http://localhost:8080`  
Swagger UI → `http://localhost:8080/swagger-ui/index.html`

---

### 4. Frontend Configuration

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
```

---

### 5. Frontend Run

```bash
cd frontend
npm install
npm run dev     # Development server with hot reload
# or
npm run build && npm run start  # Production build
```

Frontend runs at → `http://localhost:3000`

---

### 6. Mobile Run (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

---

## 🔐 Demo Accounts

> ⚠️ These accounts are auto-seeded by `DataInitializer.java` for **local development only**.  
> **Do not use these credentials in production.**

The login page (`http://localhost:3000/login`) includes **1-Click Quick Fill Buttons** for all roles:

| Role | Email | Password | Portal |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@gmail.com` | `customer123` | `/` |
| **Restaurant Owner** | `owner@gmail.com` | `owner123` | `/restaurant/dashboard` |
| **Driver** | `driver@gmail.com` | `driver123` | `/driver/dashboard` |
| **Admin** | `admin@gmail.com` | `admin123` | `/admin/dashboard` |

---

## 📡 Key API Endpoints

Full interactive docs available at `http://localhost:8080/swagger-ui/index.html`

### Auth & Users
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register as customer, owner, or driver |
| `POST` | `/api/auth/login` | Login — returns JWT access + refresh tokens |
| `GET` | `/api/users/me` | Get current user profile |
| `GET` | `/api/addresses` | Get saved delivery addresses |

### Restaurants & Menus
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/restaurants` | Filterable restaurant catalog (Redis cached) |
| `GET` | `/api/restaurants/{id}` | Restaurant detail with opening hours |
| `GET` | `/api/restaurants/{id}/menu-categories` | Menu categories |
| `GET` | `/api/restaurants/{id}/foods` | Dishes for a restaurant |
| `GET` | `/api/foods/popular` | Trending dishes (Redis cached) |

### Cart & Orders
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cart` | Get current shopping basket |
| `POST` | `/api/cart/items` | Add dish with quantity (single-restaurant lock) |
| `POST` | `/api/orders` | Place order with address, coupon, payment method |
| `GET` | `/api/orders/{id}` | Order status + live driver coordinates |
| `PATCH` | `/api/orders/{id}/cancel` | Cancel order (if still pending) |

### Kitchen & Driver Workflow
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `PATCH` | `/api/restaurant/orders/{id}/status` | Owner pipeline (`CONFIRMED → PREPARING → READY`) |
| `GET` | `/api/driver/deliveries/available` | Available delivery jobs queue |
| `POST` | `/api/driver/deliveries/{id}/accept` | Driver accepts job |
| `POST` | `/api/driver/deliveries/{id}/pickup` | Food picked up |
| `POST` | `/api/driver/deliveries/{id}/start-delivering` | En route to customer |
| `POST` | `/api/driver/deliveries/{id}/complete` | Delivery complete |
| `POST` | `/api/driver/location` | Update GPS in Redis + broadcast via WebSocket |

### WebSocket Topics
| Topic | Description |
| :--- | :--- |
| `/topic/deliveries/{orderId}` | Live driver GPS coordinates to customer |
| `/topic/orders/{userId}` | Order status push notifications |
| `/topic/restaurant/{restaurantId}` | New order alerts to restaurant kitchen |

---

## 🧪 Automated Testing

The backend suite contains **15 unit tests** covering core business logic:

| Test Class | Coverage |
| :--- | :--- |
| `AuthServiceTest` | Registration, email uniqueness, password encryption, JWT generation |
| `CartServiceTest` | Cart creation, restaurant lock enforcement, quantity recalculation |
| `CouponServiceTest` | Percentage discount (with max cap), fixed amount, minimum order threshold |
| `OrderStatusTest` | State transition validation |
| `GeoUtilsTest` | Haversine formula for nearest driver distance |

```bash
cd backend
mvn test
# Result: Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
```

---

## 🔒 Security Notes

- All API endpoints (except `/api/auth/**`) require a valid **JWT Bearer token**
- Passwords are hashed using **BCrypt** before storage
- JWT secrets and database credentials **must** be supplied via environment variables — never hardcoded
- The `.env` and `.env.local` files are listed in `.gitignore` and will **never be committed**
- CORS is restricted to `FRONTEND_URL` defined in your environment

---

## 📄 License

This project is licensed under the **MIT License**.  
See [LICENSE](./LICENSE) for full details.

---

<div align="center">

Built with ❤️ using Spring Boot, Next.js, and Flutter

</div>
