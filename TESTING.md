# CAMLYFF Website — Demo & Testing Script

## Prerequisites
- Supabase project at `xsjkffudpkfuzqubyqtk.supabase.co`
- SQL schema applied (run `supabase_schema.sql` in Supabase SQL Editor)
- Admin user created in Supabase Auth (Dashboard → Authentication → Users → Add User)
- Site deployed to GitHub Pages or running locally

---

## 1. Supabase Database Setup

### Step 1: Run SQL Schema
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Select your project
2. Click **SQL Editor** → **New Query**
3. Copy-paste the contents of `supabase_schema.sql`
4. Click **Run**
5. Verify: Click **Table Editor** → You should see `bookings` and `email_templates` tables

### Step 2: Create Admin User
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `camlyff005@gmail.com` (or your preferred admin email)
   - Password: Choose a strong password
4. Click **Create user**

### Step 3: Verify RLS Policies
1. Go to **SQL Editor** → Run:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('bookings', 'email_templates');
```
2. You should see 4 policies for `bookings` and 3 for `email_templates`

---

## 2. Admin Authentication Test

### Test: Login with correct credentials
1. Navigate to `https://lyfofachu.github.io/camlyff/camlyff.html`
2. Enter admin email and password
3. Click "Sign In"
4. **Expected**: Dashboard loads, email displayed in sidebar and topbar

### Test: Login with wrong credentials
1. Navigate to `camlyff.html`
2. Enter wrong email/password
3. **Expected**: "Invalid email or password" error message

### Test: Session persistence
1. Login successfully
2. Refresh the page (Ctrl+R / Cmd+R)
3. **Expected**: Dashboard loads automatically (JWT session persists)

### Test: Logout
1. Click "Sign Out" in sidebar
2. **Expected**: Returns to login screen
3. Refresh page → login screen (not dashboard)

### Test: Forgot Password
1. On login screen, enter admin email
2. Click "Forgot password?"
3. **Expected**: Toast notification "Password reset email sent to..."
4. Check email inbox for reset link

### Test: Dashboard NOT visible to customers
1. Navigate to `https://lyfofachu.github.io/camlyff/`
2. **Expected**: No "Dashboard" button in navbar (desktop or mobile)
3. No admin login overlay or dashboard content visible

---

## 3. Booking Flow Test

### Test: Desktop Booking
1. Go to the main site → Click "Book a Shoot" or "Rent a Camera"
2. Select a camera, date, duration
3. Enter name, phone, email
4. Click "Book via Instagram DM"
5. **Expected**:
   - Booking summary appears
   - Email confirmation sent (if email provided)
   - Instagram DM opens with booking details

### Test: Mobile Booking
1. Open main site on mobile device (or Chrome DevTools mobile view)
2. Tap hamburger menu → "Book a Shoot"
3. **Expected**: Booking modal opens, no page zoom issues
4. Fill out form → Submit
5. **Expected**: Confirmation appears, no layout shifts

### Test: Verify booking in Supabase
1. Go to Supabase Dashboard → Table Editor → `bookings`
2. **Expected**: New booking row with all fields populated

### Test: Verify booking in admin dashboard
1. Login to `camlyff.html`
2. Click "Bookings" tab
3. **Expected**: Latest booking appears with client name, camera, date, price, status

---

## 4. Booking Management (Admin Dashboard)

### Test: View all bookings
1. Login → Bookings tab
2. **Expected**: All bookings listed with columns: Client, Phone, Email, Camera, Date, Duration, Price, Status, Booked At, Actions

### Test: Search/filter bookings
1. Type a client name in the search bar
2. **Expected**: Table filters to matching bookings in real-time

### Test: Confirm a booking
1. Find a "pending" booking
2. Click the ✓ button
3. **Expected**: Status changes to "confirmed", badge updates

### Test: Complete a booking
1. Find a "confirmed" booking
2. Click the 🏁 button
3. **Expected**: Status changes to "completed"

