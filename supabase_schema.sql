-- ══════════════════════════════════════════════════════════════
--  CAMLYFF — Supabase SQL Schema
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
--  TABLE: bookings
--  Stores all camera rental / shoot bookings from the website
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  camera     TEXT,
  service    TEXT,
  date       TEXT,
  duration   TEXT,
  price      NUMERIC DEFAULT 0,
  notes      TEXT,
  channel    TEXT DEFAULT 'website',
  status     TEXT DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','cancelled','completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
--  TABLE: email_templates
--  Editable email templates for booking confirmation, admin
--  notification, and password reset emails
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_templates (
  id         BIGSERIAL PRIMARY KEY,
  type       TEXT UNIQUE NOT NULL
               CHECK (type IN ('booking_confirmation','admin_notification','password_reset')),
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
--  Protects data so only authenticated admins can read/modify,
--  but anyone can insert a booking (public form).
-- ══════════════════════════════════════════════════════════════

-- BOOKINGS —————————————————————————————————————————————
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can INSERT bookings via the public booking form
CREATE POLICY "Public can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can read bookings
CREATE POLICY "Authenticated users can read bookings"
  ON bookings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated admins can update booking status
CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated admins can delete bookings
CREATE POLICY "Authenticated users can delete bookings"
  ON bookings FOR DELETE
  USING (auth.role() = 'authenticated');

-- EMAIL TEMPLATES ——————————————————————————————————————
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read templates
CREATE POLICY "Authenticated users can read email templates"
  ON email_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated admins can update templates
CREATE POLICY "Authenticated users can update email templates"
  ON email_templates FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated admins can insert templates (for init)
CREATE POLICY "Authenticated users can insert email templates"
  ON email_templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════
--  SEED DATA: Default email templates
-- ══════════════════════════════════════════════════════════════
INSERT INTO email_templates (type, subject, body) VALUES
  (
    'booking_confirmation',
    '✅ Booking Confirmed — CAMLYFF',
    E'Hi {{name}},\n\nYour booking is confirmed!\n\n📷 Camera: {{camera}}\n📅 Date: {{date}}\n⏱ Duration: {{duration}}\n💰 Price: {{price}}\n\nWe''ll reach out to finalize details. Thank you for choosing CAMLYFF!\n\nBest,\nTeam CAMLYFF'
  ),
  (
    'admin_notification',
    '🔔 New Booking — {{name}}',
    E'New booking received!\n\n👤 Client: {{name}}\n📱 Phone: {{phone}}\n📷 Camera: {{camera}}\n📅 Date: {{date}}\n⏱ Duration: {{duration}}\n💰 Price: {{price}}\n📧 Email: {{email}}\n\nCheck dashboard for details.'
  ),
  (
    'password_reset',
    '🔐 Password Reset — CAMLYFF Admin',
    E'Hi Admin,\n\nYou requested a password reset for your CAMLYFF dashboard.\n\nClick the link below to reset:\n{{reset_link}}\n\nIf you didn''t request this, ignore this email.\n\n— CAMLYFF'
  )
ON CONFLICT (type) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
--  ADMIN USER SETUP
--  Supabase Auth handles admin users. To create an admin:
--  1. Go to Supabase Dashboard → Authentication → Users
--  2. Click "Add user" → Enter email and password
--  3. Use these credentials to log into camlyff.html dashboard
--
--  NOTE: No separate "admins" table is needed — Supabase Auth
--  provides email/password login, JWT tokens, password reset,
--  and session management built-in.
-- ══════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════
--  VERIFICATION: Run these queries to check everything is set up
-- ══════════════════════════════════════════════════════════════
-- SELECT * FROM bookings ORDER BY created_at DESC;
-- SELECT * FROM email_templates ORDER BY id;
-- SELECT schemaname, tablename, policyname FROM pg_policies
--   WHERE tablename IN ('bookings', 'email_templates');
