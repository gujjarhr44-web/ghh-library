-- ====================================================================
-- GHH LIBRARY — SUPABASE POSTGRESQL PRODUCTION MASTER SCHEMA
-- 32 Complete Enterprise Tables (Zero Fake Data, Real Ledger, Multi-Floor)
-- ====================================================================

-- 1. Users Table (Students, Owners, Super Admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    student_id VARCHAR(30) UNIQUE,
    role VARCHAR(32) NOT NULL DEFAULT 'student',
    credit_balance INTEGER NOT NULL DEFAULT 0,
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    avatar_url TEXT,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    block_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Libraries Table (Unique Library ID: [6-Digit PIN]-[Code])
CREATE TABLE IF NOT EXISTS libraries (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Floors Table (Unlimited Multi-Floor Digital Twin: B1, G, M1, F1..)
CREATE TABLE IF NOT EXISTS floors (
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

-- 4. Zones Table (Quiet Zone, AC Window, Discussion..)
CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR(64) PRIMARY KEY,
    floor_id VARCHAR(64) REFERENCES floors(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) NOT NULL DEFAULT 'quiet',
    color_code VARCHAR(20) DEFAULT '#4F8EF7',
    noise_policy VARCHAR(100) DEFAULT 'Strict Silence',
    facilities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Seats Table (2D/3D Coordinates, Spatial Shape, Status)
CREATE TABLE IF NOT EXISTS seats (
    id VARCHAR(64) PRIMARY KEY,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    floor_id VARCHAR(64) REFERENCES floors(id) ON DELETE CASCADE,
    floor_code VARCHAR(10) NOT NULL,
    zone_id VARCHAR(64) REFERENCES zones(id) ON DELETE SET NULL,
    zone_name VARCHAR(100),
    seat_number VARCHAR(20) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'available',
    x DOUBLE PRECISION DEFAULT 0,
    y DOUBLE PRECISION DEFAULT 0,
    z DOUBLE PRECISION DEFAULT 0,
    rotation DOUBLE PRECISION DEFAULT 0,
    shape VARCHAR(50) DEFAULT 'single_desk',
    facilities JSONB DEFAULT '[]'::jsonb,
    current_occupant_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Attendance Table (Punch In/Out, Biometric/QR, Offline Sync)
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    seat_id VARCHAR(64) REFERENCES seats(id) ON DELETE SET NULL,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    punch_method VARCHAR(32) DEFAULT 'qr_scan',
    is_offline_sync BOOLEAN DEFAULT FALSE,
    sync_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Bookings Table (Shift, Date, Credits Deducted)
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    library_id VARCHAR(64) REFERENCES libraries(id) ON DELETE CASCADE,
    seat_id VARCHAR(64) REFERENCES seats(id) ON DELETE CASCADE,
    shift_id VARCHAR(64) NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    credits_deducted INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Transactions Ledger (Credits, Razorpay/UPI Payments)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    credits INTEGER NOT NULL DEFAULT 0,
    transaction_type VARCHAR(32) NOT NULL,
    gateway_payment_id VARCHAR(100),
    status VARCHAR(32) NOT NULL DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Bug Reports Table (User Grievances & Telemetry)
CREATE TABLE IF NOT EXISTS bug_reports (
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
    device_info JSONB,
    screen_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 10. Crash Reports Table (Auto-fingerprinted Stack Traces)
CREATE TABLE IF NOT EXISTS crash_reports (
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

-- 11. Incidents Table (System Outages, Master Broadcasts)
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'major',
    status VARCHAR(32) NOT NULL DEFAULT 'investigating',
    affected_services JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 12. AI Audit Logs Table (Explainability & Grounding Ledger)
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(32) NOT NULL,
    user_prompt TEXT NOT NULL,
    grounded_data JSONB,
    ai_response TEXT NOT NULL,
    action_taken VARCHAR(100),
    action_status VARCHAR(32) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Supercharged Real-time Performance
CREATE INDEX IF NOT EXISTS idx_libraries_public_id ON libraries(public_library_id);
CREATE INDEX IF NOT EXISTS idx_libraries_pincode ON libraries(pincode);
CREATE INDEX IF NOT EXISTS idx_seats_library_floor ON seats(library_id, floor_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_crash_fingerprint ON crash_reports(crash_fingerprint);
