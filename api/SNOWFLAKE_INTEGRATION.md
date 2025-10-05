# Snowflake Database Integration Plan

## 1. Database Schema Design (Snowflake)

### Table Definitions (DDL)

#### Primary Table: `print_requests`

```sql
-- Main table for storing print requests
CREATE TABLE IF NOT EXISTS print_requests (
  request_id        STRING PRIMARY KEY,        -- UUID or generated ID
  user_id           STRING NOT NULL,           -- Firebase UID or external user identifier
  submitted_at      TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  filament_type     STRING NOT NULL,           -- e.g., "PLA", "ABS", "TPU"
  print_color       STRING NOT NULL,           -- User's preferred color
  file_link         STRING NOT NULL,           -- URL to .stl/.obj file
  file_type         STRING NOT NULL,           -- "stl" or "obj" (validated)
  po_or_professor   STRING NULL,               -- Optional PO# or professor name
  details           STRING NULL,               -- Free text description
  status            STRING NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  result_data       VARIANT NULL,              -- JSON output from AI/print planning
  error_message     STRING NULL,               -- Error details if processing failed
  ai_confidence     NUMBER(3,2) NULL,          -- AI analysis confidence (0.00-1.00)
  estimated_cost    NUMBER(10,2) NULL,         -- Cost estimate in USD
  estimated_time    STRING NULL,               -- Estimated print time
  recommended_printer STRING NULL,             -- AI-recommended printer
  recommended_material STRING NULL,            -- AI-recommended material (may differ from user choice)
  created_by        STRING NOT NULL,           -- System identifier
  updated_by        STRING NOT NULL            -- System identifier
);

-- Add clustering for common query patterns
ALTER TABLE print_requests CLUSTER BY (user_id, submitted_at);

-- Add constraints
ALTER TABLE print_requests ADD CONSTRAINT chk_status 
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));

ALTER TABLE print_requests ADD CONSTRAINT chk_file_type 
  CHECK (file_type IN ('stl', 'obj', '3mf', 'ply'));

ALTER TABLE print_requests ADD CONSTRAINT chk_confidence 
  CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1));
```

#### Logging Table: `print_request_logs`

```sql
-- Audit trail for print requests
CREATE TABLE IF NOT EXISTS print_request_logs (
  log_id        STRING PRIMARY KEY DEFAULT UUID_STRING(),
  request_id    STRING NOT NULL REFERENCES print_requests(request_id),
  logged_at     TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  event_type    STRING NOT NULL,              -- created, ai_start, ai_complete, failed, etc.
  event_data    VARIANT NULL,                 -- Additional event-specific data
  note          STRING NULL,                  -- Human-readable note
  created_by    STRING NOT NULL               -- System identifier
);

-- Clustering for log queries
ALTER TABLE print_request_logs CLUSTER BY (request_id, logged_at);
```

#### Pricing Snapshots Table: `pricing_snapshots`

```sql
-- Store pricing calculations and estimates
CREATE TABLE IF NOT EXISTS pricing_snapshots (
  snapshot_id     STRING PRIMARY KEY DEFAULT UUID_STRING(),
  request_id      STRING NOT NULL REFERENCES print_requests(request_id),
  calculated_at   TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  price_amount    NUMBER(12,2) NOT NULL,
  price_currency  STRING NOT NULL DEFAULT 'USD',
  breakdown       VARIANT NULL,               -- JSON with detailed cost breakdown
  material_cost   NUMBER(10,2) NULL,
  labor_cost      NUMBER(10,2) NULL,
  overhead_cost   NUMBER(10,2) NULL,
  complexity_factor NUMBER(3,2) NULL,        -- Multiplier based on complexity
  size_factor     NUMBER(3,2) NULL,          -- Multiplier based on size
  created_by      STRING NOT NULL
);

-- Clustering for pricing queries
ALTER TABLE pricing_snapshots CLUSTER BY (request_id, calculated_at);
```

#### Schema Migrations Table

```sql
-- Track applied migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
  id         INTEGER AUTOINCREMENT PRIMARY KEY,
  name       STRING UNIQUE NOT NULL,
  applied_at TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checksum   STRING NULL,                    -- Optional: verify migration integrity
  created_by STRING NOT NULL
);
```

