-- ====================================================================
-- GHH LIBRARY — SUPABASE POSTGRESQL PRODUCTION MASTER SCHEMA
-- 32 Complete Enterprise Tables (Clean Drop & Clean Recreate)
-- ====================================================================

-- Step 1: Clean drop of any old partially existing tables
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS rule_executions CASCADE;
DROP TABLE IF EXISTS rules CASCADE;
DROP TABLE IF EXISTS whatsapp_templates CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS focus_sessions CASCADE;
DROP TABLE IF EXISTS study_goals CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS crash_reports CASCADE;
DROP TABLE IF EXISTS bug_reports CASCADE;
DROP TABLE IF EXISTS coupon_usages CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS config_versions CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS popups CASCADE;
DROP TABLE IF EXISTS remote_config CASCADE;
DROP TABLE IF EXISTS leaves CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS waitlists CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS floors CASCADE;
DROP TABLE IF EXISTS library_branches CASCADE;
DROP TABLE IF EXISTS libraries CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create all 32 tables cleanly in exact sequence

-- 1. Users Table (Students, Owners, Super Admins)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    student_id VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(32) NOT NULL DEFAULT 'student',
    credit_balance INTEGER NOT NULL DEFAULT 0,
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    referral_code VARCHAR(32),
    assigned_library_id VARCHAR(64),
    assigned_seat VARCHAR(64),
    assigned_shift VARCHAR(64),
    loyalty_level VARCHAR(32) DEFAULT 'bronze',
    status VARCHAR(32) DEFAULT 'active',
    avatar_url TEXT,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    block_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Libraries Table (Unique Library ID: [6-Digit PIN]-[Code])
