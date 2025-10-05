#!/usr/bin/env node

/**
 * Simple Snowflake connection test for free trial
 */

require('dotenv').config();
const snowflake = require('snowflake-sdk');

async function testSimpleConnection() {
  console.log('🧪 Simple Snowflake Connection Test');
  console.log('=====================================\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   SF_ACCOUNT: ${process.env.SF_ACCOUNT}`);
  console.log(`   SF_USER: ${process.env.SF_USER}`);
  console.log(`   SF_PASSWORD: ${process.env.SF_PASSWORD ? '***hidden***' : 'NOT SET'}`);
  console.log(`   SF_WAREHOUSE: ${process.env.SF_WAREHOUSE}`);
  console.log(`   SF_DATABASE: ${process.env.SF_DATABASE}`);
  console.log(`   SF_SCHEMA: ${process.env.SF_SCHEMA}`);
  console.log(`   SF_ROLE: ${process.env.SF_ROLE}\n`);

  return new Promise((resolve, reject) => {
    console.log('🔌 Attempting connection...');
    
    const connection = snowflake.createConnection({
      account: process.env.SF_ACCOUNT,
      username: process.env.SF_USER,
      password: process.env.SF_PASSWORD,
      warehouse: process.env.SF_WAREHOUSE,
      database: process.env.SF_DATABASE,
      schema: process.env.SF_SCHEMA,
      role: process.env.SF_ROLE
    });

    connection.connect((err, conn) => {
      if (err) {
        console.error('❌ Connection failed:', err.message);
        console.error('Error details:', err);
        reject(err);
        return;
      }

      console.log('✅ Connection successful!');
      console.log('📊 Testing basic query...');

      // Test a simple query
      conn.execute({
        sqlText: 'SELECT CURRENT_USER() as user, CURRENT_ACCOUNT() as account, CURRENT_DATABASE() as database, CURRENT_SCHEMA() as schema',
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('❌ Query failed:', err.message);
            console.error('Query error details:', err);
            reject(err);
            return;
          }

          console.log('✅ Query successful!');
          console.log('📋 Connection details:');
          console.log(`   User: ${rows[0].USER}`);
          console.log(`   Account: ${rows[0].ACCOUNT}`);
          console.log(`   Database: ${rows[0].DATABASE}`);
          console.log(`   Schema: ${rows[0].SCHEMA}`);
          console.log('\n🎉 Snowflake connection test passed!');
          
          // Close connection
          conn.destroy();
          resolve(true);
        }
      });
    });
  });
}

// Run the test
if (require.main === module) {
  testSimpleConnection()
    .then(() => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Test failed:', err.message);
      process.exit(1);
    });
}

module.exports = testSimpleConnection;