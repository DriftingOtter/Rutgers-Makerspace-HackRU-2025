-- Migration: 003_create_pricing_snapshots
-- Description: Create pricing snapshots table
-- Created: 2025-10-04

-- Create pricing_snapshots table
CREATE TABLE IF NOT EXISTS pricing_snapshots (
  snapshot_id     STRING PRIMARY KEY DEFAULT UUID_STRING(),
  request_id      STRING NOT NULL,
  calculated_at   TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  price_amount    NUMBER(12,2) NOT NULL,
  price_currency  STRING NOT NULL DEFAULT 'USD',
  breakdown       VARIANT NULL,
  material_cost   NUMBER(10,2) NULL,
  labor_cost      NUMBER(10,2) NULL,
  overhead_cost   NUMBER(10,2) NULL,
  complexity_factor NUMBER(3,2) NULL,
  size_factor     NUMBER(3,2) NULL,
  created_by      STRING NOT NULL
);

-- Add foreign key constraint
ALTER TABLE pricing_snapshots 
ADD CONSTRAINT fk_pricing_request_id 
FOREIGN KEY (request_id) REFERENCES print_requests(request_id);

-- Add clustering
ALTER TABLE pricing_snapshots CLUSTER BY (request_id, calculated_at);

-- Create index for pricing queries
CREATE INDEX IF NOT EXISTS idx_pricing_calculated 
ON pricing_snapshots (calculated_at DESC);