### Clustering and Partitioning Strategy

**Clustering Keys:**
- `print_requests`: `(user_id, submitted_at)` - Optimizes queries by user and time
- `print_request_logs`: `(request_id, logged_at)` - Optimizes log queries by request
- `pricing_snapshots`: `(request_id, calculated_at)` - Optimizes pricing history queries

**Rationale:**
- User-based clustering for user-specific queries
- Time-based clustering for recent requests and reporting
- Avoid over-clustering initially; monitor query patterns and adjust
- Use automatic clustering only when table grows large (>1M rows)

---

## 2. Migration Strategy & Versioning

### Directory Structure

```
database/
├── migrations/
│   ├── 001_create_print_requests.sql
│   ├── 002_create_logs.sql
│   ├── 003_create_pricing_snapshots.sql
│   ├── 004_create_schema_migrations.sql
│   └── 005_add_constraints.sql
├── seeds/
│   ├── seed_test_requests.sql
│   └── seed_test_pricing.sql
├── schema/
│   └── current_schema.sql
├── scripts/
│   ├── run-migrations.js
│   ├── rollback-migration.js
│   └── check-migrations.js
└── README.md
```

### Sample Migration Files

#### `001_create_print_requests.sql`

```sql
-- Migration: 001_create_print_requests
-- Description: Create the main print_requests table
-- Created: 2025-10-04

-- Create print_requests table
CREATE TABLE IF NOT EXISTS print_requests (
  request_id        STRING PRIMARY KEY,
  user_id           STRING NOT NULL,
  submitted_at      TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  filament_type     STRING NOT NULL,
  print_color       STRING NOT NULL,
  file_link         STRING NOT NULL,
  file_type         STRING NOT NULL,
  po_or_professor   STRING NULL,
  details           STRING NULL,
  status            STRING NOT NULL DEFAULT 'pending',
  result_data       VARIANT NULL,
  error_message     STRING NULL,
  ai_confidence     NUMBER(3,2) NULL,
  estimated_cost    NUMBER(10,2) NULL,
  estimated_time    STRING NULL,
  recommended_printer STRING NULL,
  recommended_material STRING NULL,
  created_by        STRING NOT NULL,
  updated_by        STRING NOT NULL
);

-- Add clustering
ALTER TABLE print_requests CLUSTER BY (user_id, submitted_at);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_print_requests_status 
ON print_requests (status, submitted_at);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS idx_print_requests_user 
ON print_requests (user_id, submitted_at DESC);
```

#### `002_create_logs.sql`

```sql
-- Migration: 002_create_logs
-- Description: Create logging and audit tables
-- Created: 2025-10-04

-- Create print_request_logs table
CREATE TABLE IF NOT EXISTS print_request_logs (
  log_id        STRING PRIMARY KEY DEFAULT UUID_STRING(),
  request_id    STRING NOT NULL,
  logged_at     TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  event_type    STRING NOT NULL,
  event_data    VARIANT NULL,
  note          STRING NULL,
  created_by    STRING NOT NULL
);

-- Add foreign key constraint
ALTER TABLE print_request_logs 
ADD CONSTRAINT fk_logs_request_id 
FOREIGN KEY (request_id) REFERENCES print_requests(request_id);

-- Add clustering
ALTER TABLE print_request_logs CLUSTER BY (request_id, logged_at);

-- Create index for event type queries
CREATE INDEX IF NOT EXISTS idx_logs_event_type 
ON print_request_logs (event_type, logged_at);
```

### Migration Runner Script

#### `scripts/run-migrations.js`

