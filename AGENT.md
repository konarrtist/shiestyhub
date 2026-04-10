# Arc Raiders Marketplace - Agent Documentation

## Project Overview

A trading marketplace for Arc Raiders game items and blueprints with escrow system, user reputation, and role-based access control.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Email/Password)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Architecture

### Role System

Roles are determined by **usernames** stored in environment variables:

| Role | Description | Access |
|------|-------------|--------|
| `super_admin` | Full system control | All features, admin panel, user management |
| `escrow` | Transaction mediators | Disputes, transaction oversight |
| `regular` | Normal users | Create listings, trade, message |

**Configuration:**
- `SUPER_ADMIN_USERNAMES` - Comma-separated usernames for super admins
- `ESCROW_USERNAMES` - Comma-separated usernames for escrow agents

### Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User data, ratings, trade stats |
| `listings` | Marketplace item listings |
| `transactions` | Active trades between users |
| `disputes` | Transaction disputes |
| `dispute_messages` | Messages within disputes |
| `messages` | Direct user messaging |
| `notifications` | User notifications |
| `reviews` | Post-transaction reviews |
| `allowed_items` | Approved tradeable items/blueprints |
| `transaction_logs` | Audit trail for transactions |
| `role_config` | Legacy role configuration |

### Key Features

1. **Marketplace**
   - Browse active listings
   - Filter by category, rarity
   - View seller reputation

2. **Listings**
   - Create listings with items from `allowed_items`
   - Set payment methods accepted
   - Manage own listings (edit/delete)

3. **Transactions**
   - Buyer initiates transaction
   - Both parties confirm completion
   - Dispute system if issues arise

4. **Escrow System**
   - Escrow agents mediate disputes
   - Can override transaction status
   - Full audit logging

5. **Reputation**
   - Star ratings (1-5)
   - Trade count tracking
   - Public reviews

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/config` | GET | Get role configuration from server |

## Environment Variables

### Required (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Role Configuration
- `SUPER_ADMIN_USERNAMES` - e.g., "admin1,admin2"
- `ESCROW_USERNAMES` - e.g., "escrow1,escrow2"

## File Structure

\`\`\`
/app
  /admin          # Admin panel (super_admin only)
  /auth           # Login/Register pages
  /dashboard      # Main user dashboard
    /marketplace  # Browse listings
    /my-listings  # User's listings
    /transactions # User's trades
    /disputes     # Dispute management
    /messages     # Direct messages
    /profile      # User profile
  /api
    /config       # Server-side config endpoint

/components
  /admin          # Admin components
  /layout         # Sidebar, header
  /listings       # Listing cards, forms
  /marketplace    # Item selector, filters
  /ui             # shadcn components

/lib
  /hooks          # useUser, useMobile
  /supabase       # Client/server setup
  /utils          # Role calculations
\`\`\`

## RLS Policies Summary

All tables have Row Level Security enabled:

- **profiles**: Public read, users update own
- **listings**: Public read active, owners CRUD own
- **transactions**: Participants + escrow/admin access
- **disputes**: Participants + assigned escrow + admin
- **messages**: Sender/receiver only
- **notifications**: User's own only
- **reviews**: Public read, transaction participants create
- **allowed_items**: Public read, super_admin manage

## Common Operations

### Check if user is admin
\`\`\`typescript
const { isSuperAdmin } = useUser()
if (isSuperAdmin) { /* admin actions */ }
\`\`\`

### Create a listing
\`\`\`typescript
await supabase.from('listings').insert({
  seller_id: user.id,
  title: 'My Item',
  blueprint_name: 'Item Name',
  status: 'active'
})
\`\`\`

### Get active listings
\`\`\`typescript
const { data } = await supabase
  .from('listings')
  .select('*')
  .eq('status', 'active')
\`\`\`

## Troubleshooting

### Roles not detected
1. Verify `SUPER_ADMIN_USERNAMES` env var is set
2. Check username matches exactly (case-sensitive)
3. Clear browser cache and re-login

### Listings not showing
1. Check listing status is 'active'
2. Verify RLS policies are enabled
3. Check seller_id references valid profile

### Auth issues
1. Verify Supabase credentials
2. Check email confirmation settings
3. Clear cookies and retry
