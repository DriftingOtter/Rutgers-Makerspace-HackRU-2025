# Database Setup and Migrations

This directory contains all database-related files for the Rutgers Makerspace 3D Printing API.

## Directory Structure

```
database/
├── migrations/          # SQL migration files
├── seeds/              # Test data seeding scripts
├── scripts/            # Migration runner and utilities
├── schema/             # Schema snapshots
└── README.md           # This file
```

## Quick Start

1. **Set up Snowflake account** (see `../SNOWFLAKE_SETUP.md`)
2. **Update environment variables** in `.env`
3. **Test connection**: `npm run test:snowflake`
4. **Run migrations**: `npm run migrate`

## Migration Files

- `001_create_print_requests.sql` - Main print requests table
- `002_create_logs.sql` - Audit logging table
- `003_create_pricing_snapshots.sql` - Pricing history table
- `004_create_schema_migrations.sql` - Migration tracking table

## Available Scripts

- `npm run test:snowflake` - Test Snowflake connection
- `npm run migrate` - Run pending migrations
- `node database/scripts/run-migrations.js` - Run migrations directly

## Environment Variables

Required Snowflake environment variables:

```bash
SF_ACCOUNT=your_account.region
SF_USER=your_username
SF_PASSWORD=your_password
SF_WAREHOUSE=makerspace_dev
SF_DATABASE=makerspace_dev
SF_SCHEMA=api
SF_ROLE=makerspace_api_role
```

## Troubleshooting

### Connection Issues
- Verify account identifier format
- Check username and password
- Ensure warehouse is not suspended

### Migration Issues
- Check database and schema exist
- Verify user has CREATE TABLE permissions
- Review error messages in console

### Permission Issues
- Ensure user has correct role assigned
- Check role has necessary privileges
- Verify warehouse access

## Development Workflow

1. **Create new migration**: Add new `.sql` file to `migrations/`
2. **Test locally**: Run `npm run test:snowflake`
3. **Apply migration**: Run `npm run migrate`
4. **Verify changes**: Check tables in Snowflake console

## Production Deployment

1. **Set up production Snowflake account**
2. **Create production database and schema**
3. **Set production environment variables**
4. **Run migrations in production**
5. **Verify all tables created successfully**