# Changelog

## Recent Fixes

### 1. Fixed Landing Page Redirect Loop
- **Problem**: When logged in, visiting "/" would get stuck in loading
- **Solution**: Changed from `window.location.href` to `router.push()` with redirect state control
- **File**: `app/page.tsx`

### 2. Fixed Item Selector Loading
- **Problem**: Items would load slowly or hang indefinitely
- **Solution**: Added 10-second timeout, better error handling, and detailed console logs
- **Files**: `components/marketplace/item-selector.tsx`, `components/marketplace/trade-item-selector.tsx`

### 3. Updated Role System
- **Problem**: Roles were stored in database instead of environment variables
- **Solution**: Created role system based on Discord IDs from env vars
- **Files**: `lib/hooks/use-user.ts`, `lib/utils/roles.ts`
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPER_ADMIN_ID`: Discord User ID of SuperAdmin
  - `NEXT_PUBLIC_ESCROW_ID`: Comma-separated Discord User IDs of Escrow agents
  - Users with both roles = SuperAdmin with Escrow permissions

### 4. Created SuperAdmin Panel for Items Management
- **Feature**: Full CRUD operations for items and blueprints
- **Files**: 
  - `app/admin/items/page.tsx` - List all items
  - `app/admin/items/create/page.tsx` - Create new items
  - `components/admin/item-form.tsx` - Form component
- **Access**: Only SuperAdmin can manage items

### 5. Database Status
- ✅ 257 items loaded (192 regular items + 65 blueprints)
- ✅ 11 categories including Blueprint category
- ✅ All tables created and working
- ℹ️ 0 listings (normal - users need to create them)

## How to Test

1. **Login & Redirect**: Visit https://v0-discord-login-web.vercel.app/ when logged in → should redirect to /dashboard
2. **Create Listing**: Go to "Create Listing" → Items should load within 10 seconds
3. **SuperAdmin Panel**: If you're SuperAdmin, go to "Items & Blueprints" to manage items
4. **Marketplace**: Once listings are created, they'll appear in marketplace

## Environment Variables Setup

Add these in Vercel project settings:

\`\`\`env
NEXT_PUBLIC_SUPER_ADMIN_ID=your_discord_user_id
NEXT_PUBLIC_ESCROW_ID=escrow1_id,escrow2_id,escrow3_id
\`\`\`

To get Discord User ID:
1. Enable Developer Mode in Discord (Settings → Advanced)
2. Right-click your profile → Copy User ID
