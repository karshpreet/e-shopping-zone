-- =============================================================================
-- E-Shopping Zone – E-Cart Management System
-- MySQL Initial Schema and Seed Data Script
-- =============================================================================

CREATE DATABASE IF NOT EXISTS eshop_profile_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS eshop_product_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS eshop_cart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS eshop_order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS eshop_wallet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 1. Profile Service Tables & Seed Data
-- -----------------------------------------------------------------------------
USE eshop_profile_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100),
    phone_number VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- BCrypt hash for "password123": $2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW
INSERT INTO users (id, username, email, password_hash, role, active) VALUES
(1, 'customer', 'customer@eshop.com', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'CUSTOMER', TRUE),
(2, 'merchant', 'merchant@eshop.com', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'MERCHANT', TRUE)
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO profiles (id, user_id, full_name, phone_number, address_line1, address_line2, city, state, postal_code, country) VALUES
(1, 1, 'John Customer', '+91 9876543210', '104 Silicon Valley Heights', 'MG Road', 'Bengaluru', 'Karnataka', '560001', 'India'),
(2, 2, 'Apex Retailers', '+91 9123456780', '502 Tech Hub Square', 'Outer Ring Road', 'Bengaluru', 'Karnataka', '560103', 'India')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- -----------------------------------------------------------------------------
-- 2. Product Service Tables & Seed Data
-- -----------------------------------------------------------------------------
USE eshop_product_db;

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    category_id BIGINT NOT NULL,
    image_url VARCHAR(500),
    merchant_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO categories (id, name, description, icon_name) VALUES
(1, 'Electronics', 'Smartphones, laptops, accessories, and consumer gadgets', 'Laptop'),
(2, 'Books', 'Fiction, non-fiction, academic literature, and self-help', 'BookOpen'),
(3, 'Apparel', 'Modern men, women, and kids fashion wear and shoes', 'Shirt'),
(4, 'Personal Care', 'Skincare, grooming kits, wellness, and hygiene items', 'Sparkles'),
(5, 'Home & Kitchen', 'Cookware, modern appliances, and interior decor', 'Home'),
(6, 'Sports & Fitness', 'Gym equipment, outdoor gear, and athletic wear', 'Dumbbell')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO products (id, name, description, price, stock_quantity, category_id, image_url, merchant_id, active) VALUES
(1, 'Apple MacBook Air M2 (16GB, 512GB)', 'Stunning 13.6-inch Liquid Retina Display, 18 hours battery life, fast M2 chip.', 1199.00, 25, 1, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(2, 'Sony WH-1000XM5 Noise Canceling Headphones', 'Industry-leading noise cancelation, 30 hours battery, ultra-comfortable lightweight design.', 348.00, 40, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(3, 'Samsung Galaxy S24 Ultra (256GB)', 'Dynamic AMOLED 2X with AI features, 200MP camera, Snapdragon 8 Gen 3.', 1299.99, 18, 1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(4, 'Logitech MX Master 3S Wireless Mouse', 'Quiet clicks, 8K DPI any-surface sensor, ergonomic design for professionals.', 99.00, 50, 1, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(5, 'Designing Data-Intensive Applications', 'The definitive guide to architecture and reliable distributed software systems by Martin Kleppmann.', 45.00, 35, 2, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(6, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Legendary software design guide by Robert C. Martin (Uncle Bob).', 39.50, 30, 2, 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(7, 'Atomic Habits by James Clear', 'An easy and proven way to build good habits and break bad ones.', 22.00, 60, 2, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(8, 'The Pragmatic Programmer: 20th Anniversary Edition', 'Your journey to software mastery by David Thomas and Andrew Hunt.', 48.00, 20, 2, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(9, 'Premium Organic Cotton Oxford Shirt', 'Tailored fit, breathable premium fabric suitable for office and casual meetings.', 55.00, 45, 3, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(10, 'Levi Strauss Original 501 Straight Fit Jeans', 'Classic all-cotton denim with timeless signature styling.', 69.90, 32, 3, 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(11, 'Nike Air Zoom Pegasus 40 Running Shoes', 'Responsive cushioning and breathable mesh for running and everyday comfort.', 125.00, 28, 3, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(12, 'Waterproof Urban Commuter Backpack (25L)', 'Padded laptop compartment, anti-theft zipper, water-resistant exterior.', 79.00, 40, 3, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(13, 'CeraVe Hydrating Facial Cleanser (473ml)', 'With ceramides & hyaluronic acid, cleanses and restores skin barrier.', 16.50, 75, 4, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(14, 'Philips Norelco Multi-Groomer 7000', 'All-in-one stainless steel precision beard and body grooming kit.', 59.99, 35, 4, 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(15, 'La Roche-Posay Anthelios SPF 60 Sunscreen', 'Broad-spectrum fast absorbing dry-touch sun defense.', 29.99, 50, 4, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(16, 'DeLonghi Dedica Deluxe Espresso Maker', 'Compact 15-bar stainless steel professional pump espresso & cappuccino machine.', 299.95, 15, 5, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(17, 'Cast Iron Pre-Seasoned Dutch Oven (6 Quart)', 'Even heat distribution for searing, baking artisan breads, and braising.', 85.00, 22, 5, 'https://images.unsplash.com/photo-1584990347449-399676e82a93?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(18, 'Minimalist Ceramic Pour-Over Coffee Dripper Set', 'Includes v60 ceramic cone, heat-resistant glass carafe, and 100 filter papers.', 38.00, 40, 5, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(19, 'Adjustable Dumbbell Set (5 - 52.5 lbs)', 'Space-efficient selectorized dumbbells for high-intensity home workouts.', 379.00, 12, 6, 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=600&auto=format&fit=crop&q=80', 2, TRUE),
(20, 'Manduka PRO High-Density Yoga Mat (6mm)', 'Unmatched cushioning, slip-free grip, and sustainable high-performance surface.', 118.00, 25, 6, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80', 2, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- -----------------------------------------------------------------------------
-- 3. Cart Service Tables
-- -----------------------------------------------------------------------------
USE eshop_cart_db;

CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 4. Order Service Tables
-- -----------------------------------------------------------------------------
USE eshop_order_db;

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    order_status VARCHAR(30) NOT NULL,
    shipping_address TEXT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    wallet_transaction_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 5. Wallet Service Tables & Seed Data
-- -----------------------------------------------------------------------------
USE eshop_wallet_db;

CREATE TABLE IF NOT EXISTS wallets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    wallet_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    reference_id VARCHAR(100),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_tx_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

-- Initial balance of 5000.00 for Customer (User ID 1)
INSERT INTO wallets (id, user_id, balance, currency, status) VALUES
(1, 1, 5000.00, 'INR', 'ACTIVE')
ON DUPLICATE KEY UPDATE balance=VALUES(balance);

INSERT INTO wallet_transactions (id, transaction_id, wallet_id, user_id, amount, type, status, reference_id, description) VALUES
(1, 'TXN-INIT-1001', 1, 1, 5000.00, 'CREDIT', 'SUCCESS', 'SIGNUP-BONUS', 'Initial welcome credit for testing and evaluation')
ON DUPLICATE KEY UPDATE transaction_id=VALUES(transaction_id);
