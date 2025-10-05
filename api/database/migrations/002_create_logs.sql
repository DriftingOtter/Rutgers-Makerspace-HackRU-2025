-- Migration: 002_create_logs
-- Description: Create logging and audit tables
-- Created: 2025-10-04

-- Create print_request_logs table
CREATE TABLE IF NOT EXISTS print_request_logs (
  log_id        STRING PRIMARY KEY DEFAULT UUID_STRING(),
  request_id    STRING NOT NULL,
  logged_at     TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  event_type    STRING NOT NULL,
  event_data    VARIANT NULL,
  note          STRING NULL,
  created_by    STRING NOT NULL
);

-- Add foreign key constraint
ALTER TABLE print_request_logs 
ADD CONSTRAINT fk_logs_request_id 
FOREIGN KEY (request_id) REFERENCES print_requests(request_id);

-- Add clustering
ALTER TABLE print_request_logs CLUSTER BY (request_id, logged_at);

-- Create index for event type queries
CREATE INDEX IF NOT EXISTS idx_logs_event_type 
ON print_request_logs (event_type, logged_at);