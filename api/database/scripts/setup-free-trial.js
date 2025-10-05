#!/usr/bin/env node

/**
 * Free Trial Safe Setup Script
 * Sets up Snowflake for free trial with minimal resource usage
 */

const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class FreeTrialSetup {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.queryCount = 0;
    this.maxQueries = 50; // Conservative limit for free trial
  }

  async connect() {
    if (this.isConnected) return;

    console.log('🔗 Connecting to Snowflake Free Trial...');
    console.log('⚠️  Using conservative settings for free trial');

    return new Promise((resolve, reject) => {
      this.connection = snowflake.createConnection({
        account: process.env.SF_ACCOUNT,
        username: process.env.SF_USER,
        password: process.env.SF_PASSWORD,
        warehouse: 'COMPUTE_WH', // Use default warehouse for free trial
        database: 'SNOWFLAKE_SAMPLE_DATA', // Use sample database initially
        schema: 'TPCH_SF1', // Use sample schema
        role: 'ACCOUNTADMIN' // Use admin role for setup
      });

      this.connection.connect((err, conn) => {
        if (err) {
          console.error('❌ Connection failed:', err.message);
          reject(err);
        } else {
          this.connection = conn;
          this.isConnected = true;
          console.log('✅ Connected to Snowflake Free Trial');
          resolve();
        }
      });
    });
  }

  async execute(sql) {
    if (!this.isConnected) {
      await this.connect();
    }

    this.queryCount++;
    if (this.queryCount > this.maxQueries) {
      throw new Error('Free trial query limit reached. Please upgrade for more queries.');
    }

    console.log(`📊 Query ${this.queryCount}/${this.maxQueries}: ${sql.substring(0, 50)}...`);

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: sql,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('❌ Query failed:', err.message);
            reject(err);
          } else {
            console.log('✅ Query successful');
            resolve(rows);
          }
        }
      });
    });
  }

  async setupFreeTrial() {
    try {
      console.log('🚀 Setting up Snowflake Free Trial for Rutgers Makerspace API');
      console.log('');

      // Test basic connection
      console.log('1️⃣ Testing basic connection...');
      const result = await this.execute('SELECT CURRENT_USER() as user, CURRENT_ACCOUNT() as account');
      console.log(`   User: ${result[0].USER}`);
      console.log(`   Account: ${result[0].ACCOUNT}`);
      console.log('');

      // Create database (if not exists)
      console.log('2️⃣ Creating makerspace database...');
      await this.execute('CREATE DATABASE IF NOT EXISTS makerspace_dev');
      await this.execute('USE DATABASE makerspace_dev');
      console.log('✅ Database created/verified');
      console.log('');

      // Create schema
      console.log('3️⃣ Creating API schema...');
      await this.execute('CREATE SCHEMA IF NOT EXISTS api');
      await this.execute('USE SCHEMA api');
      console.log('✅ Schema created/verified');
      console.log('');

      // Create warehouse (if needed)
      console.log('4️⃣ Setting up warehouse...');
      try {
        await this.execute(`
          CREATE WAREHOUSE IF NOT EXISTS makerspace_dev
          WAREHOUSE_SIZE = 'X-SMALL'
          AUTO_SUSPEND = 60
          AUTO_RESUME = TRUE
          INITIALLY_SUSPENDED = TRUE
          COMMENT = 'Free trial warehouse for makerspace API'
        `);
        console.log('✅ Warehouse created/verified');
      } catch (err) {
        console.log('⚠️  Warehouse creation failed (may already exist or insufficient privileges)');
        console.log('   Using default warehouse for free trial');
      }
      console.log('');

      // Create user and role (if possible)
      console.log('5️⃣ Setting up user and role...');
      try {
        await this.execute(`
          CREATE USER IF NOT EXISTS makerspace_api_user
          PASSWORD = '${process.env.SF_PASSWORD}'
          DEFAULT_ROLE = makerspace_api_role
          DEFAULT_WAREHOUSE = makerspace_dev
        `);
        
        await this.execute('CREATE ROLE IF NOT EXISTS makerspace_api_role');
        
        // Grant minimal permissions
        await this.execute('GRANT USAGE ON WAREHOUSE makerspace_dev TO ROLE makerspace_api_role');
        await this.execute('GRANT USAGE ON DATABASE makerspace_dev TO ROLE makerspace_api_role');
        await this.execute('GRANT USAGE ON SCHEMA makerspace_dev.api TO ROLE makerspace_api_role');
        await this.execute('GRANT CREATE TABLE ON SCHEMA makerspace_dev.api TO ROLE makerspace_api_role');
        await this.execute('GRANT ROLE makerspace_api_role TO USER makerspace_api_user');
        
        console.log('✅ User and role created/verified');
      } catch (err) {
        console.log('⚠️  User/role creation failed (insufficient privileges in free trial)');
        console.log('   Using current user for testing');
      }
      console.log('');

      // Test table creation
      console.log('6️⃣ Testing table creation...');
      try {
        await this.execute(`
          CREATE TABLE IF NOT EXISTS test_table (
            id STRING PRIMARY KEY,
            name STRING,
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await this.execute("INSERT INTO test_table (id, name) VALUES ('test-1', 'test record')");
        
        const testResult = await this.execute('SELECT * FROM test_table WHERE id = ?', ['test-1']);
        console.log('✅ Table creation and data insertion successful');
        console.log(`   Test record: ${JSON.stringify(testResult[0])}`);
        
        // Clean up test table
        await this.execute('DROP TABLE test_table');
        console.log('✅ Test table cleaned up');
      } catch (err) {
        console.log('❌ Table creation failed:', err.message);
        throw err;
      }
      console.log('');

      console.log('🎉 Free trial setup completed successfully!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. Update your .env file with the correct database/schema');
      console.log('   2. Run: npm run migrate');
      console.log('   3. Test with: npm run test:snowflake');
      console.log('');
      console.log('⚠️  Free trial limitations:');
      console.log('   - Limited compute time');
      console.log('   - Limited storage');
      console.log('   - Some features may be restricted');
      console.log('   - Consider upgrading for production use');

    } catch (error) {
      console.error('💥 Setup failed:', error.message);
      throw error;
    } finally {
      if (this.connection) {
        this.connection.destroy();
      }
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new FreeTrialSetup();
  setup.setupFreeTrial()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Setup failed:', err.message);
      process.exit(1);
    });
}

module.exports = FreeTrialSetup;