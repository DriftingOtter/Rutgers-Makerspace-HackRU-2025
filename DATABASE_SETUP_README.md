# Rutgers Makerspace Database Setup

This guide provides everything you need to set up the Snowflake database for the Rutgers Makerspace 3D printing application.

## 🚀 Quick Start

### Option 1: One-Command Setup (Recommended)

```bash
./setup-snowflake.sh
```

This will handle everything automatically:
- Install SnowSQL CLI
- Configure database connection
- Create database schema
- Set up sample data
- Install dependencies
- Integrate with the application

### Option 2: Step-by-Step Setup

1. **Configure Database Connection**:
   ```bash
   ./setup-database-only.sh
   ```

2. **Create Database Schema**:
   ```bash
   snowsql -a YOUR_ACCOUNT -u YOUR_USERNAME -p 'YOUR_PASSWORD' -w COMPUTE_WH -d RUTGERS_MAKERSPACE -s MAKERSPACE -r ACCOUNTADMIN -f api/database/snowflake_schema.sql
   ```

3. **Integrate with Application**:
   ```bash
   node integrate-database.js
   ```

4. **Test Database Connection**:
   ```bash
   node test-database-connection.js
   ```

## 📋 Prerequisites

Before starting, ensure you have:

- **Snowflake Account**: With appropriate permissions
- **SnowSQL CLI** (optional but recommended)
- **Node.js**: Version 16 or higher
- **npm**: Package manager

## 🗄️ Database Schema

The setup creates a comprehensive database schema with the following tables:

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts and profiles | user_id, email, display_name, rutgers_netid |
| `print_requests` | 3D printing requests | request_id, user_id, project_name, material, color |
| `equipment` | Available 3D printers and equipment | equipment_id, name, type, status, location |
| `materials` | Available printing materials | material_id, name, type, colors, cost_per_gram |
| `community_projects` | Public project gallery | project_id, title, author_id, likes, downloads |
| `print_jobs` | Actual printing job tracking | job_id, request_id, equipment_id, status |
| `audit_logs` | System audit trail | log_id, user_id, action, table_name |

### Views and Procedures

- **`user_dashboard_data`**: Aggregated user statistics
- **`community_projects_view`**: Public project gallery with user info
- **`admin_dashboard_stats`**: System-wide statistics
- **`create_print_request`**: Procedure for creating requests
- **`toggle_project_public`**: Procedure for public/private toggle

## 🔧 Configuration

### Environment Variables

The setup creates a comprehensive `.env` file in the `api/` directory:

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

## 📊 Data Structure Mapping

The database schema perfectly matches the current application data structure:

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

## 🧪 Testing

### Test Database Connection

```bash
node test-database-connection.js
```

This will test:
- Database connectivity
- Table existence
- Sample data
- Views and procedures
- Basic functionality

### Test API Endpoints

1. **Start the API server**:
   ```bash
   cd api && npm start
   ```

2. **Test health check**:
   ```bash
   curl http://localhost:8080/api/health
   ```

3. **Test database health**:
   ```bash
   curl http://localhost:8080/api/health/database
   ```

4. **Test print request creation**:
   ```bash
   curl -X POST http://localhost:8080/api/print-request \
     -H "Content-Type: application/json" \
     -d '{
       "projectName": "Test Project",
       "description": "Test Description",
       "material": "PLA",
       "color": "Red",
       "quantity": 1,
       "urgency": "normal"
     }'
   ```

## 🔍 Troubleshooting

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

If automated setup fails:

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

## 🚀 Production Deployment

For production deployment:

1. **Update CORS settings** in `api/.env`
2. **Configure proper SMTP** for email notifications
3. **Set up file storage** (AWS S3, Google Cloud Storage, etc.)
4. **Configure monitoring** and logging
5. **Set up backups** for the database
6. **Use environment-specific** configuration files

## 📁 File Structure

```
Rutgers-Makerspace-HackRU-2025/
├── setup-snowflake.sh              # Full automated setup
├── setup-database-only.sh          # Database configuration only
├── integrate-database.js           # API integration script
├── test-database-connection.js     # Database connection test
├── SNOWFLAKE_SETUP_GUIDE.md        # Detailed setup guide
├── DATABASE_SETUP_README.md        # This file
└── api/
    ├── .env                        # Database configuration
    ├── database/
    │   └── snowflake_schema.sql    # Database schema
    └── src/
        └── database/
            └── snowflake.js        # Database integration module
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Credentials**: Use strong passwords and rotate regularly
3. **File Uploads**: Validate file types and sizes
4. **API Keys**: Keep API keys secure and rotate as needed
5. **CORS**: Configure CORS properly for production

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the Snowflake documentation
3. Check the application logs
4. Verify your Snowflake account permissions

## 🎯 Next Steps

After successful setup:

1. **Customize the application** for your specific needs
2. **Add more materials** and equipment to the database
3. **Configure email notifications** for print requests
4. **Set up file storage** for 3D model files
5. **Train staff** on the admin dashboard
6. **Promote the application** to users

---

**Happy 3D Printing! 🖨️**

For more detailed information, see the [SNOWFLAKE_SETUP_GUIDE.md](SNOWFLAKE_SETUP_GUIDE.md) file.