```javascript
const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');

class MigrationRunner {
  constructor() {
    this.connection = snowflake.createConnection({
      account: process.env.SF_ACCOUNT,
      username: process.env.SF_USER,
      password: process.env.SF_PASSWORD,
      warehouse: process.env.SF_WAREHOUSE,
      database: process.env.SF_DATABASE,
      schema: process.env.SF_SCHEMA,
      role: process.env.SF_ROLE
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err, conn) => {
        if (err) reject(err);
        else {
          this.connection = conn;
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
          if (err) reject(err);
          else resolve(rows.map(row => row.NAME));
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
    
    console.log(`Running migration: ${migrationName}`);
    
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: sql,
        complete: (err, stmt) => {
          if (err) {
            console.error(`Migration ${migrationName} failed:`, err);
            reject(err);
          } else {
            console.log(`Migration ${migrationName} completed successfully`);
            resolve();
          }
        }
      });
    });
  }

  async runMigrations() {
    try {
      await this.connect();
      
      // Get list of migration files
      const migrationsDir = path.join(__dirname, '..', 'migrations');
      const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();

      // Run pending migrations
      for (const file of files) {
        const migrationName = path.basename(file, '.sql');
        
        if (!appliedMigrations.includes(migrationName)) {
          const filePath = path.join(migrationsDir, file);
          await this.runMigration(filePath);
          await this.recordMigration(migrationName);
        } else {
          console.log(`Migration ${migrationName} already applied, skipping`);
        }
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      this.connection.destroy();
    }
  }
}

// Run migrations if called directly
if (require.main === module) {
  const runner = new MigrationRunner();
  runner.runMigrations()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = MigrationRunner;
```

---

## 3. Infrastructure & Snowflake Best Practices

### Warehouse Configuration

```sql
-- Development warehouse
CREATE WAREHOUSE IF NOT EXISTS makerspace_dev
  WAREHOUSE_SIZE = 'X-SMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE
  COMMENT = 'Development warehouse for makerspace API';

-- Production warehouse
CREATE WAREHOUSE IF NOT EXISTS makerspace_prod
  WAREHOUSE_SIZE = 'SMALL'
  AUTO_SUSPEND = 300
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE
  COMMENT = 'Production warehouse for makerspace API';
```

### Environment Separation

```sql
-- Development database
CREATE DATABASE IF NOT EXISTS makerspace_dev;
USE DATABASE makerspace_dev;
CREATE SCHEMA IF NOT EXISTS api;

-- Staging database
CREATE DATABASE IF NOT EXISTS makerspace_staging;
USE DATABASE makerspace_staging;
CREATE SCHEMA IF NOT EXISTS api;

-- Production database
CREATE DATABASE IF NOT EXISTS makerspace_prod;
USE DATABASE makerspace_prod;
CREATE SCHEMA IF NOT EXISTS api;
```

### Role-Based Access Control (RBAC)

```sql
-- Create roles
CREATE ROLE IF NOT EXISTS makerspace_api_role;
CREATE ROLE IF NOT EXISTS makerspace_admin_role;
CREATE ROLE IF NOT EXISTS makerspace_readonly_role;

-- API role permissions (least privilege)
GRANT USAGE ON WAREHOUSE makerspace_dev TO ROLE makerspace_api_role;
GRANT USAGE ON DATABASE makerspace_dev TO ROLE makerspace_api_role;
GRANT USAGE ON SCHEMA makerspace_dev.api TO ROLE makerspace_api_role;

-- Table permissions for API role
GRANT SELECT, INSERT, UPDATE ON TABLE makerspace_dev.api.print_requests TO ROLE makerspace_api_role;
GRANT SELECT, INSERT ON TABLE makerspace_dev.api.print_request_logs TO ROLE makerspace_api_role;
GRANT SELECT, INSERT ON TABLE makerspace_dev.api.pricing_snapshots TO ROLE makerspace_api_role;

-- Admin role permissions
GRANT ALL PRIVILEGES ON DATABASE makerspace_dev TO ROLE makerspace_admin_role;
GRANT ALL PRIVILEGES ON SCHEMA makerspace_dev.api TO ROLE makerspace_admin_role;

-- Read-only role permissions
GRANT USAGE ON WAREHOUSE makerspace_dev TO ROLE makerspace_readonly_role;
GRANT SELECT ON ALL TABLES IN SCHEMA makerspace_dev.api TO ROLE makerspace_readonly_role;

-- Create users and assign roles
CREATE USER IF NOT EXISTS makerspace_api_user
  PASSWORD = 'your-secure-password'
  DEFAULT_ROLE = makerspace_api_role
  DEFAULT_WAREHOUSE = makerspace_dev;

GRANT ROLE makerspace_api_role TO USER makerspace_api_user;
```