CREATE TABLE libraries (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    public_library_id VARCHAR(30) UNIQUE NOT NULL,
    library_code VARCHAR(20) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    total_capacity INTEGER NOT NULL DEFAULT 50,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    billing_mode VARCHAR(32) DEFAULT 'credit',
    facilities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Library Branches Table
CREATE TABLE library_branches (
    id VARCHAR(64) PRIMARY KEY,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Floors Table (Unlimited Multi-Floor Digital Twin: B1, G, M1, F1..)
CREATE TABLE floors (
    id VARCHAR(64) PRIMARY KEY,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    floor_code VARCHAR(10) NOT NULL,
    floor_order INTEGER NOT NULL DEFAULT 0,
    floor_name VARCHAR(100) NOT NULL,
    floor_type VARCHAR(50) NOT NULL DEFAULT 'standard',
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    closure_reason TEXT,
    operating_hours VARCHAR(100) DEFAULT '06:00 AM - 11:00 PM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Zones Table (Quiet Zone, AC Window, Discussion..)
CREATE TABLE zones (
    id VARCHAR(64) PRIMARY KEY,
    floor_id VARCHAR(64) REFERENCES floors(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) NOT NULL DEFAULT 'quiet',
    color_code VARCHAR(20) DEFAULT '#4F8EF7',
    noise_policy VARCHAR(100) DEFAULT 'Strict Silence',
    facilities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Shifts Table
CREATE TABLE shifts (
    id VARCHAR(64) PRIMARY KEY,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Seats Table (2D/3D Coordinates, Spatial Shape, Status)
CREATE TABLE seats (
    id VARCHAR(64) PRIMARY KEY,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    floor_id VARCHAR(64) REFERENCES floors(id) ON DELETE CASCADE,
    floor_code VARCHAR(10) NOT NULL,
    zone_id VARCHAR(64) REFERENCES zones(id) ON DELETE SET NULL,
    zone_name VARCHAR(100),
    seat_number VARCHAR(20) NOT NULL,
    row_label VARCHAR(10),
    col_number INTEGER,
    category VARCHAR(32) DEFAULT 'standard',
    status VARCHAR(32) NOT NULL DEFAULT 'available',
    current_student_id VARCHAR(64),
    current_student_name VARCHAR(255),
    shift_id VARCHAR(64),
    x DOUBLE PRECISION DEFAULT 0,
    y DOUBLE PRECISION DEFAULT 0,
    z DOUBLE PRECISION DEFAULT 0,
    rotation DOUBLE PRECISION DEFAULT 0,
    shape VARCHAR(50) DEFAULT 'single_desk',
    facilities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Plans Table
CREATE TABLE plans (
    id VARCHAR(64) PRIMARY KEY,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    billing_mode VARCHAR(32) NOT NULL DEFAULT 'credit',
    credits INTEGER DEFAULT 30,
    price NUMERIC(10, 2) NOT NULL,
    validity_days INTEGER NOT NULL DEFAULT 30,
    is_popular BOOLEAN DEFAULT FALSE,
    access_type VARCHAR(50) DEFAULT 'all_access',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Memberships Table
CREATE TABLE memberships (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) REFERENCES plans(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    total_credits INTEGER NOT NULL DEFAULT 30,
    remaining_credits INTEGER NOT NULL DEFAULT 30,
    consumed_credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Credit Transactions Ledger (Double-Entry Audited)
CREATE TABLE credit_transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT,
    reference_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Payments Table
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    library_name VARCHAR(255),
    plan_id VARCHAR(64),
    plan_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'paid',
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    reference_no VARCHAR(100),
    receipt_number VARCHAR(100),
    credits_added INTEGER NOT NULL DEFAULT 30,
    validity_days INTEGER NOT NULL DEFAULT 30,
    proof_url TEXT,
    notes TEXT,
    approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Invoices Table
CREATE TABLE invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    library_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL,
    coupon_code VARCHAR(50),
    status VARCHAR(32) DEFAULT 'paid',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Bookings Table (Shift, Date, Credits Deducted)
CREATE TABLE bookings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    seat_id VARCHAR(64) REFERENCES seats(id) ON DELETE CASCADE,
    seat_number VARCHAR(20) NOT NULL,
    shift_id VARCHAR(64) NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    start_time VARCHAR(20),
    expiry_time VARCHAR(50),
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed',
    no_show_flag BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Waitlists Table
CREATE TABLE waitlists (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    shift_id VARCHAR(64) NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    queue_position INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'waiting',
    notified_at TIMESTAMP WITH TIME ZONE,
    claim_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Attendance Table (Punch In/Out, Biometric/QR)
CREATE TABLE attendance (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    seat_id VARCHAR(64),
    seat_number VARCHAR(20),
    shift_id VARCHAR(64),
    shift_name VARCHAR(100),
    date DATE NOT NULL,
    entry_time VARCHAR(20) NOT NULL,
    exit_time VARCHAR(20),
    duration_minutes INTEGER,
    duration_formatted VARCHAR(50),
    credit_deducted BOOLEAN NOT NULL DEFAULT TRUE,
    is_leave BOOLEAN NOT NULL DEFAULT FALSE,
    entry_method VARCHAR(32) DEFAULT 'qr',
    status VARCHAR(32) NOT NULL DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Leaves Table (Credit Protection)
CREATE TABLE leaves (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    credit_saved BOOLEAN DEFAULT TRUE
);

-- 17. Remote Config & Feature Flags Table
CREATE TABLE remote_config (
    id VARCHAR(64) PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    version INTEGER NOT NULL DEFAULT 1,
    updated_by VARCHAR(64),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Popups Table
CREATE TABLE popups (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    icon VARCHAR(50),
    button1_text VARCHAR(100) DEFAULT 'OK',
    button1_action VARCHAR(100) DEFAULT 'DISMISS',
    button2_text VARCHAR(100),
    button2_action VARCHAR(100),
    target_screen VARCHAR(50) DEFAULT 'any',
    target_role VARCHAR(32) DEFAULT 'all',
    target_library_id VARCHAR(64),
    user_segment VARCHAR(50) DEFAULT 'all',
    frequency VARCHAR(50) DEFAULT 'once_per_day',
    start_date DATE,
    end_date DATE,
    priority INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Banners Table
CREATE TABLE banners (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    button_text VARCHAR(100),
    action VARCHAR(100),
    target_role VARCHAR(32) DEFAULT 'all',
    library_id VARCHAR(64),
    start_date DATE,
    end_date DATE,
    priority INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Config Versions Table
CREATE TABLE config_versions (
    id VARCHAR(64) PRIMARY KEY,
    version_number INTEGER NOT NULL,
    snapshot_data JSONB NOT NULL,
    published_by VARCHAR(64),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. Coupons Table
CREATE TABLE coupons (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL,
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    usage_limit INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    applicable_library_id VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Coupon Usages Table
CREATE TABLE coupon_usages (
    id VARCHAR(64) PRIMARY KEY,
    coupon_id VARCHAR(64) REFERENCES coupons(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    discount_given NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. Bug Reports Table (User Grievances & Telemetry)
CREATE TABLE bug_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(32),
    library_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    resolution_notes TEXT,
    device_info JSONB,
    screen_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 24. Crash Reports Table (Auto-fingerprinted Stack Traces)
CREATE TABLE crash_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    crash_fingerprint VARCHAR(64) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    platform VARCHAR(32) NOT NULL DEFAULT 'android',
    app_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    device_info JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. Incidents Table (System Outages, Master Broadcasts)
CREATE TABLE incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'major',
    status VARCHAR(32) NOT NULL DEFAULT 'investigating',
    resolution TEXT,
    root_cause TEXT,
    affected_services JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 26. Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(64),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. Study Goals Table
CREATE TABLE study_goals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(32) NOT NULL,
    target_hours NUMERIC(5, 2) NOT NULL,
    current_hours NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 28. Focus Sessions Table
CREATE TABLE focus_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 29. Rewards Table
CREATE TABLE rewards (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 30. WhatsApp Templates Table
CREATE TABLE whatsapp_templates (
    id VARCHAR(64) PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_key VARCHAR(100) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 31. Rules Table (Automation Engine)
CREATE TABLE rules (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    condition_type VARCHAR(100) NOT NULL,
    condition_value JSONB NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_value JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 32. Rule Executions Table
CREATE TABLE rule_executions (
    id VARCHAR(64) PRIMARY KEY,
    rule_id VARCHAR(64) REFERENCES rules(id) ON DELETE CASCADE,
    triggered_by VARCHAR(100) NOT NULL,
    details JSONB,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 33. Support Tickets Table
CREATE TABLE support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    assigned_to VARCHAR(64),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Indexes for Fast Performance
CREATE INDEX IF NOT EXISTS idx_libraries_public_id ON libraries(public_library_id);
CREATE INDEX IF NOT EXISTS idx_libraries_pincode ON libraries(pincode);
CREATE INDEX IF NOT EXISTS idx_seats_library_floor ON seats(library_id, floor_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_crash_fingerprint ON crash_reports(crash_fingerprint);
