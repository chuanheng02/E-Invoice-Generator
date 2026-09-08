# 元天宫 E-Invoice Generator

> Professional e-invoice generator for **Persatuan Penganut Dewa Yuan Tian Kong, Kuala Lumpur dan Selangor** (Registration No. 1025-07-WKL).

## Features

- **Secure Login** — Email/password authentication powered by Supabase Auth (passwords are hashed with bcrypt)
- **Invoice Generation** — Professional, black-and-white PDF invoices with full Chinese character support
- **Cloud Storage** — Generated PDFs are automatically uploaded to Supabase Storage
- **Database Tracking** — Every invoice's metadata (customer, price, date, PDF link) is stored in a PostgreSQL database
- **Auto Invoice Numbers** — Unique invoice numbers are auto-generated (format: `INV-YYMM-XXXXX`)
- **Lightweight PDFs** — Uses `@react-pdf/renderer` for true vector PDFs, not screenshots
- **Responsive UI** — Works on desktop and mobile with a modern glassmorphism design

## Tech Stack

| Layer       | Technology                |
| ----------- | ------------------------- |
| Frontend    | React 19 + Vite           |
| Styling     | Vanilla CSS (Inter font)  |
| PDF Engine  | @react-pdf/renderer       |
| Backend     | Supabase (Auth + DB + Storage) |
| Hosting     | Vercel (auto-deploy from GitHub) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A free [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/chuanheng02/E-Invoice-Generator.git
cd E-Invoice-Generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com/)
2. Run this SQL in the **SQL Editor** to create the invoices table:

```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name TEXT,
  price DECIMAL(10,2),
  pdf_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Go to **Storage** and create a new **public** bucket named `invoices`

### 4. Configure environment (optional)

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment (Vercel)

This project auto-deploys to Vercel when you push to the `main` branch:

1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub
2. Import the `E-Invoice-Generator` repository
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) if needed
4. Click **Deploy**

Every subsequent push to `main` triggers an automatic redeployment.

## Project Structure

```
src/
├── main.jsx              # Entry point with auth routing
├── Login.jsx             # Login/Sign-up page
├── App.jsx               # Invoice form + generation logic
├── InvoiceTemplate.jsx   # PDF template (@react-pdf/renderer)
├── supabaseClient.js     # Supabase connection config
├── index.css             # Global styles
└── App.css               # (empty, styles in index.css)
```

## License

This project is private and intended for use by Persatuan Penganut Dewa Yuan Tian Kong.