### Test: Cancel a booking
1. Find a "pending" or "confirmed" booking
2. Click the ✕ button
3. **Expected**: Status changes to "cancelled" (with strikethrough)

### Test: Delete a booking
1. Click the 🗑 button on any booking
2. Confirm the dialog
3. **Expected**: Booking removed from table and database

### Test: Refresh bookings
1. Click "↻ Refresh" button
2. **Expected**: Table reloads from database

---

## 5. Email Templates Management

### Test: View templates
1. Login → Email Templates tab
2. **Expected**: 3 templates displayed:
   - 📩 Booking Confirmation (green dot)
   - 🔔 Admin Notification (amber dot)
   - 🔐 Password Reset (purple dot)

### Test: Edit a template
1. Modify the subject line of "Booking Confirmation"
2. Modify the body text
3. Click "💾 Save Changes"
4. **Expected**: 
   - Button shows "✅ Saved!" (green flash)
   - Input borders flash green briefly
   - Toast notification "Template saved successfully"

### Test: Verify in database
1. Go to Supabase → Table Editor → `email_templates`
2. **Expected**: Updated subject and body match your edits

### Test: Init defaults (first run)
1. If no templates exist, click "🚀 Load Default Templates"
2. **Expected**: 3 default templates appear

---

## 6. Email Delivery Test

### Test: Admin notification email
1. Submit a booking from the main site with email field filled
2. Check admin inbox (`camlyff005@gmail.com`)
3. **Expected**: Email with booking details (name, camera, date, price)

### Test: Customer confirmation email
1. Submit a booking with YOUR email address
2. Check your inbox
3. **Expected**: Confirmation email with booking details

### Test: Password reset email
1. On camlyff.html login, enter email → Click "Forgot password?"
2. Check inbox
3. **Expected**: Reset email with link to change password

---

## 7. Mobile Performance Test

### Test: No unwanted zoom
1. Open main site on mobile
2. Tap on any form input (name, phone, date)
3. **Expected**: No automatic zoom-in by iOS/Safari

### Test: No horizontal scroll
1. Scroll the page on mobile
2. **Expected**: No horizontal scroll / page shifting

### Test: Responsive booking modal
1. Open booking modal on mobile
2. **Expected**: Modal fits screen, camera grid is scrollable, buttons are tappable

### Test: Touch targets
1. Tap all buttons on mobile
2. **Expected**: All buttons respond on first tap (no double-tap needed)

### Test: Dashboard mobile layout
1. Open camlyff.html on mobile
2. **Expected**: Sidebar becomes horizontal scrollable tabs, content fills screen

---

## 8. Cross-Browser Checklist

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ☐ Test login, booking, dashboard | ☐ Test all above mobile tests |
| Safari | ☐ Test login, booking | ☐ Test iOS zoom, input focus |
| Firefox | ☐ Test login, booking | ☐ Basic smoke test |
| Edge | ☐ Test login, booking | ☐ Basic smoke test |

---

## File Reference

| File | Purpose |
|------|---------|
| `index.html` | Main customer-facing website |
| `camlyff.html` | Admin dashboard (Supabase Auth protected) |
| `style.css` | Supplemental CSS + mobile fixes |
| `script.js` | Smooth scroll helper |
| `supabase_schema.sql` | Database schema (run in Supabase SQL Editor) |
| `images/logo.png` | Site logo |

---

## Troubleshooting

### "Supabase not connected" error
- Check browser console for errors
- Verify Supabase URL and anon key are correct
- Ensure tables exist (run SQL schema)

### Login fails with "Invalid login credentials"
- Verify admin user exists in Supabase Auth → Users
- Reset password if needed

### Bookings not appearing in dashboard
- Check RLS policies (run verification query above)
- Ensure `bookings` table has the correct columns
- Check browser console for SQL errors

### Emails not sending
- Verify EmailJS service ID, template ID, and public key
- Check EmailJS dashboard for delivery logs
- Ensure email template in EmailJS has matching parameter names
