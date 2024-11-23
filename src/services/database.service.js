const { Pool } = require('pg');
require('dotenv').config();

class DatabaseService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    this.initializeSchema();
  }

  async initializeSchema() {
    const client = await this.pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS account_liquidation_data (
        wallet_address TEXT PRIMARY KEY,
        health_factor FLOAT,
        total_collateral_usd FLOAT,
        total_debt_usd FLOAT,
        last_updated TIMESTAMP
      )
    `);
    client.release();
  }

  async saveAccountData(data) {
    const query = `
      INSERT INTO account_liquidation_data 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (wallet_address) DO UPDATE
      SET health_factor = $2, total_collateral_usd = $3, 
          total_debt_usd = $4, last_updated = $5
    `;
    await this.pool.query(query, [
      data.walletAddress,
      data.healthFactor,
      data.totalCollateralUSD,
      data.totalDebtUSD,
      data.lastUpdated
    ]);
  }
}

module.exports = DatabaseService;
