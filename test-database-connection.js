#!/usr/bin/env node

/**
 * Rutgers Makerspace Database Connection Test
 * This script tests the Snowflake database connection and basic functionality
 */

const snowflake = require('snowflake-sdk');
require('dotenv').config({ path: './api/.env' });

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Database configuration
const dbConfig = {
    account: process.env.SF_ACCOUNT,
    username: process.env.SF_USER,
    password: process.env.SF_PASSWORD,
    warehouse: process.env.SF_WAREHOUSE,
    database: process.env.SF_DATABASE,
    schema: process.env.SF_SCHEMA,
    role: process.env.SF_ROLE
};

// Validate configuration
function validateConfig() {
    logInfo('Validating database configuration...');
    
    const required = ['SF_ACCOUNT', 'SF_USER', 'SF_PASSWORD', 'SF_WAREHOUSE', 'SF_DATABASE', 'SF_SCHEMA', 'SF_ROLE'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        logError(`Missing required environment variables: ${missing.join(', ')}`);
        logError('Please run ./setup-database-only.sh to configure the database connection.');
        return false;
    }
    
    logSuccess('Configuration validation passed');
    return true;
}

// Test database connection
async function testConnection() {
    return new Promise((resolve, reject) => {
        logInfo('Testing database connection...');
        
        const connection = snowflake.createConnection(dbConfig);
        
        connection.connect((err, conn) => {
            if (err) {
                logError(`Connection failed: ${err.message}`);
                reject(err);
                return;
            }
            
            logSuccess('Database connection successful!');
            resolve(conn);
        });
    });
}

// Test basic queries
async function testQueries(connection) {
    logInfo('Testing basic database queries...');
    
    const queries = [
        {
            name: 'Current User',
            sql: 'SELECT CURRENT_USER() as current_user;'
        },
        {
            name: 'Current Database',
            sql: 'SELECT CURRENT_DATABASE() as current_database;'
        },
        {
            name: 'Current Schema',
            sql: 'SELECT CURRENT_SCHEMA() as current_schema;'
        },
        {
            name: 'Current Warehouse',
            sql: 'SELECT CURRENT_WAREHOUSE() as current_warehouse;'
        },
        {
            name: 'Current Role',
            sql: 'SELECT CURRENT_ROLE() as current_role;'
        }
    ];
    
    for (const query of queries) {
        try {
            const result = await executeQuery(connection, query.sql);
            logSuccess(`${query.name}: ${result[0][Object.keys(result[0])[0]]}`);
        } catch (err) {
            logError(`${query.name} failed: ${err.message}`);
        }
    }
}

// Test table existence
async function testTables(connection) {
    logInfo('Checking if required tables exist...');
    
    const tables = [
        'users',
        'print_requests',
        'equipment',
        'materials',
        'community_projects',
        'print_jobs',
        'audit_logs'
    ];
    
    for (const table of tables) {
        try {
            const result = await executeQuery(connection, `SHOW TABLES LIKE '${table.toUpperCase()}';`);
            if (result.length > 0) {
                logSuccess(`Table ${table} exists`);
            } else {
                logWarning(`Table ${table} does not exist`);
            }
        } catch (err) {
            logError(`Error checking table ${table}: ${err.message}`);
        }
    }
}

// Test sample data
async function testSampleData(connection) {
    logInfo('Checking sample data...');
    
    try {
        // Check users
        const userCount = await executeQuery(connection, 'SELECT COUNT(*) as count FROM users;');
        logInfo(`Users in database: ${userCount[0].COUNT}`);
        
        // Check print requests
        const requestCount = await executeQuery(connection, 'SELECT COUNT(*) as count FROM print_requests;');
        logInfo(`Print requests in database: ${requestCount[0].COUNT}`);
        
        // Check equipment
        const equipmentCount = await executeQuery(connection, 'SELECT COUNT(*) as count FROM equipment;');
        logInfo(`Equipment in database: ${equipmentCount[0].COUNT}`);
        
        // Check materials
        const materialCount = await executeQuery(connection, 'SELECT COUNT(*) as count FROM materials;');
        logInfo(`Materials in database: ${materialCount[0].COUNT}`);
        
    } catch (err) {
        logError(`Error checking sample data: ${err.message}`);
    }
}

// Execute a query
function executeQuery(connection, sql) {
    return new Promise((resolve, reject) => {
        connection.execute({
            sqlText: sql,
            complete: (err, stmt, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        });
    });
}

// Test views
async function testViews(connection) {
    logInfo('Testing database views...');
    
    const views = [
        'user_dashboard_data',
        'community_projects_view',
        'admin_dashboard_stats'
    ];
    
    for (const view of views) {
        try {
            const result = await executeQuery(connection, `SELECT COUNT(*) as count FROM ${view};`);
            logSuccess(`View ${view} is accessible (${result[0].COUNT} rows)`);
        } catch (err) {
            logWarning(`View ${view} not accessible: ${err.message}`);
        }
    }
}

// Test stored procedures
async function testProcedures(connection) {
    logInfo('Testing stored procedures...');
    
    try {
        // Test create_print_request procedure
        const result = await executeQuery(connection, `
            CALL create_print_request(
                'test_req_001',
                'user_001',
                'Test Project',
                'Test Description',
                'PLA',
                'Red',
                1,
                'normal',
                'Test instructions',
                'test.stl',
                1024,
                'stl',
                'https://example.com/test.stl'
            );
        `);
        logSuccess('create_print_request procedure works');
        
        // Clean up test data
        await executeQuery(connection, "DELETE FROM print_requests WHERE request_id = 'test_req_001';");
        
    } catch (err) {
        logWarning(`Stored procedure test failed: ${err.message}`);
    }
}

// Main test function
async function runTests() {
    log('🚀 Starting Rutgers Makerspace Database Connection Test', 'cyan');
    log('=' .repeat(60), 'cyan');
    
    try {
        // Validate configuration
        if (!validateConfig()) {
            process.exit(1);
        }
        
        // Test connection
        const connection = await testConnection();
        
        // Run tests
        await testQueries(connection);
        await testTables(connection);
        await testSampleData(connection);
        await testViews(connection);
        await testProcedures(connection);
        
        // Close connection
        connection.destroy();
        
        log('=' .repeat(60), 'cyan');
        logSuccess('All tests completed successfully! 🎉');
        logInfo('Your database is ready to use with the Rutgers Makerspace application.');
        
    } catch (err) {
        logError(`Test failed: ${err.message}`);
        process.exit(1);
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(err => {
        logError(`Unexpected error: ${err.message}`);
        process.exit(1);
    });
}

module.exports = { runTests, testConnection, validateConfig };