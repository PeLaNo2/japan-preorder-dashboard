# ZenPreOrder — Japan Pre-Order Business Dashboard

**All-in-one business operating system for your Japan pre-order company.** Track sales, costs, and profits in JPY and THB with live exchange rates. Built for you and your co-founders to run the business from anywhere — phone or laptop.

---

## Features

### 📊 Executive Dashboard
- **4 KPI stat cards** — Total Revenue (THB), Total Profit (THB), Total Orders, Avg Order Value — all at a glance
- **30-day Revenue & Profit chart** — Line chart showing daily revenue and profit trends
- **Top 5 selling products** — Ranked by units sold with total profit contribution
- **Recent 5 orders** — Quick-access links to latest orders with status and amount
- **JPY ↔ THB dual display** — Revenue shown in THB (primary) with JPY equivalent below

### 📦 Product Management
- **Full product catalog** — Add, edit, search products by name or SKU
- **JPY cost & price tracking** — Your purchase cost and selling price in Japanese Yen
- **Auto-calculated margin** — Profit margin percentage computed live as you type
- **Stock management** — Track inventory levels per product
- **Category organization** — Group products by SNACKS, SKINCARE, STATIONERY, DRINKS, OTHER
- **Sales count tracking** — Each product tracks total units sold across all orders
- **Mobile-friendly views** — Searchable table on desktop, card grid on phone

### 📋 Order Management
- **Multi-item order creation** — Add multiple products per order with quantities
- **Live product search** — Searchable dropdown with name, SKU, and price display
- **Real-time order summary** — See subtotal, costs, and estimated profit (JPY) as you build
- **Auto-calculated THB values** — Server converts all JPY amounts using live exchange rate on order creation
- **Per-item profit breakdown** — Every order line shows cost, price, and profit in both JPY and THB
- **Order status workflow** — PENDING → CONFIRMED → SHIPPED → DELIVERED with status update buttons
- **Order numbering** — Auto-generated `ORD-YYYYMMDD-XXXX` format for easy reference
- **Historical accuracy** — All monetary values snapshotted at order creation time (prices never change retroactively)
- **Stock auto-decrement** — Product stock and sales count updated automatically in a database transaction
- **Printable order view** — Print-friendly order detail page
- **Filterable order list** — Browse all orders, filterable by status

### 💱 Exchange Rate Engine
- **Live JPY/THB rates** — Fetched from exchangerate-api.com (free, no API key needed)
- **Auto-refresh** — Automatically fetches fresh rate if current one is > 1 hour old
- **Manual override** — Set custom rates when needed (e.g., for budgeting scenarios)
- **Rate history** — Full record of all rates used, with API vs manual source labels
- **Per-order pinning** — Each order records the exchange rate used at creation time for accurate historical profit

### 📈 Analytics & Demand Prediction
- **Top sellers ranking** — Products ranked by units sold, with total profit contribution
- **Sales frequency tracking** — See which products sell most frequently
- **Inventory insights** — Stock levels visible alongside sales velocity
- **Profit margin analysis** — Per-product margin percentage with color coding (green/amber/red)
- **Revenue over time** — 30-day trend data to spot demand patterns

### 🔐 Authentication
- **Google OAuth** — Sign in with your Google account
- **Email whitelist** — Only your 3 co-founders' emails can access the dashboard
- **Role-based access** — Auto-creates user accounts on first login

