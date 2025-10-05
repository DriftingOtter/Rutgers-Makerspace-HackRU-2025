#!/usr/bin/env node

const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MigrationRunner {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    return new Promise((resolve, reject) => {
      this.connection = snowflake.createConnection({
        account: process.env.SF_ACCOUNT,
        username: process.env.SF_USER,
        password: process.env.SF_PASSWORD,
        warehouse: process.env.SF_WAREHOUSE,
        database: process.env.SF_DATABASE,
        schema: process.env.SF_SCHEMA,
        role: process.env.SF_ROLE
      });

      this.connection.connect((err, conn) => {
        if (err) {
          console.error('❌ Snowflake connection failed:', err.message);
          reject(err);
        } else {
          this.connection = conn;
          this.isConnected = true;
          console.log('✅ Snowflake connected successfully');
          resolve();
        }
      });
    });
  }

  async getAppliedMigrations() {
    const sql = 'SELECT name FROM schema_migrations ORDER BY applied_at';
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: sql,
        complete: (err, stmt, rows) => {
          if (err) {
            // If table doesn't exist yet, return empty array
            if (err.code === '002043') {
              resolve([]);
            } else {
              reject(err);
            }
          } else {
            resolve(rows.map(row => row.NAME));
          }
        }
      });
    });
  }

  async recordMigration(name, checksum = null) {
    const sql = `
      INSERT INTO schema_migrations (name, checksum, created_by)
      VALUES (?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: sql,
        binds: [name, checksum, 'migration-runner'],
        complete: (err, stmt) => {
          if (err) reject(err);
          else resolve();
        }
      });
    });
  }

  async runMigration(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    const migrationName = path.basename(filePath, '.sql');
    
    console.log(`🔄 Running migration: ${migrationName}`);
    
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: sql,
        complete: (err, stmt) => {
          if (err) {
            console.error(`❌ Migration ${migrationName} failed:`, err.message);
            reject(err);
          } else {
            console.log(`✅ Migration ${migrationName} completed successfully`);
            resolve();
          }
        }
      });
    });
  }

  async runMigrations() {
    try {
      console.log('🚀 Starting Snowflake migrations...');
      console.log(`📊 Account: ${process.env.SF_ACCOUNT}`);
      console.log(`🏢 Database: ${process.env.SF_DATABASE}`);
      console.log(`📋 Schema: ${process.env.SF_SCHEMA}`);
      console.log('');

      await this.connect();
      
      // Get list of migration files
      const migrationsDir = path.join(__dirname, '..', 'migrations');
      const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      console.log(`📁 Found ${files.length} migration files`);

      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      console.log(`✅ Found ${appliedMigrations.length} applied migrations`);

      // Run pending migrations
      let appliedCount = 0;
      for (const file of files) {
        const migrationName = path.basename(file, '.sql');
        
        if (!appliedMigrations.includes(migrationName)) {
          const filePath = path.join(migrationsDir, file);
          await this.runMigration(filePath);
          await this.recordMigration(migrationName);
          appliedCount++;
        } else {
          console.log(`⏭️  Migration ${migrationName} already applied, skipping`);
        }
      }

      console.log('');
      console.log(`🎉 Migration process completed! Applied ${appliedCount} new migrations.`);
    } catch (error) {
      console.error('💥 Migration failed:', error.message);
      throw error;
    } finally {
      if (this.connection) {
        this.connection.destroy();
      }
    }
  }
}

// Run migrations if called directly
if (require.main === module) {
  const runner = new MigrationRunner();
  runner.runMigrations()
    .then(() => {
      console.log('✅ All migrations completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Migration process failed:', err.message);
      process.exit(1);
    });
}

module.exports = MigrationRunner;