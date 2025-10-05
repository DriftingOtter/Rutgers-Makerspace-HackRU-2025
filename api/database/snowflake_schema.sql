-- Rutgers Makerspace Snowflake Database Schema
-- Updated to match current application data structure
-- Created: 2025-10-05

-- Create database and schema
CREATE DATABASE IF NOT EXISTS RUTGERS_MAKERSPACE;
USE DATABASE RUTGERS_MAKERSPACE;

CREATE SCHEMA IF NOT EXISTS MAKERSPACE;
USE SCHEMA MAKERSPACE;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    user_id STRING PRIMARY KEY,                    -- Firebase UID
    email STRING NOT NULL UNIQUE,                  -- User email
    display_name STRING,                           -- User display name
    rutgers_netid STRING,                          -- Rutgers NetID (optional)
    phone_number STRING,                           -- Phone number (optional)
    is_admin BOOLEAN DEFAULT FALSE,                -- Admin status
    is_staff BOOLEAN DEFAULT FALSE,                -- Staff status
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP_NTZ,
    profile_image_url STRING,                      -- Profile image URL
    preferences VARIANT,                           -- JSON for user preferences
    status STRING DEFAULT 'active'                 -- active, inactive, suspended
);

-- =============================================
-- PRINT REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS print_requests (
    request_id STRING PRIMARY KEY,                 -- UUID
    user_id STRING NOT NULL,                       -- Foreign key to users
    project_name STRING NOT NULL,                  -- Project title
    description TEXT,                              -- Project description
    material STRING NOT NULL,                      -- Material type (PLA, PETG, ABS, etc.)
    color STRING NOT NULL,                         -- Color selection
    quantity INTEGER DEFAULT 1,                    -- Number of copies
    urgency STRING DEFAULT 'normal',               -- low, normal, high, urgent
    special_instructions TEXT,                     -- Special requirements
    file_name STRING,                              -- Original file name
    file_size INTEGER,                             -- File size in bytes
    file_type STRING,                              -- stl, obj, 3mf
    file_url STRING,                               -- URL to stored file
    model_url STRING,                              -- URL to 3D model for viewing
    fallback_image_url STRING,                     -- Fallback image URL
    status STRING DEFAULT 'pending',               -- pending, in_progress, completed, failed, cancelled
    is_public BOOLEAN DEFAULT FALSE,               -- Public visibility in community
    estimated_cost DECIMAL(10,2),                  -- Estimated cost
    actual_cost DECIMAL(10,2),                     -- Actual cost
    estimated_print_time STRING,                   -- Estimated print time
    actual_print_time STRING,                      -- Actual print time
    assigned_printer STRING,                       -- Assigned printer name
    staff_notes TEXT,                              -- Staff notes
    user_notes TEXT,                               -- User notes
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP_NTZ,
    -- Foreign key constraint
    CONSTRAINT fk_print_requests_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =============================================
-- EQUIPMENT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id STRING PRIMARY KEY,               -- UUID
    name STRING NOT NULL,                          -- Equipment name
    type STRING NOT NULL,                          -- 3D Printer, CNC, etc.
    model STRING,                                  -- Model number
    manufacturer STRING,                           -- Manufacturer
    status STRING DEFAULT 'operational',           -- operational, maintenance, out_of_order
    location STRING,                               -- Physical location
    capabilities VARIANT,                          -- JSON array of capabilities
    specifications VARIANT,                         -- JSON object with specs
    last_maintenance TIMESTAMP_NTZ,                -- Last maintenance date
    next_maintenance TIMESTAMP_NTZ,                -- Next scheduled maintenance
    usage_hours INTEGER DEFAULT 0,                 -- Total usage hours
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT                                     -- Additional notes
);

