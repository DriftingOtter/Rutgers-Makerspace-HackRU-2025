#!/usr/bin/env node

/**
 * Test script to verify Snowflake connection and basic functionality
 */

require('dotenv').config();
const snowflakeClient = require('./src/database/snowflakeClient');
const PrintRequestRepository = require('./src/repositories/PrintRequestRepository');

async function testSnowflakeConnection() {
  console.log('🧪 Testing Snowflake Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   SF_ACCOUNT: ${process.env.SF_ACCOUNT ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SF_USER: ${process.env.SF_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SF_PASSWORD: ${process.env.SF_PASSWORD ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SF_WAREHOUSE: ${process.env.SF_WAREHOUSE ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SF_DATABASE: ${process.env.SF_DATABASE ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SF_SCHEMA: ${process.env.SF_SCHEMA ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SF_ROLE: ${process.env.SF_ROLE ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.SF_ACCOUNT || !process.env.SF_USER || !process.env.SF_PASSWORD) {
    console.error('❌ Missing required Snowflake environment variables');
    console.log('\n💡 Please set the following environment variables:');
    console.log('   SF_ACCOUNT=your_account.region');
    console.log('   SF_USER=your_username');
    console.log('   SF_PASSWORD=your_password');
    console.log('   SF_WAREHOUSE=makerspace_dev');
    console.log('   SF_DATABASE=makerspace_dev');
    console.log('   SF_SCHEMA=api');
    console.log('   SF_ROLE=makerspace_api_role');
    return false;
  }

  try {
    // Test basic connection
    console.log('🔌 Testing basic connection...');
    const healthCheck = await snowflakeClient.healthCheck();
    
    if (healthCheck.status === 'healthy') {
      console.log('✅ Snowflake connection successful!');
      console.log(`   Database: ${healthCheck.database}`);
      console.log(`   Schema: ${healthCheck.schema}`);
      console.log(`   Timestamp: ${healthCheck.timestamp}\n`);
    } else {
      console.log('❌ Snowflake connection failed:', healthCheck.error);
      return false;
    }

    // Test basic query
    console.log('📊 Testing basic query...');
    const result = await snowflakeClient.execute('SELECT CURRENT_USER() as current_user, CURRENT_ROLE() as current_role');
    console.log('✅ Query executed successfully!');
    console.log(`   Current User: ${result[0].CURRENT_USER}`);
    console.log(`   Current Role: ${result[0].CURRENT_ROLE}\n`);

    // Test repository functionality
    console.log('🏗️  Testing repository functionality...');
    const printRequestRepo = new PrintRequestRepository();
    
    // Test creating a request
    const testRequestData = {
      user_id: 'test-user-123',
      filament_type: 'PLA',
      print_color: 'Red',
      file_link: 'https://example.com/test.stl',
      file_type: 'stl',
      details: 'Test request for Snowflake integration'
    };

    console.log('📝 Creating test print request...');
    const requestId = await printRequestRepo.createRequest(testRequestData);
    console.log(`✅ Test request created with ID: ${requestId}`);

    // Test retrieving the request
    console.log('🔍 Retrieving test request...');
    const retrievedRequest = await printRequestRepo.getRequestById(requestId);
    
    if (retrievedRequest) {
      console.log('✅ Test request retrieved successfully!');
      console.log(`   User ID: ${retrievedRequest.userId}`);
      console.log(`   Filament Type: ${retrievedRequest.filamentType}`);
      console.log(`   Status: ${retrievedRequest.status}`);
    } else {
      console.log('❌ Failed to retrieve test request');
      return false;
    }

    // Test updating the request
    console.log('🔄 Testing request update...');
    await printRequestRepo.updateRequestStatus(requestId, 'completed', {
      message: 'Test completed successfully',
      confidence: 0.95
    });
    console.log('✅ Test request updated successfully!');

    // Test getting user requests
    console.log('👤 Testing user requests query...');
    const userRequests = await printRequestRepo.getRequestsByUser('test-user-123');
    console.log(`✅ Found ${userRequests.length} requests for test user`);

    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await snowflakeClient.execute('DELETE FROM print_requests WHERE request_id = ?', [requestId]);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All Snowflake tests passed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Snowflake test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    await snowflakeClient.disconnect();
  }
}

// Run the test
if (require.main === module) {
  testSnowflakeConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testSnowflakeConnection;