# PrintJack - Custom Printing E-commerce Platform

A full-stack MERN ecommerce platform for custom printing services, similar to PrintStop.co.in. Users can select products, upload/create designs using an advanced canvas editor, customize products, and order with payment through Razorpay.

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS + Fabric.js (design editor)
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Auth**: JWT + Google OAuth + OTP (Email/SMS)
- **Payments**: Razorpay (UPI, Cards, Netbanking, Wallets)
- **Storage**: Cloudinary (images/files)
- **State**: Zustand + React Context
- **Charts**: Chart.js + react-chartjs-2
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Project Structure
```
printjack/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   ├── admin/    # Admin dashboard components
│   │   │   ├── auth/     # Auth forms
│   │   │   ├── blog/     # Blog components
│   │   │   ├── cart/     # Cart components
│   │   │   ├── checkout/ # Checkout components
│   │   │   ├── common/   # Shared components
│   │   │   ├── dashboard/# User dashboard components
│   │   │   ├── editor/   # Fabric.js design editor
│   │   │   ├── layout/   # Navbar, Footer, Sidebar
│   │   │   ├── marketing/# Marketing components
│   │   │   └── products/ # Product components
│   │   ├── context/      # React Context (Auth, Cart)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   │   ├── admin/    # Admin dashboard pages
│   │   │   ├── auth/     # Login, Register, etc.
│   │   │   ├── blog/     # Blog pages
│   │   │   ├── cart/     # Cart page
│   │   │   ├── checkout/ # Checkout flow
│   │   │   ├── dashboard/# User dashboard
│   │   │   ├── editor/   # Design editor
│   │   │   └── products/ # Product listing/detail
│   │   ├── styles/       # CSS files
│   │   ├── utils/        # Helpers, API, constants
│   │   ├── App.jsx       # Main app with routes
│   │   └── main.jsx      # Entry point
│   └── package.json
├── server/               # Express backend
│   ├── src/
│   │   ├── config/       # DB, Cloudinary, Razorpay, SMTP
│   │   ├── controllers/  # Route handlers (14 controllers)
│   │   ├── middleware/    # Auth, upload, validation, errors
│   │   ├── models/       # Mongoose models (12 models)
│   │   ├── routes/       # API routes (14 route files)
│   │   ├── seeds/        # Database seed data
│   │   ├── services/     # Email, SMS, Razorpay services
│   │   └── utils/        # Helpers, validators, Cloudinary
│   ├── uploads/          # Local file uploads
│   ├── .env.example      # Environment variables template
│   └── package.json
└── AGENTS.md             # This file
```

## Development Commands

### Backend
```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Seed database
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

### Frontend
```bash
# Navigate to client
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Run Both
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## Required Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `SMTP_USER` | Email for sending notifications |
| `SMTP_PASS` | Email app password |
| `TWILIO_SID` | Twilio account SID (for SMS OTP) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (search, filter, paginate)
- `GET /api/products/featured` - Featured products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create (admin)
- `PUT /api/products/:id` - Update (admin)
- `DELETE /api/products/:id` - Delete (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - My orders
- `GET /api/orders` - All orders (admin)
- `PUT /api/orders/:id/status` - Update status (admin)
- `PUT /api/orders/:id/approve-design` - Approve design (admin)

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Razorpay webhook

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/item/:itemId` - Update cart item
- `DELETE /api/cart/item/:itemId` - Remove item
- `POST /api/cart/coupon` - Apply coupon

### Design Editor
- `POST /api/designs` - Save design
- `GET /api/designs/my` - My designs
- `PUT /api/designs/:id/submit` - Submit for print
- `PUT /api/designs/:id/approve` - Approve (admin)

## Default Admin Login
- **Email**: admin@printjack.in
- **Password**: Admin@123

## Key Features
1. **Advanced Design Editor** - Fabric.js-based canvas with layers, text, images, clipart, shapes, undo/redo, keyboard shortcuts, zoom, grid, print area boundaries
2. **Product Customization** - Upload own design or create from scratch with 30+ fonts, clipart library, design templates
3. **Admin Approval Workflow** - All designs reviewed before printing
4. **Razorpay Payments** - UPI, Cards, Netbanking, Wallets, COD
5. **Bulk Pricing** - Tiered pricing based on quantity
6. **Order Tracking** - Real-time order status with timeline
7. **Referral Program** - Earn rewards for referring friends
8. **Loyalty Points** - Points on every purchase
9. **Blog** - SEO-optimized blog with categories and tags
10. **Responsive Design** - Works perfectly on mobile, tablet, desktop
