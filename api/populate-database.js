#!/usr/bin/env node

/**
 * Populate Snowflake database with realistic demo data
 */

require('dotenv').config();
const snowflakeClient = require('./src/database/snowflakeClient');

async function populateDatabase() {
  console.log('🏗️  Populating database with realistic demo data...\n');
  
  try {
    // Connect to Snowflake
    console.log('🔌 Connecting to Snowflake...');
    await snowflakeClient.connect();
    console.log('✅ Connected successfully!\n');

    // Use the database and schema
    await snowflakeClient.execute('USE DATABASE RUTGERS_MAKERSPACE');
    await snowflakeClient.execute('USE SCHEMA MAKERSPACE');
    console.log('✅ Using RUTGERS_MAKERSPACE.MAKERSPACE');

    // Clear existing demo data
    console.log('\n🧹 Clearing existing demo data...');
    await snowflakeClient.execute('DELETE FROM print_requests WHERE user_id LIKE ?', ['demo-user-%']);
    await snowflakeClient.execute('DELETE FROM users WHERE user_id LIKE ?', ['demo-user-%']);
    console.log('✅ Demo data cleared');

    // Insert realistic users
    console.log('\n👥 Creating realistic users...');
    const users = [
      ['demo-user-1', 'alex.chen@rutgers.edu', 'Alex Chen', 'ac1234', '+1-555-0101', false, false, 'active'],
      ['demo-user-2', 'sarah.johnson@rutgers.edu', 'Sarah Johnson', 'sj5678', '+1-555-0102', false, false, 'active'],
      ['demo-user-3', 'mike.rodriguez@rutgers.edu', 'Mike Rodriguez', 'mr9012', '+1-555-0103', false, false, 'active'],
      ['demo-user-4', 'emma.wilson@rutgers.edu', 'Emma Wilson', 'ew3456', '+1-555-0104', false, false, 'active'],
      ['demo-user-5', 'james.brown@rutgers.edu', 'James Brown', 'jb7890', '+1-555-0105', false, false, 'active'],
      ['demo-user-6', 'lisa.davis@rutgers.edu', 'Lisa Davis', 'ld2468', '+1-555-0106', false, false, 'active'],
      ['demo-user-7', 'david.miller@rutgers.edu', 'David Miller', 'dm1357', '+1-555-0107', false, false, 'active'],
      ['demo-user-8', 'admin@rutgers.edu', 'Admin User', 'admin', '+1-555-0000', true, true, 'active']
    ];

    for (const user of users) {
      await snowflakeClient.execute(`
        INSERT INTO users (
          user_id, email, display_name, rutgers_netid, phone_number, 
          is_admin, is_staff, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, user);
    }
    console.log(`✅ Created ${users.length} users`);

    // Insert realistic print requests
    console.log('\n🖨️  Creating realistic print requests...');
    const printRequests = [
      // Completed requests
      ['req-001', 'demo-user-1', 'Rutgers Logo Keychain', 'Custom Rutgers logo keychain for students. High quality print with smooth finish.', 'PLA', 'Red', 5, 'normal', 'Please use 0.2mm layer height for best detail', 'rutgers_keychain.stl', 2048576, 'stl', 'https://storage.example.com/files/rutgers_keychain.stl', null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'completed', 12.50, 12.50, 2.5, 2.3, 'printer-001', '{"layer_height": 0.2, "infill": 20}', 'Great print quality, customer very satisfied', true, '2024-01-15T10:30:00Z', '2024-01-15T13:00:00Z', '2024-01-15T15:30:00Z'],
      
      ['req-002', 'demo-user-2', 'Phone Stand', 'Adjustable phone stand for desk work. Needs to be sturdy and stable.', 'PETG', 'Black', 2, 'normal', 'Make sure the base is heavy enough to prevent tipping', 'phone_stand.stl', 1536000, 'stl', 'https://storage.example.com/files/phone_stand.stl', null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'completed', 18.75, 18.75, 3.0, 2.8, 'printer-002', '{"layer_height": 0.15, "infill": 30}', 'Perfect fit and finish', true, '2024-01-18T14:20:00Z', '2024-01-18T17:20:00Z', '2024-01-18T20:00:00Z'],
      
      ['req-003', 'demo-user-3', 'Cable Organizer', '3D printed cable management solution for desk setup. Multiple compartments needed.', 'ABS', 'White', 1, 'high', 'Need this by tomorrow for presentation', 'cable_organizer.stl', 3072000, 'stl', 'https://storage.example.com/files/cable_organizer.stl', null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'completed', 25.00, 28.00, 4.0, 3.5, 'printer-001', '{"layer_height": 0.2, "infill": 25}', 'Rush job completed on time', true, '2024-01-20T09:15:00Z', '2024-01-20T13:15:00Z', '2024-01-20T16:45:00Z'],
      
      // In Progress requests
      ['req-004', 'demo-user-4', 'Drone Frame', 'Lightweight drone frame for engineering project. Must be precise and lightweight.', 'PLA', 'Blue', 1, 'normal', 'Critical dimensions must be accurate to 0.1mm', 'drone_frame.stl', 5120000, 'stl', 'https://storage.example.com/files/drone_frame.stl', null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'in_progress', 35.00, null, 6.0, null, 'printer-003', '{"layer_height": 0.1, "infill": 15}', 'Currently printing - 60% complete', false, '2024-01-22T11:00:00Z', '2024-01-22T17:00:00Z', null],
      
      ['req-005', 'demo-user-5', 'Bracket Mount', 'Wall mount bracket for monitor. Needs to be strong and durable.', 'PETG', 'Grey', 1, 'normal', 'Wall mounting holes must be precise', 'bracket_mount.stl', 2560000, 'stl', 'https://storage.example.com/files/bracket_mount.stl', null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'in_progress', 22.50, null, 3.5, null, 'printer-002', '{"layer_height": 0.2, "infill": 40}', 'Printing in progress', true, '2024-01-23T08:30:00Z', '2024-01-23T12:00:00Z', null],
      
      // Pending requests
      ['req-006', 'demo-user-6', 'Prototype Housing', 'Prototype housing for electronics project. Multiple iterations expected.', 'PLA', 'Any', 3, 'low', 'This is a prototype, quality can be lower', 'housing_proto.stl', 4096000, 'stl', 'https://storage.example.com/files/housing_proto.stl', null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'pending', 15.00, null, 2.0, null, null, null, null, false, '2024-01-24T16:45:00Z', '2024-01-24T16:45:00Z', null],
      
      ['req-007', 'demo-user-7', 'Custom Gear', 'Custom gear for mechanical project. High precision required.', 'ABS', 'Black', 1, 'normal', 'Gear teeth must be perfectly aligned', 'custom_gear.stl', 1792000, 'stl', 'https://storage.example.com/files/custom_gear.stl', null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'pending', 28.00, null, 4.5, null, null, null, null, true, '2024-01-25T10:20:00Z', '2024-01-25T10:20:00Z', null],
      
      // Failed request
      ['req-008', 'demo-user-1', 'Complex Model', 'Very complex architectural model with fine details.', 'PLA', 'White', 1, 'normal', 'This might be too complex for our printers', 'complex_model.stl', 10240000, 'stl', 'https://storage.example.com/files/complex_model.stl', null, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', 'failed', 45.00, 0, 8.0, 0, null, null, 'Model too complex, failed after 2 hours. Recommend using resin printer.', false, '2024-01-26T09:00:00Z', '2024-01-26T17:00:00Z', null]
    ];

    for (const request of printRequests) {
      await snowflakeClient.execute(`
        INSERT INTO print_requests (
          request_id, user_id, project_name, description, material, color, quantity, 
          urgency, special_instructions, file_name, file_size, file_type, file_url, 
          model_url, fallback_image_url, status, estimated_cost, actual_cost, 
          estimated_time_hours, actual_time_hours, printer_id, print_settings, 
          admin_notes, is_public, created_at, updated_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, request);
    }
    console.log(`✅ Created ${printRequests.length} print requests`);

    // Insert more equipment
    console.log('\n🔧 Adding more equipment...');
    const equipment = [
      ['equip-002', 'Prusa i3 MK3S+', '3D Printer', 'i3 MK3S+', 'Prusa Research', 'available', 'Lab A', '{"build_volume": "250x210x200mm", "layer_height": "0.05-0.3mm", "materials": ["PLA", "PETG", "ABS"]}', '{"interval_days": 30, "last_check": "2024-01-01"}', '2024-01-01T00:00:00Z', '2024-02-01T00:00:00Z', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
      ['equip-003', 'Ultimaker S3', '3D Printer', 'S3', 'Ultimaker', 'available', 'Lab B', '{"build_volume": "230x190x200mm", "layer_height": "0.06-0.2mm", "materials": ["PLA", "PETG", "ABS", "TPU"]}', '{"interval_days": 30, "last_check": "2024-01-01"}', '2024-01-01T00:00:00Z', '2024-02-01T00:00:00Z', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
      ['equip-004', 'Formlabs Form 3', 'Resin Printer', 'Form 3', 'Formlabs', 'maintenance', 'Lab C', '{"build_volume": "145x145x185mm", "layer_height": "0.025-0.1mm", "materials": ["Resin"]}', '{"interval_days": 14, "last_check": "2024-01-15"}', '2024-01-15T00:00:00Z', '2024-01-29T00:00:00Z', '2024-01-01T00:00:00Z', '2024-01-15T00:00:00Z']
    ];

    for (const item of equipment) {
      await snowflakeClient.execute(`
        INSERT INTO equipment (
          equipment_id, name, type, model, manufacturer, status, location, 
          specifications, maintenance_schedule, last_maintenance, next_maintenance, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, item);
    }
    console.log(`✅ Added ${equipment.length} equipment items`);

    // Verify data
    console.log('\n🔍 Verifying data...');
    const userCount = await snowflakeClient.execute('SELECT COUNT(*) as count FROM users');
    const requestCount = await snowflakeClient.execute('SELECT COUNT(*) as count FROM print_requests');
    const equipmentCount = await snowflakeClient.execute('SELECT COUNT(*) as count FROM equipment');
    const materialCount = await snowflakeClient.execute('SELECT COUNT(*) as count FROM materials');
    
    console.log(`📊 Database populated with:`);
    console.log(`   - Users: ${userCount[0].COUNT}`);
    console.log(`   - Print Requests: ${requestCount[0].COUNT}`);
    console.log(`   - Equipment: ${equipmentCount[0].COUNT}`);
    console.log(`   - Materials: ${materialCount[0].COUNT}`);

    console.log('\n🎉 Database population completed successfully!');
    console.log('🚀 The application now has realistic demo data!');
    
    return true;

  } catch (error) {
    console.error('❌ Database population failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    await snowflakeClient.disconnect();
  }
}

if (require.main === module) {
  populateDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = populateDatabase;