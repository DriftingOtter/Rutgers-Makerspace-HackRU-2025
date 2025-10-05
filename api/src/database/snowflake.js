/**
 * Rutgers Makerspace Snowflake Database Integration
 * This module handles all database operations for the Rutgers Makerspace application
 */

const snowflake = require('snowflake-sdk');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const dbConfig = {
    account: process.env.SF_ACCOUNT,
    username: process.env.SF_USER,
    password: process.env.SF_PASSWORD,
    warehouse: process.env.SF_WAREHOUSE,
    database: process.env.SF_DATABASE,
    schema: process.env.SF_SCHEMA,
    role: process.env.SF_ROLE,
    // Connection pool settings
    pool: {
        min: parseInt(process.env.DB_POOL_MIN) || 1,
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
        acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT) || 60000
    }
};

// Create connection pool
const connectionPool = snowflake.createPool(dbConfig);

/**
 * Execute a query with connection pooling
 * @param {string} sql - SQL query to execute
 * @param {Array} binds - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function executeQuery(sql, binds = []) {
    return new Promise((resolve, reject) => {
        connectionPool.use(async (connection) => {
            try {
                const result = await new Promise((resolveQuery, rejectQuery) => {
                    connection.execute({
                        sqlText: sql,
                        binds: binds,
                        complete: (err, stmt, rows) => {
                            if (err) {
                                rejectQuery(err);
                                return;
                            }
                            resolveQuery(rows);
                        }
                    });
                });
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    });
}

/**
 * User Management Functions
 */