### 📱 Mobile Experience
- **Bottom tab navigation** — Dashboard, Products, Orders, Settings always accessible
- **Card-based layouts** — Products and orders displayed as touch-friendly cards
- **Responsive forms** — All CRUD operations work on phone screens
- **Touch-optimized** — Everything works with thumbs on a phone

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React — frontend + API in one project |
| **Auth** | Auth.js (NextAuth v5) + Google OAuth | Email whitelist in 5 lines of config |
| **Database** | PostgreSQL via [Neon](https://neon.tech) | Serverless, **$0/mo** free tier (0.5GB) |
| **ORM** | Prisma 7 with Neon adapter | Type-safe, auto-generated migrations |
| **UI** | Tailwind CSS | Rapid, mobile-first styling |
| **Charts** | Recharts | Responsive, composable React charts |
| **Icons** | Lucide React | Clean, consistent icon set |
| **Notifications** | Sonner | Lightweight toast notifications |
| **Exchange Rate** | [exchangerate-api.com](https://exchangerate-api.com) | Free tier, no API key needed |
| **Hosting** | [Vercel](https://vercel.com) | Next.js-native, **$0/mo** free tier |
| **Total Cost** | **$0/month** | All services have generous free tiers |

---

## Prerequisites

- **Node.js** 20+ and **pnpm** (`npm install -g pnpm`)
- **Neon PostgreSQL** — Sign up free at [neon.tech](https://neon.tech), create a database
- **Google OAuth credentials** — Create at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — OAuth client ID for Web application, add redirect URI `http://localhost:3000/api/auth/callback/google`

---

## Quick Start (Local)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd japan-preorder-dashboard
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your credentials (see below)

# 3. Run database migration
pnpm prisma migrate dev --name init

# 4. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

### Environment Variables

```env
# From Neon dashboard → connection string
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/zenpreorder?sslmode=require"

# Generate with: openssl rand -base64 32
AUTH_SECRET="your-random-secret-at-least-32-chars"

# From Google Cloud Console → OAuth 2.0 Client IDs
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-client-secret"

# Your 3 co-founders' emails, comma-separated
ALLOWED_EMAILS="alice@gmail.com,bob@gmail.com,charlie@gmail.com"
```

---

## Deploy to Production (Vercel)

1. **Push to GitHub** — Create a repo and push this project
2. **Set up Neon** — Create a database on [neon.tech](https://neon.tech) (free tier), copy the connection string
3. **Import to Vercel** — Go to [vercel.com/new](https://vercel.com/new), import your GitHub repo — Vercel auto-detects Next.js
4. **Add environment variables** in Vercel dashboard → your project → Settings → Environment Variables:
   - `DATABASE_URL` (from Neon)
   - `AUTH_SECRET` (run `openssl rand -base64 32`)
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
   - `ALLOWED_EMAILS` (comma-separated)
5. **Add Google OAuth redirect URI** — In Google Cloud Console, add your Vercel domain: `https://your-app.vercel.app/api/auth/callback/google`
6. **Deploy** — Vercel builds and deploys automatically. Your database migration runs on first deploy.

**Cost: $0/month** — Vercel free tier + Neon free tier + free exchange rate API.

---

## How It Works

### Order Profit Calculation Flow

```
Customer places order
  ↓
You select products and quantities
  ↓
Server fetches latest JPY/THB exchange rate
  (auto-refreshes if > 1 hour old)
  ↓
For each item:
  - Snapshots current JPY cost and price
  - Calculates: line total (JPY) = unit price × quantity
  - Calculates: profit (JPY) = price - cost
  - Converts: THB values = JPY values × exchange rate
  ↓
Creates Order + Order Items in a single database transaction
  ↓
Automatically updates product stock and sales count
  ↓
Order is ready — view with full JPY + THB breakdown
```

### Database Schema (6 tables)

| Table | Purpose |
|---|---|
| `users` | Co-founder accounts (synced from Google) |
| `products` | Product catalog with JPY cost, price, stock |
| `orders` | Customer orders with auto-calculated totals |
| `order_items` | Per-product line items with snapshotted costs |
| `exchange_rates` | Historical JPY/THB rates pinned to orders |
| `accounts` / `sessions` | Auth.js session management |

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected pages
│   │   ├── dashboard/        # Main KPI dashboard
│   │   ├── products/         # Product catalog (list, add, edit)
│   │   ├── orders/           # Orders (list, create, detail)
│   │   └── settings/         # Exchange rates & preferences
│   ├── api/                  # REST API routes
│   │   ├── auth/             # NextAuth handler
│   │   ├── products/         # Product CRUD
│   │   ├── orders/           # Order CRUD with transaction
│   │   ├── exchange-rates/   # Rate fetch & refresh
│   │   └── dashboard/        # Stats & chart data
│   └── auth/signin/          # Google sign-in page
├── components/
│   ├── dashboard/            # StatCard, RevenueChart, TopProducts, RecentOrders
│   ├── layout/               # Sidebar, MobileNav, Topbar, SessionGuard
│   ├── orders/               # OrderForm, OrderTable, OrderDetail
│   ├── products/             # ProductForm, ProductTable
│   ├── providers/            # SessionProvider, Toaster
│   └── shared/               # CurrencyDisplay, EmptyState, LoadingSkeleton
├── hooks/                    # useDebouncedCallback
├── lib/                      # prisma, auth, exchange-rate, utils
└── types/                    # next-auth type extensions
```

---

## License

Private — for your co-founders' use.
