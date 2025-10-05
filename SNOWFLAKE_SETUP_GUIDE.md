# Rutgers Makerspace Snowflake Database Setup Guide

This guide will help you set up the Snowflake database for the Rutgers Makerspace 3D printing application.

## Prerequisites

Before starting, make sure you have:

1. **Snowflake Account**: A Snowflake account with appropriate permissions
2. **SnowSQL CLI** (optional but recommended): For easier database management
3. **Node.js**: Version 16 or higher
4. **npm**: Package manager for Node.js

## Quick Setup Options

### Option 1: Full Automated Setup (Recommended)

Run the complete setup script that handles everything:

```bash
./setup-snowflake.sh
```

This script will:
- Install SnowSQL CLI (if needed)
- Prompt for your Snowflake credentials
- Test the connection
- Create the database schema
- Set up sample data
- Install all dependencies
- Create the `.env` configuration file

### Option 2: Database Configuration Only

If you just want to configure the database connection:

```bash
./setup-database-only.sh
```

This script will:
- Prompt for your Snowflake credentials
- Create the `.env` configuration file
- Provide instructions for manual schema setup

### Option 3: Manual Setup

If you prefer to set up everything manually:

1. **Configure Database Connection**:
   ```bash
   ./setup-database-only.sh
   ```

2. **Create Database Schema**:
   ```bash
   snowsql -a YOUR_ACCOUNT -u YOUR_USERNAME -p 'YOUR_PASSWORD' -w COMPUTE_WH -d RUTGERS_MAKERSPACE -s MAKERSPACE -r ACCOUNTADMIN -f api/database/snowflake_schema.sql
   ```

3. **Install Dependencies**:
   ```bash
   # API dependencies
   cd api && npm install && cd ..
   
   # Frontend dependencies
   cd frontend && npm install && cd ..
   ```

## Snowflake Account Information

You'll need the following information from your Snowflake account:

- **Account**: Your Snowflake account identifier (e.g., `abc12345`)
- **Username**: Your Snowflake username
- **Password**: Your Snowflake password
- **Warehouse**: The warehouse to use (default: `COMPUTE_WH`)
- **Database**: The database name (default: `RUTGERS_MAKERSPACE`)
- **Schema**: The schema name (default: `MAKERSPACE`)
- **Role**: Your role (default: `ACCOUNTADMIN`)

## Database Schema Overview

The setup creates the following tables:

### Core Tables

1. **`users`** - User accounts and profiles
   - Firebase UID, email, display name
   - Rutgers NetID, phone number
   - Admin/staff status, preferences

2. **`print_requests`** - 3D printing requests
   - Project details, material, color
   - File information, status tracking
   - Public visibility, cost estimates

3. **`equipment`** - Available 3D printers and equipment
   - Equipment details, capabilities
   - Status, location, maintenance info

4. **`materials`** - Available printing materials
   - Material types, colors, costs
   - Properties and descriptions

5. **`community_projects`** - Public project gallery
   - Project sharing, likes, downloads
   - Author information, tags

6. **`print_jobs`** - Actual printing job tracking
   - Job status, equipment assignment
   - Staff handling, quality ratings

7. **`audit_logs`** - System audit trail
   - User actions, data changes
   - Security and compliance tracking

### Views and Procedures

- **`user_dashboard_data`** - Aggregated user statistics
- **`community_projects_view`** - Public project gallery with user info
- **`admin_dashboard_stats`** - System-wide statistics
- **`create_print_request`** - Procedure for creating requests
- **`toggle_project_public`** - Procedure for public/private toggle

## Configuration Files

### API Configuration (`api/.env`)

The setup creates a comprehensive `.env` file with:

```bash
# Snowflake Configuration
SF_ACCOUNT=your_account
SF_USER=your_username
SF_PASSWORD=your_password
SF_WAREHOUSE=COMPUTE_WH
SF_DATABASE=RUTGERS_MAKERSPACE
SF_SCHEMA=MAKERSPACE
SF_ROLE=ACCOUNTADMIN

# Database Connection Pool
DB_POOL_MIN=1
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_ACQUIRE_TIMEOUT=60000

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
ALLOWED_FILE_TYPES=stl,obj,3mf

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=makerspace@rutgers.edu
SMTP_PASS=your_email_password
FROM_EMAIL=makerspace@rutgers.edu
FROM_NAME=Rutgers Makerspace

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:8085
CORS_CREDENTIALS=true
```