const UserRepository = {
    // Create a new user
    async createUser(userData) {
        const userId = uuidv4();
        const sql = `
            INSERT INTO users (user_id, email, display_name, rutgers_netid, phone_number, is_admin, is_staff, profile_image_url, preferences)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const binds = [
            userId,
            userData.email,
            userData.displayName || userData.display_name,
            userData.rutgersNetid || userData.rutgers_netid,
            userData.phoneNumber || userData.phone_number,
            userData.isAdmin || userData.is_admin || false,
            userData.isStaff || userData.is_staff || false,
            userData.profileImageUrl || userData.profile_image_url,
            userData.preferences ? JSON.stringify(userData.preferences) : null
        ];
        
        await executeQuery(sql, binds);
        return userId;
    },

    // Get user by ID
    async getUserById(userId) {
        const sql = 'SELECT * FROM users WHERE user_id = ?';
        const result = await executeQuery(sql, [userId]);
        return result[0] || null;
    },

    // Get user by email
    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const result = await executeQuery(sql, [email]);
        return result[0] || null;
    },

    // Update user
    async updateUser(userId, userData) {
        const sql = `
            UPDATE users 
            SET display_name = ?, rutgers_netid = ?, phone_number = ?, profile_image_url = ?, preferences = ?, updated_at = CURRENT_TIMESTAMP()
            WHERE user_id = ?
        `;
        const binds = [
            userData.displayName || userData.display_name,
            userData.rutgersNetid || userData.rutgers_netid,
            userData.phoneNumber || userData.phone_number,
            userData.profileImageUrl || userData.profile_image_url,
            userData.preferences ? JSON.stringify(userData.preferences) : null,
            userId
        ];
        
        await executeQuery(sql, binds);
    },

    // Get all users (admin only)
    async getAllUsers() {
        const sql = 'SELECT * FROM users ORDER BY created_at DESC';
        return await executeQuery(sql);
    }
};

/**
 * Print Request Management Functions
 */
const PrintRequestRepository = {
    // Create a new print request
    async createPrintRequest(requestData) {
        const requestId = uuidv4();
        const sql = `
            INSERT INTO print_requests (
                request_id, user_id, project_name, description, material, color, quantity, urgency,
                special_instructions, file_name, file_size, file_type, file_url, model_url, fallback_image_url,
                status, is_public, estimated_cost, estimated_print_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const binds = [
            requestId,
            requestData.userId || requestData.user_id,
            requestData.projectName || requestData.project_name,
            requestData.description,
            requestData.material,
            requestData.color,
            requestData.quantity || 1,
            requestData.urgency || 'normal',
            requestData.specialInstructions || requestData.special_instructions,
            requestData.fileName || requestData.file_name,
            requestData.fileSize || requestData.file_size,
            requestData.fileType || requestData.file_type,
            requestData.fileUrl || requestData.file_url,
            requestData.modelUrl || requestData.model_url,
            requestData.fallbackImageUrl || requestData.fallback_image_url,
            requestData.status || 'pending',
            requestData.isPublic || requestData.is_public || false,
            requestData.estimatedCost || requestData.estimated_cost,
            requestData.estimatedPrintTime || requestData.estimated_print_time
        ];
        
        await executeQuery(sql, binds);
        return requestId;
    },

    // Get print request by ID
    async getPrintRequestById(requestId) {
        const sql = 'SELECT * FROM print_requests WHERE request_id = ?';
        const result = await executeQuery(sql, [requestId]);
        return result[0] || null;
    },

    // Get print requests by user ID
    async getPrintRequestsByUserId(userId) {
        const sql = 'SELECT * FROM print_requests WHERE user_id = ? ORDER BY created_at DESC';
        return await executeQuery(sql, [userId]);
    },

    // Get all print requests (admin only)
    async getAllPrintRequests() {
        const sql = 'SELECT * FROM print_requests ORDER BY created_at DESC';
        return await executeQuery(sql);
    },

    // Update print request status
    async updatePrintRequestStatus(requestId, status, staffNotes = null) {
        const sql = `
            UPDATE print_requests 
            SET status = ?, staff_notes = ?, updated_at = CURRENT_TIMESTAMP()
            WHERE request_id = ?
        `;
        await executeQuery(sql, [status, staffNotes, requestId]);
    },

    // Toggle public status
    async togglePublicStatus(requestId, isPublic) {
        // Use the stored procedure
        const sql = 'CALL toggle_project_public(?, ?)';
        await executeQuery(sql, [requestId, isPublic]);
    },

    // Update print request
    async updatePrintRequest(requestId, updateData) {
        const sql = `
            UPDATE print_requests 
            SET project_name = ?, description = ?, material = ?, color = ?, quantity = ?, urgency = ?,
                special_instructions = ?, staff_notes = ?, actual_cost = ?, actual_print_time = ?,
                assigned_printer = ?, updated_at = CURRENT_TIMESTAMP()
            WHERE request_id = ?
        `;
        const binds = [
            updateData.projectName || updateData.project_name,
            updateData.description,
            updateData.material,
            updateData.color,
            updateData.quantity,
            updateData.urgency,
            updateData.specialInstructions || updateData.special_instructions,
            updateData.staffNotes || updateData.staff_notes,
            updateData.actualCost || updateData.actual_cost,
            updateData.actualPrintTime || updateData.actual_print_time,
            updateData.assignedPrinter || updateData.assigned_printer,
            requestId
        ];
        
        await executeQuery(sql, binds);
    }
};

/**
 * Community Projects Functions
 */
const CommunityRepository = {
    // Get all public projects
    async getPublicProjects() {
        const sql = 'SELECT * FROM community_projects_view ORDER BY likes DESC, created_at DESC';
        return await executeQuery(sql);
    },

    // Get project by ID
    async getProjectById(projectId) {
        const sql = 'SELECT * FROM community_projects WHERE project_id = ?';
        const result = await executeQuery(sql, [projectId]);
        return result[0] || null;
    },

    // Like a project
    async likeProject(projectId) {
        const sql = 'UPDATE community_projects SET likes = likes + 1 WHERE project_id = ?';
        await executeQuery(sql, [projectId]);
    },

    // Download a project
    async downloadProject(projectId) {
        const sql = 'UPDATE community_projects SET downloads = downloads + 1 WHERE project_id = ?';
        await executeQuery(sql, [projectId]);
    }
};

/**
 * Equipment Management Functions
 */
const EquipmentRepository = {
    // Get all equipment
    async getAllEquipment() {
        const sql = 'SELECT * FROM equipment ORDER BY name';
        return await executeQuery(sql);
    },

    // Get equipment by ID
    async getEquipmentById(equipmentId) {
        const sql = 'SELECT * FROM equipment WHERE equipment_id = ?';
        const result = await executeQuery(sql, [equipmentId]);
        return result[0] || null;
    },

    // Update equipment status
    async updateEquipmentStatus(equipmentId, status, notes = null) {
        const sql = `
            UPDATE equipment 
            SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP()
            WHERE equipment_id = ?
        `;
        await executeQuery(sql, [status, notes, equipmentId]);
    }
};

/**
 * Materials Management Functions
 */
const MaterialsRepository = {
    // Get all materials
    async getAllMaterials() {
        const sql = 'SELECT * FROM materials WHERE is_available = true ORDER BY name';
        return await executeQuery(sql);
    },

    // Get material by ID
    async getMaterialById(materialId) {
        const sql = 'SELECT * FROM materials WHERE material_id = ?';
        const result = await executeQuery(sql, [materialId]);
        return result[0] || null;
    }
};

/**
 * Dashboard Statistics Functions
 */
const DashboardRepository = {
    // Get user dashboard data
    async getUserDashboardData(userId) {
        const sql = 'SELECT * FROM user_dashboard_data WHERE user_id = ?';
        const result = await executeQuery(sql, [userId]);
        return result[0] || null;
    },

    // Get admin dashboard stats
    async getAdminDashboardStats() {
        const sql = 'SELECT * FROM admin_dashboard_stats';
        const result = await executeQuery(sql);
        return result[0] || null;
    },

    // Get recent activity
    async getRecentActivity(limit = 10) {
        const sql = `
            SELECT pr.*, u.display_name, u.email
            FROM print_requests pr
            JOIN users u ON pr.user_id = u.user_id
            ORDER BY pr.created_at DESC
            LIMIT ?
        `;
        return await executeQuery(sql, [limit]);
    }
};

/**
 * Audit Log Functions
 */
const AuditRepository = {
    // Log an action
    async logAction(action, tableName, recordId, oldValues, newValues, userId, ipAddress, userAgent) {
        const logId = uuidv4();
        const sql = `
            INSERT INTO audit_logs (log_id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const binds = [
            logId,
            userId,
            action,
            tableName,
            recordId,
            oldValues ? JSON.stringify(oldValues) : null,
            newValues ? JSON.stringify(newValues) : null,
            ipAddress,
            userAgent
        ];
        
        await executeQuery(sql, binds);
        return logId;
    }
};

/**
 * Health Check Function
 */
async function healthCheck() {
    try {
        const result = await executeQuery('SELECT CURRENT_TIMESTAMP() as timestamp, CURRENT_USER() as user');
        return {
            status: 'healthy',
            timestamp: result[0].TIMESTAMP,
            user: result[0].USER,
            database: process.env.SF_DATABASE,
            schema: process.env.SF_SCHEMA
        };
    } catch (err) {
        return {
            status: 'unhealthy',
            error: err.message
        };
    }
}

/**
 * Close all connections
 */
async function closeConnections() {
    try {
        await connectionPool.drain();
        console.log('Database connections closed');
    } catch (err) {
        console.error('Error closing database connections:', err);
    }
}

module.exports = {
    // Repositories
    UserRepository,
    PrintRequestRepository,
    CommunityRepository,
    EquipmentRepository,
    MaterialsRepository,
    DashboardRepository,
    AuditRepository,
    
    // Utility functions
    executeQuery,
    healthCheck,
    closeConnections,
    
    // Raw connection for complex queries
    connectionPool
};