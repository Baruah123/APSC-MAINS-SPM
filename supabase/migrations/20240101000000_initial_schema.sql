-- Initial Schema for APSC Mock Test Registration System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. test_locations table
CREATE TABLE test_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT,
    active BOOLEAN DEFAULT TRUE,
    capacity INTEGER NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. apsc_candidates table
CREATE TABLE apsc_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number TEXT UNIQUE NOT NULL,
    candidate_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_apsc_candidates_roll_number ON apsc_candidates(roll_number);

-- 3. registrations table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id TEXT UNIQUE NOT NULL,
    user_id UUID NULL,
    mobile_number TEXT NOT NULL,
    mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
    roll_number TEXT NOT NULL REFERENCES apsc_candidates(roll_number),
    candidate_name TEXT NOT NULL,
    email TEXT NOT NULL,
    photo_storage_path TEXT NOT NULL,
    mock_test_mode TEXT NOT NULL CHECK (mock_test_mode IN ('online', 'offline')),
    preferred_location UUID NULL REFERENCES test_locations(id),
    acceptance BOOLEAN NOT NULL,
    acceptance_timestamp TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'new',
    marketing_status TEXT NOT NULL DEFAULT 'new',
    google_sync_status TEXT NOT NULL DEFAULT 'pending',
    google_sync_attempts INTEGER NOT NULL DEFAULT 0,
    google_synced_at TIMESTAMPTZ NULL,
    google_sync_error TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_registrations_registration_id ON registrations(registration_id);
CREATE INDEX idx_registrations_mobile_number ON registrations(mobile_number);
CREATE INDEX idx_registrations_roll_number ON registrations(roll_number);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_mock_test_mode ON registrations(mock_test_mode);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_marketing_status ON registrations(marketing_status);

-- 4. marketing_notes table
CREATE TABLE marketing_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    user_id UUID, -- References auth.users later if needed
    note TEXT NOT NULL,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. registration_events table
CREATE TABLE registration_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    user_id UUID,
    event_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    registration_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_test_locations_modtime BEFORE UPDATE ON test_locations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_apsc_candidates_modtime BEFORE UPDATE ON apsc_candidates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_registrations_modtime BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_marketing_notes_modtime BEFORE UPDATE ON marketing_notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) configuration

ALTER TABLE test_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE apsc_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- We will handle actual permissions server-side through a service role for public actions,
-- or create explicit public/authenticated policies.

-- For public read access to test locations:
CREATE POLICY "Public can read active test locations" 
ON test_locations FOR SELECT 
USING (active = TRUE);

-- We explicitly do NOT allow public to read all candidates. 
-- The server will query candidate by roll number using service role.
-- Or we can allow selecting candidates if the roll number exactly matches.
CREATE POLICY "Public can read candidate by exact roll number"
ON apsc_candidates FOR SELECT
USING (true); -- We will restrict this in the API route, but to be safe, no public policy is better if API route uses service key.
DROP POLICY IF EXISTS "Public can read candidate by exact roll number" ON apsc_candidates;
-- Let's just keep apsc_candidates completely closed to public. 

-- Let authenticated users (admin/marketing) read data. Assuming admin/marketing have roles in user metadata.
-- For simplicity, since the requirement states robust server-side authorization, we will primarily rely on
-- server actions (using Service Role key) for operations, and enforce RLS strictly.
