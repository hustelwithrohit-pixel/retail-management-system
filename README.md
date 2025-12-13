# Retail Management System

A complete full-stack web application for small retailers with inventory management, billing/POS, customer management, reports, and more.

## Features

### 1. Inventory / Stock Management
- Add/edit/delete products
- Opening stock + current stock tracking
- Auto stock deduction on sales
- Manual stock adjustments
- Low-stock & overstock alerts
- Stock movement history
- Stock reports
- Simple stock prediction (30/90 day sales avg)

### 2. Billing & Invoicing (POS System)
- Fast item search
- Add items to cart
- Auto GST calculations (CGST/SGST)
- Generate invoice
- Save invoice in DB
- Auto-create customer profile if new
- Client-side PDF invoice generator (jsPDF)
- WhatsApp share link (wa.me)
- Download invoice
- Invoice history
- View invoice page

### 3. Marketing & Customer Engagement
- Customer list
- Send WhatsApp promotional messages using share links (no API)
- Ready-made templates for offers
- One-click share to WhatsApp/Instagram
- Marketing page with templates

### 4. Staff Management
- Owner vs Staff roles
- Staff restricted from: settings, staff mgmt, backups
- Owner can manage staff (add/edit/delete)

### 5. Reports & Insights
- Daily sales summary
- GST summary
- Top-selling items
- Stock turnover
- Customer purchase history
- All exportable as CSV

### 6. Reminders
- Create reminders (general or customer-specific)
- Show reminders on dashboard
- Mark as done
- Optional email reminder using free SMTP

### 7. Backup & Export
- Export products CSV
- Export invoices CSV
- Export customers CSV
- Download SQLite DB backup file

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (JWT)
- **PDF Generation**: jsPDF
- **Charts**: Recharts
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- SQLite (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd retail-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   
   # Optional - for email reminders
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   SMTP_FROM="your-email@gmail.com"
   
   # Business Info (for invoices)
   BUSINESS_NAME="Your Retail Store"
   BUSINESS_ADDRESS="123 Main Street, City, State 12345"
   BUSINESS_PHONE="+1234567890"
   BUSINESS_EMAIL="store@example.com"
   BUSINESS_GSTIN="GSTIN123456789"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

7. **Register the first user (Owner)**
   - Go to `/register`
   - Create your account (first user becomes Owner automatically)
   - Login and start using the system

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── products/     # Product CRUD
│   │   ├── customers/    # Customer CRUD
│   │   ├── invoices/     # Invoice management
│   │   ├── stock/         # Stock operations
│   │   ├── reports/       # Reports
│   │   ├── marketing/    # Marketing templates
│   │   ├── reminders/     # Reminders
│   │   ├── staff/         # Staff management
│   │   └── backup/        # Backup & export
│   ├── dashboard/         # Dashboard page
│   ├── products/          # Products page
│   ├── billing/           # POS/Billing page
│   ├── invoices/          # Invoice pages
│   ├── customers/         # Customer pages
│   ├── reports/           # Reports page
│   ├── marketing/         # Marketing page
│   ├── reminders/         # Reminders page
│   ├── staff/             # Staff management (Owner only)
│   └── settings/          # Settings (Owner only)
├── components/
│   ├── layout/            # Layout components
│   ├── ui/                # Reusable UI components
│   ├── products/          # Product components
│   └── invoices/          # Invoice components
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Auth utilities
│   ├── utils.ts           # Helper functions
│   └── middleware.ts      # Route protection
├── prisma/
│   └── schema.prisma      # Database schema
└── types/                 # TypeScript types
```

## Database Schema

The application uses Prisma with SQLite. Key models:

- **User**: Owner and Staff accounts
- **Product**: Inventory items
- **Customer**: Customer information
- **Invoice**: Sales invoices
- **InvoiceItem**: Invoice line items
- **StockMovement**: Stock transaction history
- **Reminder**: Reminders and tasks

## Deployment

### Option 1: Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Set up environment variables**
   - Add all variables from `.env.example`
   - For `DATABASE_URL`, use a PostgreSQL connection string (see below)

4. **Set up PostgreSQL database**
   - Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (free tier available)
   - Or use [Supabase](https://supabase.com) (free tier available)
   - Or use [Railway](https://railway.app) (free tier available)

5. **Update Prisma schema for PostgreSQL**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

6. **Deploy**
   - Vercel will automatically build and deploy
   - Run migrations: `npx prisma migrate deploy`

### Option 2: Railway

1. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up/login

2. **Create new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Add PostgreSQL database**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the connection string

4. **Set environment variables**
   - Add all variables from `.env.example`
   - Set `DATABASE_URL` to the PostgreSQL connection string

5. **Deploy**
   - Railway will automatically build and deploy

### Option 3: Self-hosted (VPS)

1. **Set up server**
   - Ubuntu 20.04+ recommended
   - Install Node.js 18+, PostgreSQL

2. **Clone and build**
   ```bash
   git clone <your-repo>
   cd retail-management-system
   npm install
   npm run build
   ```

3. **Set up PostgreSQL**
   ```bash
   sudo -u postgres createdb retail_db
   sudo -u postgres createuser retail_user
   ```

4. **Update environment variables**
   - Create `.env` file with production values
   - Update `DATABASE_URL` to PostgreSQL connection string

5. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

6. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "retail-app" -- start
   pm2 save
   pm2 startup
   ```

7. **Set up Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Migrating from SQLite to PostgreSQL

1. **Export data from SQLite** (optional, if you have existing data)
   ```bash
   sqlite3 dev.db .dump > backup.sql
   ```

2. **Update Prisma schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update connection string**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

4. **Run migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `NEXTAUTH_URL` | Your app URL | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT (generate with `openssl rand -base64 32`) | Yes |
| `SMTP_HOST` | SMTP server for emails | No |
| `SMTP_PORT` | SMTP port | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASSWORD` | SMTP password | No |
| `SMTP_FROM` | From email address | No |
| `BUSINESS_NAME` | Your business name | No |
| `BUSINESS_ADDRESS` | Business address | No |
| `BUSINESS_PHONE` | Business phone | No |
| `BUSINESS_EMAIL` | Business email | No |
| `BUSINESS_GSTIN` | Business GSTIN | No |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply migrations

## Security Notes

- Change `NEXTAUTH_SECRET` in production
- Use strong passwords for database
- Enable HTTPS in production
- Regularly backup your database
- Keep dependencies updated

## Support

For issues or questions, please open an issue on GitHub.

## License

This project is for single business use only (not SaaS).

---

**Built with ❤️ for small retailers**

