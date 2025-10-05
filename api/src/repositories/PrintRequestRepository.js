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