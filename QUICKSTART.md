# Quick Start Guide

Get your Retail Management System up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `DATABASE_URL` - Keep as `file:./dev.db` for development

## Step 3: Initialize Database

```bash
npx prisma generate
npx prisma db push
```

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Create Owner Account

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Register as Owner"
3. Create your account (first user automatically becomes Owner)
4. Login and start using the system!

## First Steps After Login

1. **Add Products**: Go to Products → Add Product
2. **Set Opening Stock**: When adding products, set the opening stock
3. **Create a Sale**: Go to Billing → Search products → Add to cart → Checkout
4. **View Invoice**: After checkout, you'll see the invoice with PDF download option

## Common Tasks

### Add a Product
- Navigate to Products page
- Click "Add Product"
- Fill in details (name, price, GST rate, opening stock)
- Save

### Create an Invoice
- Go to Billing page
- Search for products
- Click products to add to cart
- Adjust quantities
- (Optional) Add customer details
- Click "Checkout"

### View Reports
- Go to Reports page
- Select date range
- Choose report type (Sales, GST, Products)
- Click "Generate Report"
- Export as CSV if needed

### Manage Staff (Owner Only)
- Go to Staff page
- Click "Add Staff"
- Enter name, email, password
- Staff can login but cannot access Settings/Staff pages

## Troubleshooting

### Database errors
```bash
# Reset database (WARNING: Deletes all data)
rm dev.db
npx prisma db push
```

### Port already in use
Change port in `package.json`:
```json
"dev": "next dev -p 3001"
```

### Prisma errors
```bash
npx prisma generate
npx prisma db push
```

## Next Steps

- Read the full [README.md](README.md) for deployment instructions
- Set up email reminders (optional) in `.env`
- Configure business information in Settings
- Set up backups (export data regularly)

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review the code comments
- Check Prisma documentation for database queries

Happy selling! 🎉

