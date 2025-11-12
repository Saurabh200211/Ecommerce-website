# Ecommerce Backend (Express + MongoDB)

## Setup
1. Copy `.env.example` to `.env` and set values (MONGO_URI, JWT_SECRET)
2. Install
   npm install
3. Seed sample data (optional)
   npm run seed
4. Run (dev)
   npm run dev
   or
   npm start

API base: http://localhost:5000/api

Auth:
POST /api/auth/register  { name, email, password }
POST /api/auth/login     { email, password } -> returns token

Products:
GET /api/products
GET /api/products/:id
POST /api/products       (admin)
PUT /api/products/:id    (admin)
DELETE /api/products/:id (admin)

Cart (authenticated):
GET /api/cart
POST /api/cart  { productId, qty }
PUT  /api/cart  { productId, qty }  // qty = 0 to remove
DELETE /api/cart // clear cart

Orders (authenticated):
POST /api/orders  { shippingAddress, paymentMethod } // reads items from cart
GET /api/orders/my-orders
GET /api/orders/:id
Admin:
GET /api/orders
PUT /api/orders/:id/status

