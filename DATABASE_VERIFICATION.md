# Arc Raiders Trading Platform - Database Verification

## ✅ Database Status: COMPLETE

All tables have been successfully created and verified.

### Tables Overview

| Table | Status | Row Count | Purpose |
|-------|--------|-----------|---------|
| **allowed_items** | ✅ Ready | 192 items | All tradeable Arc Raiders items (no missions) |
| **profiles** | ✅ Ready | Active | User profiles with Discord data & reputation |
| **listings** | ✅ Ready | Active | Trade listings with item-for-item exchange |
| **transactions** | ✅ Ready | Active | Escrow-protected trades |
| **transaction_logs** | ✅ Ready | Active | Complete audit trail for disputes |
| **reviews** | ✅ Ready | Active | Post-trade reputation system |
| **notifications** | ✅ Ready | Active | Real-time notifications |
| **disputes** | ✅ Ready | Active | Dispute resolution system |
| **escrow_agents** | ✅ Ready | Active | Escrow role assignments |
| **messages** | ✅ Ready | Active | In-app messaging |

### Item Categories Loaded

- **Resources**: Agave, Aluminum, Berries, Circuitry, Cloth, Copper, etc.
- **Materials**: ARC Powercell, Bling, Chemicals, Electronics, etc.
- **Rarities**: Common (Gray), Uncommon (Green), Rare (Blue), Epic (Pink), Legendary (Yellow)
- **Total Items**: 192 tradeable items (mission items excluded)

### Notifications System

The notifications table includes:
- **id**: Unique notification identifier
- **user_id**: Recipient user
- **type**: Notification category (trade, dispute, review, etc.)
- **title**: Notification headline
- **message**: Detailed message
- **link**: Optional navigation link
- **read**: Read/unread status
- **created_at**: Timestamp

Real-time notifications are triggered automatically for:
- New trade offers
- Trade status changes
- Dispute creations
- Reviews received
- Escrow actions

## Discord OAuth Configuration

### Step 1: Discord Developer Portal

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing
3. Navigate to **OAuth2** section

### Step 2: Configure Redirect URI

Add this redirect URI to your Discord application:

\`\`\`
https://your-preview-url.vercel.app/auth/callback
\`\`\`

**For local development**, also add:
\`\`\`
http://localhost:3000/auth/callback
\`\`\`

### Step 3: Get Your Credentials

Copy these values:
- **Client ID**: Copy from "Application ID" or "Client ID"
- **Client Secret**: Generate if needed, then copy

### Step 4: Set Environment Variables

The following environment variables are already configured in your project:
- ✅ `NEXT_PUBLIC_DISCORD_CLIENT_ID` - Your Discord Client ID
- ✅ `NEXT_PUBLIC_DISCORD_REDIRECT_URI` - Your redirect URI

Update them in the **Vars** section of your v0 sidebar with your actual Discord application credentials.

### Step 5: OAuth2 Scopes

Ensure these scopes are enabled in Discord:
- `identify` - Get user ID and username
- `email` - Get user email (optional)

### How Discord Avatar Works

When users log in via Discord:
1. OAuth callback receives Discord user data
2. Avatar URL is constructed: `https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png`
3. Profile is created/updated with Discord avatar and username
4. Avatar displays throughout the platform with cyan borders

## Setting Up Admin Roles

### Default Role

All new users start with `role: 'user'` in the profiles table.

### Promoting to Escrow Agent

Run this SQL query to make a user an Escrow agent:

\`\`\`sql
-- Replace 'discord_username' with the actual Discord username
UPDATE profiles 
SET role = 'escrow' 
WHERE discord_username = 'username#1234';

-- Or use user ID
UPDATE profiles 
SET role = 'escrow' 
WHERE id = 'user-uuid-here';
\`\`\`

### Promoting to SuperAdmin

Run this SQL query to make a user a SuperAdmin:

\`\`\`sql
-- Replace with Discord username
UPDATE profiles 
SET role = 'super_admin' 
WHERE discord_username = 'username#1234';

-- Or use user ID
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'user-uuid-here';
\`\`\`

### Check Current Roles

View all users and their roles:

\`\`\`sql
SELECT 
  discord_username,
  role,
  reputation_score,
  total_trades,
  created_at
FROM profiles
ORDER BY created_at DESC;
\`\`\`

### Role Permissions

**User (Regular Raider)**
- Create trade listings
- Browse marketplace
- Initiate trades
- Submit reviews
- View own transactions

**Escrow Agent**
- All user permissions
- View all disputes
- Resolve disputes
- Release/refund escrowed items
- Access escrow dashboard

**SuperAdmin**
- All escrow permissions
- Manage user roles
- View platform analytics
- Access admin dashboard
- Manage all listings and transactions

## Platform Features Summary

### 🎮 Arc Raiders Theme
- Authentic 70s retro-futurism aesthetic
- Cyan (#00e5ff) and orange (#ff6b35) accent colors
- Post-apocalyptic Rust Belt atmosphere
- Speranza underground city lore

### 💱 Item-for-Item Trading
- No real money transactions
- Trade Arc Raiders items directly
- Select wanted items from 192 available
- Adjustable quantities per item
- Safe Pocket warning (3 slot limit)

### 🔒 Escrow System
- All trades protected by escrow
- Dual confirmation (buyer + seller)
- Dispute resolution available
- Complete transaction logs
- Items held until both parties confirm

### ⭐ Reputation System
- Success rate percentage
- Total trade count
- Post-trade reviews (1-5 stars)
- Review comments
- Displayed on all listings

### 🔔 Real-Time Notifications
- Instant trade updates
- Dispute alerts
- Review notifications
- Unread count badge
- Dropdown with quick actions

### 📱 Fully Responsive
- Mobile-first design
- Touch-optimized controls
- Responsive breakpoints
- Works on all devices

### 🎨 Visual Features
- Discord profile pictures
- Item rarity colors
- Trade preview images
- Success rate displays
- Status badges

## Next Steps

1. ✅ Database verified and ready
2. ⚙️ Configure Discord OAuth in Developer Portal
3. 🔑 Update environment variables with Discord credentials
4. 👤 Log in via Discord to create your profile
5. 🛡️ Promote your account to SuperAdmin using SQL
6. 🚀 Start trading in the Rust Belt!

## Troubleshooting

### Discord Avatar Not Showing
- Ensure Discord OAuth is properly configured
- Check that `NEXT_PUBLIC_DISCORD_CLIENT_ID` is set
- Verify redirect URI matches exactly
- Log out and log in again to refresh profile

### Notifications Not Appearing
- Check browser console for errors
- Verify notifications table exists
- Check RLS policies allow user access
- Try refreshing the page

### Items Not Loading
- Run the SQL script: `006_update_all_arc_items.sql`
- Verify 192 items in allowed_items table
- Check for SQL errors in script execution

### Role Not Updating
- Clear browser cache
- Log out and log in again
- Verify SQL query ran successfully
- Check profiles table for updated role

---

**Welcome to Speranza Trading Post, Raider!** 🎮
