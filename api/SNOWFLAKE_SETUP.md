# Snowflake Setup Guide

## Step 1: Create Snowflake Trial Account

1. **Go to Snowflake Trial**: Visit [https://signup.snowflake.com/](https://signup.snowflake.com/)
2. **Sign up** with your email address
3. **Choose a cloud provider** (AWS, Azure, or GCP) - AWS is recommended for beginners
4. **Select a region** close to your location
5. **Complete the signup** process

## Step 2: Get Your Account Information

After signing up, you'll need to find your account information:

1. **Log into Snowflake** at [https://app.snowflake.com/](https://app.snowflake.com/)
2. **Go to Admin → Accounts** to find your account identifier
3. **Your account identifier** will look like: `abc12345.us-east-1` or `abc12345.aws.us-east-1`

## Step 3: Create Database and Schema

1. **Open a worksheet** in Snowflake
2. **Run these commands** to set up your environment:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS makerspace_dev;

-- Use the database
USE DATABASE makerspace_dev;

-- Create schema
CREATE SCHEMA IF NOT EXISTS api;

-- Use the schema
USE SCHEMA api;

-- Create warehouse
CREATE WAREHOUSE IF NOT EXISTS makerspace_dev
  WAREHOUSE_SIZE = 'X-SMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE
  COMMENT = 'Development warehouse for makerspace API';

-- Create user and role
CREATE USER IF NOT EXISTS makerspace_api_user
  PASSWORD = 'YourSecurePassword123!'
  DEFAULT_ROLE = makerspace_api_role
  DEFAULT_WAREHOUSE = makerspace_dev;

CREATE ROLE IF NOT EXISTS makerspace_api_role;

-- Grant permissions
GRANT USAGE ON WAREHOUSE makerspace_dev TO ROLE makerspace_api_role;
GRANT USAGE ON DATABASE makerspace_dev TO ROLE makerspace_api_role;
GRANT USAGE ON SCHEMA makerspace_dev.api TO ROLE makerspace_api_role;
GRANT CREATE TABLE ON SCHEMA makerspace_dev.api TO ROLE makerspace_api_role;
GRANT CREATE INDEX ON SCHEMA makerspace_dev.api TO ROLE makerspace_api_role;

-- Assign role to user
GRANT ROLE makerspace_api_role TO USER makerspace_api_user;
```

## Step 4: Update Environment Variables

Update your `.env` file with your actual Snowflake credentials:

```bash
# Snowflake Configuration
SF_ACCOUNT=your_account.region          # e.g., abc12345.us-east-1
SF_USER=makerspace_api_user             # The user you created
SF_PASSWORD=YourSecurePassword123!      # The password you set
SF_WAREHOUSE=makerspace_dev             # The warehouse you created
SF_DATABASE=makerspace_dev              # The database you created
SF_SCHEMA=api                           # The schema you created
SF_ROLE=makerspace_api_role             # The role you created
```

## Step 5: Test the Connection

Run the test script to verify everything is working:

```bash
cd api
node test-snowflake.js
```

## Step 6: Run Migrations

Once the connection is working, run the migrations to create the tables:

```bash
cd api
node database/scripts/run-migrations.js
```

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check your account identifier format
2. **Authentication Error**: Verify username and password
3. **Permission Denied**: Make sure the user has the correct role
4. **Warehouse Not Found**: Ensure the warehouse exists and is not suspended

### Getting Help

- **Snowflake Documentation**: [https://docs.snowflake.com/](https://docs.snowflake.com/)
- **Community Forum**: [https://community.snowflake.com/](https://community.snowflake.com/)
- **Support**: Available through your Snowflake account

## Security Notes

- **Never commit** your `.env` file to version control
- **Use strong passwords** for your Snowflake user
- **Rotate credentials** regularly
- **Use least privilege** - only grant necessary permissions

## Cost Management

- **X-SMALL warehouse** is sufficient for development
- **Auto-suspend** is enabled to save costs
- **Monitor usage** in the Snowflake console
- **Set up billing alerts** if needed