### Cost Optimization Settings

```sql
-- Optimize for cost
ALTER WAREHOUSE makerspace_dev SET
  AUTO_SUSPEND = 60,           -- Suspend after 1 minute of inactivity
  AUTO_RESUME = TRUE,          -- Resume automatically
  STATEMENT_TIMEOUT_IN_SECONDS = 300,  -- 5 minute timeout
  STATEMENT_QUEUED_TIMEOUT_IN_SECONDS = 600;  -- 10 minute queue timeout

-- Set data retention (reduce storage costs)
ALTER TABLE print_requests SET DATA_RETENTION_TIME_IN_DAYS = 7;  -- 7 days time travel
ALTER TABLE print_request_logs SET DATA_RETENTION_TIME_IN_DAYS = 30;  -- 30 days for logs
```

---

## 4. Backend/API Integration (Node.js)

### Database Connection Module

#### `api/src/database/snowflakeClient.js`

```javascript
const snowflake = require('snowflake-sdk');

class SnowflakeClient {
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
        role: process.env.SF_ROLE,
        // Connection pooling
        poolOptions: {
          max: 10,
          min: 1,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 60000
        }
      });

      this.connection.connect((err, conn) => {
        if (err) {
          console.error('Snowflake connection failed:', err);
          reject(err);
        } else {
          this.connection = conn;
          this.isConnected = true;
          console.log('Snowflake connected successfully');
          resolve();
        }
      });
    });
  }

  async execute(sql, binds = []) {
    if (!this.isConnected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: sql,
        binds,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Query execution failed:', err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      });
    });
  }

  async executeStreaming(sql, binds = []) {
    if (!this.isConnected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const stream = this.connection.executeStreaming({
        sqlText: sql,
        binds,
        complete: (err, stmt) => {
          if (err) {
            console.error('Streaming query failed:', err);
            reject(err);
          } else {
            resolve(stream);
          }
        }
      });
    });
  }

  async disconnect() {
    if (this.connection && this.isConnected) {
      this.connection.destroy();
      this.isConnected = false;
      console.log('Snowflake disconnected');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.execute('SELECT CURRENT_TIMESTAMP() as timestamp');
      return {
        status: 'healthy',
        timestamp: result[0].TIMESTAMP,
        database: process.env.SF_DATABASE,
        schema: process.env.SF_SCHEMA
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Singleton instance
const snowflakeClient = new SnowflakeClient();

module.exports = snowflakeClient;
```

### Repository Layer

#### `api/src/repositories/PrintRequestRepository.js`

