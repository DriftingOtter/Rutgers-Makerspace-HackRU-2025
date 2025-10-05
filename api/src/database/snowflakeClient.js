const snowflake = require('snowflake-sdk');

class SnowflakeClient {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.isFreeTrial = process.env.SF_ACCOUNT && !process.env.SF_ACCOUNT.includes('.');
    this.queryCount = 0;
    this.maxQueriesPerSession = 100; // Free trial limit
  }

  async connect() {
    if (this.isConnected) return;

    // Free trial safeguards
    if (this.isFreeTrial) {
      console.log('⚠️  Using Snowflake Free Trial - Limited functionality enabled');
      console.log('💡 Consider upgrading for production use');
    }

    return new Promise((resolve, reject) => {
      this.connection = snowflake.createConnection({
        account: process.env.SF_ACCOUNT,
        username: process.env.SF_USER,
        password: process.env.SF_PASSWORD,
        warehouse: process.env.SF_WAREHOUSE,
        database: process.env.SF_DATABASE,
        schema: process.env.SF_SCHEMA,
        role: process.env.SF_ROLE,
        // Free trial optimized settings
        poolOptions: this.isFreeTrial ? {
          max: 2,  // Reduced for free trial
          min: 1,
          idleTimeoutMillis: 10000,  // Shorter timeout
          acquireTimeoutMillis: 30000
        } : {
          max: 10,
          min: 1,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 60000
        }
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

  async execute(sql, binds = []) {
    if (!this.isConnected) {
      await this.connect();
    }

    // Free trial safeguards
    if (this.isFreeTrial) {
      this.queryCount++;
      if (this.queryCount > this.maxQueriesPerSession) {
        throw new Error('Free trial query limit exceeded. Please upgrade for more queries.');
      }
      
      // Log query count
      if (this.queryCount % 10 === 0) {
        console.log(`⚠️  Free trial: ${this.queryCount}/${this.maxQueriesPerSession} queries used`);
      }
    }

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: sql,
        binds,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('❌ Query execution failed:', err.message);
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
            console.error('❌ Streaming query failed:', err.message);
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
      console.log('🔌 Snowflake disconnected');
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