-- =============================================
-- MATERIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS materials (
    material_id STRING PRIMARY KEY,                -- UUID
    name STRING NOT NULL,                          -- Material name (PLA, PETG, etc.)
    type STRING NOT NULL,                          -- Material type
    colors VARIANT,                                -- JSON array of available colors
    cost_per_gram DECIMAL(8,4),                    -- Cost per gram
    description TEXT,                              -- Material description
    properties VARIANT,                            -- JSON object with material properties
    is_available BOOLEAN DEFAULT TRUE,             -- Availability status
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- COMMUNITY PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS community_projects (
    project_id STRING PRIMARY KEY,                 -- UUID
    print_request_id STRING,                       -- Reference to original print request
    title STRING NOT NULL,                         -- Project title
    description TEXT,                              -- Project description
    author_id STRING NOT NULL,                     -- User who made it public
    author_name STRING NOT NULL,                   -- Author display name
    material STRING,                               -- Material used
    color STRING,                                  -- Color used
    likes INTEGER DEFAULT 0,                       -- Number of likes
    downloads INTEGER DEFAULT 0,                   -- Number of downloads
    model_url STRING,                              -- 3D model URL
    fallback_image_url STRING,                     -- Fallback image URL
    tags VARIANT,                                  -- JSON array of tags
    is_featured BOOLEAN DEFAULT FALSE,             -- Featured project
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    -- Foreign key constraints
    CONSTRAINT fk_community_projects_request FOREIGN KEY (print_request_id) REFERENCES print_requests(request_id),
    CONSTRAINT fk_community_projects_author FOREIGN KEY (author_id) REFERENCES users(user_id)
);

-- =============================================
-- PRINT JOBS TABLE (for tracking actual printing)
-- =============================================
CREATE TABLE IF NOT EXISTS print_jobs (
    job_id STRING PRIMARY KEY,                     -- UUID
    request_id STRING NOT NULL,                    -- Reference to print request
    equipment_id STRING NOT NULL,                  -- Reference to equipment
    staff_id STRING NOT NULL,                      -- Staff member handling the job
    start_time TIMESTAMP_NTZ,                      -- Job start time
    end_time TIMESTAMP_NTZ,                        -- Job end time
    status STRING DEFAULT 'queued',                -- queued, printing, completed, failed
    material_used_weight DECIMAL(8,4),             -- Actual material weight used
    actual_cost DECIMAL(10,2),                     -- Actual cost
    notes TEXT,                                    -- Job notes
    quality_rating INTEGER,                        -- Quality rating 1-5
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP,
    -- Foreign key constraints
    CONSTRAINT fk_print_jobs_request FOREIGN KEY (request_id) REFERENCES print_requests(request_id),
    CONSTRAINT fk_print_jobs_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    CONSTRAINT fk_print_jobs_staff FOREIGN KEY (staff_id) REFERENCES users(user_id)
);

-- =============================================
-- AUDIT LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id STRING PRIMARY KEY,                     -- UUID
    user_id STRING,                                -- User who performed action
    action STRING NOT NULL,                        -- Action performed
    table_name STRING,                             -- Table affected
    record_id STRING,                              -- Record ID affected
    old_values VARIANT,                            -- Old values (JSON)
    new_values VARIANT,                            -- New values (JSON)
    ip_address STRING,                             -- IP address
    user_agent STRING,                             -- User agent
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_netid ON users(rutgers_netid);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Print requests indexes
CREATE INDEX IF NOT EXISTS idx_print_requests_user ON print_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_print_requests_status ON print_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_print_requests_public ON print_requests(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_print_requests_material ON print_requests(material, color);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(type, status);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);

-- Community projects indexes
CREATE INDEX IF NOT EXISTS idx_community_author ON community_projects(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_featured ON community_projects(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes ON community_projects(likes DESC, created_at DESC);

-- Print jobs indexes
CREATE INDEX IF NOT EXISTS idx_print_jobs_request ON print_jobs(request_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_equipment ON print_jobs(equipment_id, start_time);
CREATE INDEX IF NOT EXISTS idx_print_jobs_staff ON print_jobs(staff_id, start_time);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name, created_at DESC);

-- =============================================
-- CLUSTERING FOR PERFORMANCE
-- =============================================

-- Cluster tables by commonly queried columns
ALTER TABLE print_requests CLUSTER BY (user_id, created_at);
ALTER TABLE community_projects CLUSTER BY (is_public, created_at);
ALTER TABLE print_jobs CLUSTER BY (equipment_id, start_time);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for user dashboard data
CREATE OR REPLACE VIEW user_dashboard_data AS
SELECT 
    u.user_id,
    u.email,
    u.display_name,
    COUNT(pr.request_id) as total_requests,
    COUNT(CASE WHEN pr.status = 'completed' THEN 1 END) as completed_requests,
    COUNT(CASE WHEN pr.status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN pr.status = 'in_progress' THEN 1 END) as in_progress_requests,
    SUM(pr.actual_cost) as total_spent,
    MAX(pr.created_at) as last_request_date
FROM users u
LEFT JOIN print_requests pr ON u.user_id = pr.user_id
GROUP BY u.user_id, u.email, u.display_name;

-- View for community projects with user info
CREATE OR REPLACE VIEW community_projects_view AS
SELECT 
    cp.project_id,
    cp.title,
    cp.description,
    cp.author_name,
    cp.material,
    cp.color,
    cp.likes,
    cp.downloads,
    cp.model_url,
    cp.fallback_image_url,
    cp.tags,
    cp.is_featured,
    cp.created_at,
    u.profile_image_url as author_avatar
FROM community_projects cp
JOIN users u ON cp.author_id = u.user_id
WHERE cp.is_featured = TRUE OR cp.created_at >= DATEADD(day, -30, CURRENT_TIMESTAMP())
ORDER BY cp.likes DESC, cp.created_at DESC;

-- View for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    COUNT(DISTINCT u.user_id) as total_users,
    COUNT(pr.request_id) as total_requests,
    COUNT(CASE WHEN pr.status = 'completed' THEN 1 END) as completed_requests,
    COUNT(CASE WHEN pr.status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN pr.status = 'in_progress' THEN 1 END) as in_progress_requests,
    SUM(pr.actual_cost) as total_revenue,
    COUNT(e.equipment_id) as total_equipment,
    COUNT(CASE WHEN e.status = 'operational' THEN 1 END) as operational_equipment,
    COUNT(cp.project_id) as community_projects
FROM users u
LEFT JOIN print_requests pr ON u.user_id = pr.user_id
LEFT JOIN equipment e ON 1=1
LEFT JOIN community_projects cp ON 1=1;

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Procedure to create a new print request
CREATE OR REPLACE PROCEDURE create_print_request(
    p_request_id STRING,
    p_user_id STRING,
    p_project_name STRING,
    p_description STRING,
    p_material STRING,
    p_color STRING,
    p_quantity INTEGER,
    p_urgency STRING,
    p_special_instructions STRING,
    p_file_name STRING,
    p_file_size INTEGER,
    p_file_type STRING,
    p_file_url STRING
)
RETURNS STRING
LANGUAGE SQL
AS
$$
BEGIN
    INSERT INTO print_requests (
        request_id, user_id, project_name, description, material, color,
        quantity, urgency, special_instructions, file_name, file_size,
        file_type, file_url
    ) VALUES (
        p_request_id, p_user_id, p_project_name, p_description, p_material, p_color,
        p_quantity, p_urgency, p_special_instructions, p_file_name, p_file_size,
        p_file_type, p_file_url
    );
    
    RETURN 'Print request created successfully';
END;
$$;

-- Procedure to toggle project public status
CREATE OR REPLACE PROCEDURE toggle_project_public(
    p_request_id STRING,
    p_is_public BOOLEAN
)
RETURNS STRING
LANGUAGE SQL
AS
$$
DECLARE
    v_user_id STRING;
    v_title STRING;
    v_description STRING;
    v_material STRING;
    v_color STRING;
    v_author_name STRING;
BEGIN
    -- Get request details
    SELECT user_id, project_name, description, material, color
    INTO v_user_id, v_title, v_description, v_material, v_color
    FROM print_requests
    WHERE request_id = p_request_id;
    
    -- Get author name
    SELECT display_name INTO v_author_name
    FROM users
    WHERE user_id = v_user_id;
    
    -- Update print request
    UPDATE print_requests
    SET is_public = p_is_public, updated_at = CURRENT_TIMESTAMP()
    WHERE request_id = p_request_id;
    
    -- Add or remove from community projects
    IF p_is_public THEN
        -- Add to community projects
        INSERT INTO community_projects (
            project_id, print_request_id, title, description, author_id, author_name,
            material, color, model_url, fallback_image_url
        )
        SELECT 
            UUID_STRING(), p_request_id, v_title, v_description, v_user_id, v_author_name,
            v_material, v_color, model_url, fallback_image_url
        FROM print_requests
        WHERE request_id = p_request_id;
    ELSE
        -- Remove from community projects
        DELETE FROM community_projects
        WHERE print_request_id = p_request_id;
    END IF;
    
    RETURN 'Project public status updated successfully';
END;
$$;

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample materials
INSERT INTO materials (material_id, name, type, colors, cost_per_gram, description) VALUES
('mat_001', 'PLA', 'Filament', '["Any", "Black", "Grey", "Red", "Translucent (Clear)", "Translucent (Light Blue)", "Translucent (Orange)", "Translucent (Purple)", "Translucent (Teal)", "White"]', 0.10, 'Easy to print, biodegradable, good for beginners'),
('mat_002', 'PETG', 'Filament', '["Any", "Black", "Grey", "Red", "Translucent (Clear)", "Translucent (Light Blue)", "Translucent (Orange)", "Translucent (Purple)", "Translucent (Teal)", "White"]', 0.12, 'Strong, flexible, chemical resistant'),
('mat_003', 'ABS', 'Filament', '["Black", "White", "Carbon Fiber Reinforced"]', 0.15, 'Durable, heat resistant, good for functional parts'),
('mat_004', 'TPU', 'Filament', '["Black", "Red", "White"]', 0.18, 'Flexible, rubber-like, good for phone cases'),
('mat_005', 'Resin', 'Resin', '["Black", "White", "Clear", "Hi-temp", "Surgical", "Tough", "Durable", "Flex"]', 0.20, 'High detail, smooth finish, perfect for miniatures'),
('mat_006', 'Markforged', 'Composite', '["Carbon Fiber Reinforced", "Fiberglass Reinforced", "Kevlar Reinforced", "Onyx"]', 0.25, 'High-strength composite materials for industrial applications');

-- Insert sample equipment
INSERT INTO equipment (equipment_id, name, type, model, manufacturer, status, location, capabilities) VALUES
('eq_001', 'Prusa i3 MK3S+', '3D Printer', 'i3 MK3S+', 'Prusa Research', 'operational', 'Main Lab', '["PLA", "PETG", "ABS", "TPU"]'),
('eq_002', 'Ultimaker S5', '3D Printer', 'S5', 'Ultimaker', 'operational', 'Main Lab', '["PLA", "PETG", "ABS", "TPU"]'),
('eq_003', 'Formlabs Form 3', 'Resin Printer', 'Form 3', 'Formlabs', 'operational', 'Resin Lab', '["Resin"]'),
('eq_004', 'Markforged X7', 'Composite Printer', 'X7', 'Markforged', 'operational', 'Advanced Lab', '["Markforged"]'),
('eq_005', 'CNC Mill', 'CNC Machine', 'Tormach PCNC 440', 'Tormach', 'operational', 'CNC Lab', '["Aluminum", "Steel", "Wood"]');

-- =============================================
-- GRANTS AND PERMISSIONS
-- =============================================

-- Grant permissions to application role (adjust role name as needed)
-- GRANT USAGE ON DATABASE RUTGERS_MAKERSPACE TO ROLE MAKERSPACE_APP_ROLE;
-- GRANT USAGE ON SCHEMA MAKERSPACE TO ROLE MAKERSPACE_APP_ROLE;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA MAKERSPACE TO ROLE MAKERSPACE_APP_ROLE;
-- GRANT USAGE ON ALL PROCEDURES IN SCHEMA MAKERSPACE TO ROLE MAKERSPACE_APP_ROLE;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
SELECT 'Rutgers Makerspace Snowflake database schema created successfully!' as status;