```javascript
const snowflakeClient = require('../database/snowflakeClient');
const { v4: uuidv4 } = require('uuid');

class PrintRequestRepository {
  constructor() {
    this.client = snowflakeClient;
  }

  async createRequest(requestData) {
    const requestId = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO print_requests (
        request_id, user_id, submitted_at, updated_at,
        filament_type, print_color, file_link, file_type,
        po_or_professor, details, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const binds = [
      requestId,
      requestData.user_id,
      now,
      now,
      requestData.filament_type,
      requestData.print_color,
      requestData.file_link,
      requestData.file_type,
      requestData.po_or_professor || null,
      requestData.details || null,
      'pending',
      'api-service',
      'api-service'
    ];

    await this.client.execute(sql, binds);

    // Log the creation
    await this.logEvent(requestId, 'created', {
      user_id: requestData.user_id,
      filament_type: requestData.filament_type,
      file_type: requestData.file_type
    });

    return requestId;
  }

  async getRequestById(requestId) {
    const sql = `
      SELECT * FROM print_requests 
      WHERE request_id = ?
    `;
    
    const rows = await this.client.execute(sql, [requestId]);
    return rows.length > 0 ? this.mapRowToRequest(rows[0]) : null;
  }

  async getRequestsByUser(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM print_requests 
      WHERE user_id = ? 
      ORDER BY submitted_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const rows = await this.client.execute(sql, [userId, limit, offset]);
    return rows.map(row => this.mapRowToRequest(row));
  }

  async updateRequestStatus(requestId, status, resultData = null, errorMessage = null) {
    const sql = `
      UPDATE print_requests 
      SET status = ?, 
          result_data = ?, 
          error_message = ?, 
          updated_at = CURRENT_TIMESTAMP(),
          updated_by = ?
      WHERE request_id = ?
    `;

    const binds = [
      status,
      resultData ? JSON.stringify(resultData) : null,
      errorMessage,
      'api-service',
      requestId
    ];

    await this.client.execute(sql, binds);

    // Log the status change
    await this.logEvent(requestId, 'status_changed', {
      new_status: status,
      has_result_data: !!resultData,
      has_error: !!errorMessage
    });
  }

  async updateRequestWithAIResult(requestId, aiResult) {
    const sql = `
      UPDATE print_requests 
      SET status = ?,
          result_data = ?,
          ai_confidence = ?,
          estimated_cost = ?,
          estimated_time = ?,
          recommended_printer = ?,
          recommended_material = ?,
          updated_at = CURRENT_TIMESTAMP(),
          updated_by = ?
      WHERE request_id = ?
    `;

    const binds = [
      'completed',
      JSON.stringify(aiResult),
      aiResult.confidence || null,
      aiResult.estimatedCost || null,
      aiResult.estimatedPrintTime || null,
      aiResult.recommendedPrinter || null,
      aiResult.recommendedMaterial || null,
      'ai-service',
      requestId
    ];

    await this.client.execute(sql, binds);

    // Log the AI completion
    await this.logEvent(requestId, 'ai_completed', {
      confidence: aiResult.confidence,
      recommended_material: aiResult.recommendedMaterial,
      estimated_cost: aiResult.estimatedCost
    });
  }

  async createPricingSnapshot(requestId, pricingData) {
    const sql = `
      INSERT INTO pricing_snapshots (
        request_id, price_amount, price_currency, breakdown,
        material_cost, labor_cost, overhead_cost,
        complexity_factor, size_factor, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const binds = [
      requestId,
      pricingData.priceAmount,
      pricingData.currency || 'USD',
      JSON.stringify(pricingData.breakdown),
      pricingData.breakdown?.materialCost || null,
      pricingData.breakdown?.laborCost || null,
      pricingData.breakdown?.overheadCost || null,
      pricingData.complexityFactor || null,
      pricingData.sizeFactor || null,
      'pricing-service'
    ];

    await this.client.execute(sql, binds);
  }

  async logEvent(requestId, eventType, eventData = null, note = null) {
    const sql = `
      INSERT INTO print_request_logs (
        request_id, event_type, event_data, note, created_by
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const binds = [
      requestId,
      eventType,
      eventData ? JSON.stringify(eventData) : null,
      note,
      'api-service'
    ];

    await this.client.execute(sql, binds);
  }

  async getRequestLogs(requestId) {
    const sql = `
      SELECT * FROM print_request_logs 
      WHERE request_id = ? 
      ORDER BY logged_at ASC
    `;
    
    const rows = await this.client.execute(sql, [requestId]);
    return rows.map(row => ({
      logId: row.LOG_ID,
      requestId: row.REQUEST_ID,
      loggedAt: row.LOGGED_AT,
      eventType: row.EVENT_TYPE,
      eventData: row.EVENT_DATA ? JSON.parse(row.EVENT_DATA) : null,
      note: row.NOTE
    }));
  }

  mapRowToRequest(row) {
    return {
      requestId: row.REQUEST_ID,
      userId: row.USER_ID,
      submittedAt: row.SUBMITTED_AT,
      updatedAt: row.UPDATED_AT,
      filamentType: row.FILAMENT_TYPE,
      printColor: row.PRINT_COLOR,
      fileLink: row.FILE_LINK,
      fileType: row.FILE_TYPE,
      poOrProfessor: row.PO_OR_PROFESSOR,
      details: row.DETAILS,
      status: row.STATUS,
      resultData: row.RESULT_DATA ? JSON.parse(row.RESULT_DATA) : null,
      errorMessage: row.ERROR_MESSAGE,
      aiConfidence: row.AI_CONFIDENCE,
      estimatedCost: row.ESTIMATED_COST,
      estimatedTime: row.ESTIMATED_TIME,
      recommendedPrinter: row.RECOMMENDED_PRINTER,
      recommendedMaterial: row.RECOMMENDED_MATERIAL
    };
  }
}

module.exports = PrintRequestRepository;
```

### Updated Controller Integration

#### `api/src/controllers/PrintRequestController.js` (Updated)

```javascript
const PrintRequestRepository = require('../repositories/PrintRequestRepository');
const GeminiAdapter = require('../services/GeminiAdapter');

class PrintRequestController {
  constructor() {
    this.printRequestRepo = new PrintRequestRepository();
    this.geminiAdapter = new GeminiAdapter(
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_URL,
      process.env.DEBUG === 'true'
    );
  }

  async submitPrintRequest(req, res, next) {
    try {
      const {
        filament_type,
        print_color,
        file_link,
        file_type,
        po_or_professor,
        details
      } = req.body;

      // Validate required fields
      if (!filament_type || !print_color || !file_link || !file_type) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields',
          code: 400,
          timestamp: new Date().toISOString()
        });
      }

      // Validate file type
      const validFileTypes = ['stl', 'obj', '3mf', 'ply'];
      if (!validFileTypes.includes(file_type.toLowerCase())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid file type. Supported types: ' + validFileTypes.join(', '),
          code: 400,
          timestamp: new Date().toISOString()
        });
      }

      // Get user ID from authentication middleware
      const userId = req.user?.uid || req.user?.id || 'anonymous';

      // Create print request
      const requestData = {
        user_id: userId,
        filament_type,
        print_color,
        file_link,
        file_type: file_type.toLowerCase(),
        po_or_professor,
        details
      };

      const requestId = await this.printRequestRepo.createRequest(requestData);

      // Respond immediately with request ID
      res.status(201).json({
        status: 'success',
        data: {
          requestId,
          message: 'Print request submitted successfully',
          status: 'pending'
        },
        timestamp: new Date().toISOString()
      });

      // Process request asynchronously
      this.processRequestAsync(requestId, requestData);

    } catch (error) {
      console.error('Error submitting print request:', error);
      next(error);
    }
  }

  async processRequestAsync(requestId, requestData) {
    try {
      // Update status to processing
      await this.printRequestRepo.updateRequestStatus(requestId, 'processing');

      // Get AI analysis
      const aiResult = await this.geminiAdapter.analyzeProject(
        requestData.details || '3D printing project',
        [], // No images for now
        requestData.filament_type,
        requestData.print_color
      );

      // Update with AI results
      await this.printRequestRepo.updateRequestWithAIResult(requestId, aiResult);

      // Create pricing snapshot
      const pricingData = {
        priceAmount: aiResult.estimatedCost || 0,
        currency: 'USD',
        breakdown: {
          materialCost: (aiResult.estimatedCost || 0) * 0.4,
          laborCost: (aiResult.estimatedCost || 0) * 0.4,
          overheadCost: (aiResult.estimatedCost || 0) * 0.2
        },
        complexityFactor: this.getComplexityFactor(aiResult.complexity),
        sizeFactor: this.getSizeFactor(aiResult.volumeCategory)
      };

      await this.printRequestRepo.createPricingSnapshot(requestId, pricingData);

    } catch (error) {
      console.error('Error processing request:', error);
      await this.printRequestRepo.updateRequestStatus(
        requestId, 
        'failed', 
        null, 
        error.message
      );
    }
  }

  async getPrintRequest(req, res, next) {
    try {
      const { requestId } = req.params;
      const request = await this.printRequestRepo.getRequestById(requestId);

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Print request not found',
          code: 404,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        status: 'success',
        data: request,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching print request:', error);
      next(error);
    }
  }

  async getUserPrintRequests(req, res, next) {
    try {
      const userId = req.user?.uid || req.user?.id;
      const { limit = 50, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User authentication required',
          code: 401,
          timestamp: new Date().toISOString()
        });
      }

      const requests = await this.printRequestRepo.getRequestsByUser(
        userId, 
        parseInt(limit), 
        parseInt(offset)
      );

      res.json({
        status: 'success',
        data: {
          requests,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            count: requests.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching user requests:', error);
      next(error);
    }
  }

  getComplexityFactor(complexity) {
    const factors = {
      'simple': 1.0,
      'medium': 1.2,
      'complex': 1.5,
      'very_complex': 2.0
    };
    return factors[complexity] || 1.0;
  }

  getSizeFactor(sizeCategory) {
    const factors = {
      'small': 0.8,
      'medium': 1.0,
      'large': 1.3
    };
    return factors[sizeCategory] || 1.0;
  }
}

module.exports = PrintRequestController;
```

---

## 5. Testing & Development Setup

### Environment Configuration

#### `.env.example` (Add Snowflake variables)

```bash
# Existing variables...
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

# Snowflake Configuration
SF_ACCOUNT=your_account.region
SF_USER=your_username
SF_PASSWORD=your_password
SF_WAREHOUSE=makerspace_dev
SF_DATABASE=makerspace_dev
SF_SCHEMA=api
SF_ROLE=makerspace_api_role

# Environment
NODE_ENV=development
```

### Test Data Seeding

#### `database/seeds/seed_test_requests.sql`

```sql
-- Seed test data for development
INSERT INTO print_requests (
  request_id, user_id, filament_type, print_color, file_link, file_type,
  po_or_professor, details, status, created_by, updated_by
) VALUES 
('test-req-001', 'test-user-1', 'PLA', 'Red', 'https://example.com/test1.stl', 'stl', 
 'Dr. Smith', 'Test phone stand', 'completed', 'test-seeder', 'test-seeder'),
('test-req-002', 'test-user-1', 'ABS', 'Black', 'https://example.com/test2.stl', 'stl',
 NULL, 'Engineering prototype bracket', 'pending', 'test-seeder', 'test-seeder'),
('test-req-003', 'test-user-2', 'TPU', 'Blue', 'https://example.com/test3.stl', 'stl',
 'PO-12345', 'Flexible phone case', 'processing', 'test-seeder', 'test-seeder');
```

### Integration Tests

#### `api/tests/integration/printRequest.test.js`

```javascript
const request = require('supertest');
const app = require('../../src/app');
const PrintRequestRepository = require('../../src/repositories/PrintRequestRepository');

describe('Print Request Integration Tests', () => {
  let printRequestRepo;

  beforeAll(async () => {
    printRequestRepo = new PrintRequestRepository();
    // Ensure test database is set up
  });

  afterAll(async () => {
    // Clean up test data
  });

  beforeEach(async () => {
    // Clean up before each test
  });

  describe('POST /api/print-request', () => {
    it('should create a new print request', async () => {
      const requestData = {
        filament_type: 'PLA',
        print_color: 'Red',
        file_link: 'https://example.com/test.stl',
        file_type: 'stl',
        details: 'Test request'
      };

      const response = await request(app)
        .post('/api/print-request')
        .send(requestData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.requestId).toBeDefined();
      expect(response.body.data.status).toBe('pending');

      // Verify in database
      const savedRequest = await printRequestRepo.getRequestById(
        response.body.data.requestId
      );
      expect(savedRequest).toBeTruthy();
      expect(savedRequest.filamentType).toBe('PLA');
    });

    it('should reject invalid file types', async () => {
      const requestData = {
        filament_type: 'PLA',
        print_color: 'Red',
        file_link: 'https://example.com/test.txt',
        file_type: 'txt',
        details: 'Test request'
      };

      const response = await request(app)
        .post('/api/print-request')
        .send(requestData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('GET /api/print-request/:requestId', () => {
    it('should return a print request by ID', async () => {
      // Create a test request
      const requestId = await printRequestRepo.createRequest({
        user_id: 'test-user',
        filament_type: 'PLA',
        print_color: 'Blue',
        file_link: 'https://example.com/test.stl',
        file_type: 'stl',
        details: 'Test request for retrieval'
      });

      const response = await request(app)
        .get(`/api/print-request/${requestId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.requestId).toBe(requestId);
      expect(response.body.data.filamentType).toBe('PLA');
    });

    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .get('/api/print-request/non-existent-id')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Print request not found');
    });
  });
});
```

### Database Health Check

#### `api/src/routes/health.js` (Updated)

```javascript
const express = require('express');
const snowflakeClient = require('../database/snowflakeClient');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check Snowflake connection
    const dbHealth = await snowflakeClient.healthCheck();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        geminiConnection: true, // From existing health check
        materialAdvisor: true,
        printerSelector: true,
        pricingEngine: true,
        database: dbHealth.status === 'healthy'
      },
      database: dbHealth
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: false
      },
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 6. Directory Scaffolding