## Data Structure Mapping

The database schema matches the current application data structure:

### Print Request Form Fields
- `project_name` → Project Name
- `description` → Project Description
- `material` → Material Selection (PLA, PETG, ABS, etc.)
- `color` → Color Selection (dynamically based on material)
- `quantity` → Number of copies
- `urgency` → Urgency level (low, normal, high, urgent)
- `special_instructions` → Special Instructions
- `file_name` → Uploaded file name
- `file_size` → File size in bytes
- `file_type` → File type (stl, obj, 3mf)

### User Dashboard Features
- `is_public` → Make Public toggle
- `model_url` → 3D model viewer URL
- `fallback_image_url` → Fallback image for 3D viewer
- `status` → Request status tracking
- `estimated_cost` → Cost estimation
- `actual_cost` → Final cost

### Community Features
- `community_projects` → Public project gallery
- `likes` → Project likes
- `downloads` → Project downloads
- `tags` → Project tags
- `is_featured` → Featured projects

## Testing the Setup

After setup, test the configuration:

1. **Start the API server**:
   ```bash
   cd api && npm start
   ```

2. **Start the frontend**:
   ```bash
   cd frontend && npm start
   ```

3. **Visit the application**:
   - Frontend: http://localhost:8085
   - API: http://localhost:8080

4. **Test database connection**:
   - Try creating a print request
   - Check if data appears in the dashboard
   - Verify 3D model viewer works

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Check your Snowflake credentials
   - Verify account format (no special characters)
   - Ensure you have proper permissions

2. **Schema Creation Failed**:
   - Check if database and schema exist
   - Verify role permissions
   - Run schema file manually

3. **Sample Data Issues**:
   - Check if tables were created successfully
   - Verify foreign key constraints
   - Run sample data script manually

### Manual Schema Execution

If automated setup fails, run the schema manually:

```bash
snowsql -a YOUR_ACCOUNT -u YOUR_USERNAME -p 'YOUR_PASSWORD' -w COMPUTE_WH -d RUTGERS_MAKERSPACE -s MAKERSPACE -r ACCOUNTADMIN -f api/database/snowflake_schema.sql
```

### Manual Sample Data

To add sample data manually:

```sql
-- Connect to your database
USE DATABASE RUTGERS_MAKERSPACE;
USE SCHEMA MAKERSPACE;

-- Insert sample users
INSERT INTO users (user_id, email, display_name, rutgers_netid, is_admin, is_staff) VALUES
('user_001', 'admin@rutgers.edu', 'Admin User', 'admin', true, true),
('user_002', 'staff@rutgers.edu', 'Staff Member', 'staff', false, true),
('user_003', 'student1@rutgers.edu', 'John Doe', 'jdoe123', false, false);

-- Insert sample print requests
INSERT INTO print_requests (request_id, user_id, project_name, description, material, color, quantity, urgency, status, is_public) VALUES
('req_001', 'user_003', 'Custom Phone Case', '3D printed phone case for iPhone 15', 'PLA', 'Red', 1, 'normal', 'completed', true);
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Credentials**: Use strong passwords and rotate regularly
3. **File Uploads**: Validate file types and sizes
4. **API Keys**: Keep API keys secure and rotate as needed
5. **CORS**: Configure CORS properly for production

## Production Deployment

For production deployment:

1. **Update CORS settings** in `api/.env`
2. **Configure proper SMTP** for email notifications
3. **Set up file storage** (AWS S3, Google Cloud Storage, etc.)
4. **Configure monitoring** and logging
5. **Set up backups** for the database
6. **Use environment-specific** configuration files

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the Snowflake documentation
3. Check the application logs
4. Verify your Snowflake account permissions

## Next Steps

After successful setup:

1. **Customize the application** for your specific needs
2. **Add more materials** and equipment to the database
3. **Configure email notifications** for print requests
4. **Set up file storage** for 3D model files
5. **Train staff** on the admin dashboard
6. **Promote the application** to users

---

**Happy 3D Printing! 🖨️**