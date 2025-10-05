-- Migration: 001_create_print_requests
-- Description: Create the main print_requests table
-- Created: 2025-10-04

-- Create print_requests table
CREATE TABLE IF NOT EXISTS print_requests (
  request_id        STRING PRIMARY KEY,
  user_id           STRING NOT NULL,
  submitted_at      TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  filament_type     STRING NOT NULL,
  print_color       STRING NOT NULL,
  file_link         STRING NOT NULL,
  file_type         STRING NOT NULL,
  po_or_professor   STRING NULL,
  details           STRING NULL,
  status            STRING NOT NULL DEFAULT 'pending',
  result_data       VARIANT NULL,
  error_message     STRING NULL,
  ai_confidence     NUMBER(3,2) NULL,
  estimated_cost    NUMBER(10,2) NULL,
  estimated_time    STRING NULL,
  recommended_printer STRING NULL,
  recommended_material STRING NULL,
  created_by        STRING NOT NULL,
  updated_by        STRING NOT NULL
);

-- Add clustering
ALTER TABLE print_requests CLUSTER BY (user_id, submitted_at);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_print_requests_status 
ON print_requests (status, submitted_at);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS idx_print_requests_user 
ON print_requests (user_id, submitted_at DESC);