### Final Project Structure

```
.
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── PrintRequestController.js
│   │   ├── database/
│   │   │   └── snowflakeClient.js
│   │   ├── repositories/
│   │   │   └── PrintRequestRepository.js
│   │   ├── services/
│   │   │   └── GeminiAdapter.js
│   │   └── ...
│   ├── tests/
│   │   └── integration/
│   │       └── printRequest.test.js
│   └── package.json
├── database/
│   ├── migrations/
│   │   ├── 001_create_print_requests.sql
│   │   ├── 002_create_logs.sql
│   │   ├── 003_create_pricing_snapshots.sql
│   │   └── 004_create_schema_migrations.sql
│   ├── seeds/
│   │   ├── seed_test_requests.sql
│   │   └── seed_test_pricing.sql
│   ├── scripts/
│   │   ├── run-migrations.js
│   │   ├── rollback-migration.js
│   │   └── check-migrations.js
│   └── README.md
├── frontend/
│   └── ... (unchanged)
└── README.md
```

### Package.json Updates

Add to `api/package.json`:

```json
{
  "scripts": {
    "migrate": "node database/scripts/run-migrations.js",
    "migrate:check": "node database/scripts/check-migrations.js",
    "seed": "node database/scripts/seed-data.js",
    "test:db": "jest tests/integration/",
    "test:all": "npm run test && npm run test:db"
  },
  "dependencies": {
    "snowflake-sdk": "^1.9.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.0.0"
  }
}
```

