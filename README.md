# Latziyela Prints — Quote Request Form

A Next.js quote-request form for a screen printing business, backed by Supabase. Deploy to Vercel in minutes.

---

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **React Hook Form**
- **Supabase** (Postgres, Row Level Security)
- **Vercel** (hosting)

---

## Local Development

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/latziyela-prints-quote.git
cd latziyela-prints-quote
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Once created, open **SQL Editor** and paste the contents of `supabase/schema.sql`. Run it.
3. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> ⚠️ **Never commit `.env.local`** — it is already in `.gitignore`.

### 4. Run locally

```bash
npm run dev
```

- Quote form → [http://localhost:3000](http://localhost:3000)
- Admin view → [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
3. Add the three environment variables in Vercel's **Project Settings → Environment Variables**.
4. Click **Deploy**. Done.

Vercel will automatically redeploy on every push to `main`.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | The public-facing quote request form |
| `/success` | Confirmation page after submission |
| `/admin` | View all submitted quotes (no auth — protect via Vercel password or keep URL private) |

---

## Form Fields

| Field | Required |
|-------|----------|
| First / Last Name | ✅ |
| Band / Company | — |
| Email | ✅ |
| Phone | ✅ |
| Website | — |
| Project Description | ✅ |
| Deadline | — |
| Pick-up or Shipping | ✅ |
| Shipping Address | ✅ if Shipping |
| What are we printing? | ✅ |
| Quantity | ✅ |
| Print Locations (checkboxes) | ✅ |
| Colors per location | ✅ per selected location |
| Apparel Brand | ✅ |
| Print-ready artwork? | ✅ |
| Additional Details | — |

---

## Customization

To update the brand name, colors, or any form fields, change:

- **Colors** → `tailwind.config.js` (`brand.accent` etc.)
- **Business name** → `src/app/layout.tsx`
- **Form fields** → `src/components/QuoteForm.tsx` and `src/app/api/submit-quote/route.ts`
- **Database columns** → update `supabase/schema.sql` and re-run in Supabase SQL Editor
