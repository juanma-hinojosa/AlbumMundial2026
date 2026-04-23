-- Migration: Create sharing_sessions table for compact QR code sharing
-- Run this SQL in your Supabase SQL editor

CREATE TABLE sharing_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  needs TEXT[] NOT NULL DEFAULT '{}',
  swaps TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Indexes for performance
CREATE INDEX idx_sharing_sessions_share_code ON sharing_sessions(share_code);
CREATE INDEX idx_sharing_sessions_expires_at ON sharing_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE sharing_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read non-expired sessions (needed for QR scanning)
CREATE POLICY "Anyone can read non-expired sessions" ON sharing_sessions
  FOR SELECT USING (expires_at > NOW());

-- Policy: Anyone can create sessions (includes anonymous users)
CREATE POLICY "Users can create sessions" ON sharing_sessions
  FOR INSERT WITH CHECK (true);

-- Optional: Cleanup function for expired sessions (run via pg_cron extension)
-- CREATE OR REPLACE FUNCTION cleanup_expired_sharing_sessions()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM sharing_sessions WHERE expires_at < NOW();
-- END;
-- $$ LANGUAGE plpgsql;

COMMENT ON TABLE sharing_sessions IS 'Stores temporary sharing sessions for QR code exchange with expiration';
COMMENT ON COLUMN sharing_sessions.share_code IS 'Short 8-character alphanumeric code for QR codes';
COMMENT ON COLUMN sharing_sessions.needs IS 'Array of sticker IDs the user needs';
COMMENT ON COLUMN sharing_sessions.swaps IS 'Array of sticker IDs the user can trade';