---

## 7. Constraints, Caveats & TODO Placeholders

### ⚠️ **Critical Constraints**
- **DO NOT MODIFY** the `frontend/` directory - it's fixed and cannot be changed
- All database integration must be backend-only
- User authentication remains in Firebase - only store `user_id` references

### 🔄 **Migration Strategy**
- Use sequential migration files (001_, 002_, etc.)
- Always test migrations in development first
- Maintain rollback capability for production issues
- Keep migration history in `schema_migrations` table

### 💰 **Cost Optimization**
- Start with X-SMALL warehouse, scale up only when needed
- Use auto-suspend to minimize idle costs
- Monitor credit usage with Snowflake's built-in tools
- Consider data retention policies to reduce storage costs

### 🔒 **Security Considerations**
- Store Snowflake credentials in environment variables or secret manager
- Use least-privilege RBAC roles
- Separate environments (dev/staging/prod) with different access levels
- Encrypt sensitive data in transit and at rest

### 📊 **Performance Monitoring**
- Monitor query performance and clustering effectiveness
- Use Snowflake's query profiling tools
- Set up alerts for long-running queries
- Regular review of warehouse sizing

### 🧪 **Testing Strategy**
- Use separate test database/schema for integration tests
- Mock Snowflake calls for unit tests
- Clean up test data after each test run
- Test migration rollbacks

### 📈 **Scaling Considerations**
- **TODO**: Monitor table growth and consider partitioning when >1M rows
- **TODO**: Evaluate automatic clustering costs before enabling
- **TODO**: Consider data archival strategy for old requests
- **TODO**: Implement connection pooling optimization based on load

### 🔧 **Development Workflow**
- Run migrations before starting API server
- Use seed data for local development
- Test all database operations in development environment
- Document any schema changes in migration files

### 🚨 **Error Handling**
- Implement retry logic for transient Snowflake errors
- Log all database operations for debugging
- Handle connection timeouts gracefully
- Provide meaningful error messages to API consumers

This comprehensive plan provides everything needed to integrate Snowflake as the database layer for your 3D printing API while maintaining the existing frontend and Firebase authentication system.