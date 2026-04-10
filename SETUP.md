# Arc Raiders Trading Hub - Setup Guide

## Discord OAuth Configuration

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Arc Raiders Trading Hub" (or your preferred name)
4. Click "Create"

### Step 2: Configure OAuth2

1. In your Discord application, go to **OAuth2** in the left sidebar
2. Click **Add Redirect** under "Redirects"
3. Add these redirect URLs:
   - **For Development**: `http://localhost:3000/auth/callback`
   - **For Production**: `https://your-domain.com/auth/callback`
   - **For Vercel Preview**: `https://your-project.vercel.app/auth/callback`
4. Click **Save Changes**

### Step 3: Get Your Credentials

1. In the **OAuth2** section, find:
   - **Client ID**: Copy this value
   - **Client Secret**: Click "Reset Secret" if needed, then copy
2. Keep these values secure

### Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers** in the left sidebar
4. Find **Discord** in the list and enable it
5. Paste your Discord credentials:
   - **Client ID**: From Discord Developer Portal
   - **Client Secret**: From Discord Developer Portal
6. Click **Save**

### Step 5: Set Environment Variable (Optional for Development)

If you're testing locally with Supabase redirects:

1. In Vercel project settings, add environment variable:
   - **Key**: `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`
   - **Value**: `http://localhost:3000/auth/callback`

---

## Setting Up Administrators

### Using Environment Variables (Recommended)

Roles are now managed via environment variables for security and simplicity.

**Step 1: Get Discord User IDs**

1. Open Discord
2. Go to **Settings** → **Advanced**
3. Enable **Developer Mode**
4. Right-click your profile picture (or any user's profile)
5. Click **Copy User ID**
6. Save this ID (it will look like: `123456789012345678`)

**Step 2: Add Environment Variables in Vercel**

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add the following variables:

**`NEXT_PUBLIC_SUPER_ADMIN_ID`** (Required)
- Value: Your Discord User ID
- Example: `123456789012345678`
- This user gets full admin access

**`NEXT_PUBLIC_ESCROW_ID`** (Optional)
- Value: Comma-separated Discord User IDs for Escrow agents
- Example: `123456789012345678,987654321098765432`
- These users get dispute management access

**Step 3: Redeploy**

1. After adding environment variables, trigger a new deployment
2. Changes take effect immediately after deployment

### Role Logic

- **SuperAdmin**: Discord ID matches `NEXT_PUBLIC_SUPER_ADMIN_ID`
  - Full admin panel access
  - Item & Blueprint management
  - User management
  - All Escrow permissions automatically

- **Escrow**: Discord ID is in `NEXT_PUBLIC_ESCROW_ID` list
  - Dispute resolution
  - Transaction oversight
  - Cannot access admin panel

- **User**: Everyone else
  - Trading and marketplace
  - Create listings
  - Leave reviews

**Important Notes:**
- SuperAdmin automatically has Escrow permissions
- Don't add SuperAdmin ID to Escrow list (redundant)
- Environment variable changes require redeployment

### Alternative: Database Method (Legacy)

If you prefer database-based roles:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **SQL Editor**
3. Run this query:

\`\`\`sql
UPDATE profiles 
SET role = 'super_admin'  -- or 'escrow' or 'user'
WHERE discord_id = 'YOUR_DISCORD_USER_ID';
\`\`\`

Note: Environment variables take precedence over database roles.

---

## Role Permissions

### SuperAdmin
- View all users and change their roles
- Access admin dashboard with platform statistics
- View all transactions and disputes
- Manage all listings
- Full escrow capabilities

### Escrow
- View and resolve disputes
- Access escrow panel
- Review transaction evidence
- Release or refund held items

### User
- Create and manage listings
- Trade items with other users
- Leave reviews
- Open disputes if needed
- View personal transaction history

---

## Testing Your Setup

### Test Discord Login

1. Run your app locally or deploy to Vercel
2. Go to `/auth/login`
3. Click "Continue with Discord"
4. Authorize the application
5. You should be redirected to `/dashboard`

### Verify Profile Creation

1. After login, check Supabase **Table Editor** → `profiles`
2. Your profile should be created automatically with:
   - Discord username
   - Email
   - Avatar URL
   - Default role: `user`

### Test Role Change

1. Update your role to `superadmin` in Supabase
2. Refresh the dashboard
3. You should now see "Admin" option in the sidebar

---

## Troubleshooting

### "Invalid redirect URI" error

- Check that your redirect URL in Discord matches exactly (including http/https)
- Ensure there are no trailing slashes
- Wait a few minutes after saving changes in Discord Developer Portal

### Profile not created after login

- Check Supabase logs in **Logs** → **API**
- Verify the `profiles` table exists
- Run the database scripts in order

### Role changes not reflecting

- Clear your browser cache and cookies
- Logout and login again
- Check that the middleware is protecting the routes correctly

---

## Production Checklist

- [ ] Discord OAuth redirect URIs updated for production domain
- [ ] Environment variables set in Vercel
- [ ] At least one superadmin account configured
- [ ] Database scripts executed successfully
- [ ] Test complete trading flow
- [ ] Test dispute system
- [ ] Verify reviews are working
- [ ] Check mobile responsiveness

---

## Support

For issues or questions:
1. Check Supabase logs for errors
2. Verify Discord application settings
3. Review the code in `lib/supabase/` directory
4. Check middleware in `proxy.ts`
