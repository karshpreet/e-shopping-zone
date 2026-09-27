# E-Shopping Zone – E-Cart Management System

A complete, production-grade microservices e-commerce application developed with **Java 8**, **Spring Boot 2.7.18**, **Spring Cloud 2021.0.8 (Jubilee)**, **MySQL**, and **React + TypeScript (Vite)**.

---

## 🏛️ System Architecture

```
React Frontend (Vite :5173)
        │
        ▼ (REST / JSON)
API Gateway (Spring Cloud Gateway :8080)
        │
        ▼ (Discovery & Dynamic Routing)
Eureka Discovery Server (:8761)
        │
        ├── Profile Service  (:8081) ──► eshop_profile_db (MySQL)
        ├── Product Service  (:8082) ──► eshop_product_db (MySQL)
        ├── Cart Service     (:8083) ──► eshop_cart_db    (MySQL)
        ├── Order Service    (:8084) ──► eshop_order_db   (MySQL)
        └── Wallet Service   (:8085) ──► eshop_wallet_db  (MySQL)
```

---

## 🚀 Port Allocation & Service Map

| Service Name | Port | Description |
|---|---|---|
| **`eureka-server`** | `8761` | Netflix Eureka Service Discovery Registry & Dashboard |
| **`api-gateway`** | `8080` | Spring Cloud Gateway (Reverse proxy, CORS, Route Locator) |
| **`profile-service`**| `8081` | User authentication (BCrypt, JWT), Customer & Merchant profiles |
| **`product-service`**| `8082` | Product catalog, Categories, Inventory stock tracking |
| **`cart-service`** | `8083` | Shopping cart management & RestTemplate product sync |
| **`order-service`** | `8084` | Checkout orchestration (Wallet / COD) & fulfillment |
| **`wallet-service`** | `8085` | Virtual wallet balances, transactions ledger, payments |
| **`frontend`** | `5173` | React 18 + TypeScript + Vite responsive web application |

---

## 🔑 Pre-seeded Demo Credentials

| Role | Username / Email | Password | Initial State |
|---|---|---|---|
| **Customer** | `customer@eshop.com` | `password123` | Active cart, Preloaded Wallet with ₹5,000 / $500 balance |
| **Merchant** | `merchant@eshop.com` | `password123` | Product management & Order fulfillment access |

---

## 🗄️ Database Setup (MySQL)

Execute the initialization script in `sql/init-databases.sql`:
```bash
mysql -u root -p < sql/init-databases.sql
```
This initializes the 5 logical microservice schemas and seeds 20 realistic products across 6 categories (`Electronics`, `Books`, `Apparel`, `Personal Care`, `Home & Kitchen`, `Sports & Fitness`).

---

## 🛠️ Technology Stack & Versions

- **Java**: `1.8 (Java 8)`
- **Spring Boot**: `2.7.18` (Compatible with Java 8)
- **Spring Cloud**: `2021.0.8` (Jubilee)
- **Service Registry**: Spring Cloud Netflix Eureka
- **Gateway**: Spring Cloud Gateway
- **ORM / Persistence**: Spring Data JPA / Hibernate
- **Database**: MySQL 8.x
- **Inter-service**: `@LoadBalanced RestTemplate`
- **Frontend**: React 18, TypeScript, Vite, React Router 6, Axios, Lucide Icons
