-- Migration: 004_create_schema_migrations
-- Description: Create schema migrations tracking table
-- Created: 2025-10-04

-- Create schema_migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id         INTEGER AUTOINCREMENT PRIMARY KEY,
  name       STRING UNIQUE NOT NULL,
  applied_at TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checksum   STRING NULL,
  created_by STRING NOT NULL
);

-- Create index for migration queries
CREATE INDEX IF NOT EXISTS idx_migrations_name 
ON schema_migrations (name);

CREATE INDEX IF NOT EXISTS idx_migrations_applied 
ON schema_migrations (applied_at DESC);