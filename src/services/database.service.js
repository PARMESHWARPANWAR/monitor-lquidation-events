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
    // Inserts new account data
    // If account already exists, updates existing record
    // Updates health factor, collateral value, debt value, and timestamp
    console.log('liquidation alert data=>',data)
    const upsertAccountQuery = `
      INSERT INTO account_liquidation_data (
        wallet_address, 
        health_factor, 
        total_collateral_usd, 
        total_debt_usd, 
        last_updated
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (wallet_address) DO UPDATE
      SET 
        health_factor = EXCLUDED.health_factor, 
        total_collateral_usd = EXCLUDED.total_collateral_usd, 
        total_debt_usd = EXCLUDED.total_debt_usd, 
        last_updated = EXCLUDED.last_updated
    `;

    await this.pool.query(upsertAccountQuery, [
      data.walletAddress,
      data.healthFactor,
      data.totalCollateralUSD,
      data.totalDebtUSD,
      data.lastUpdated
    ]);
  }
}

module.exports = DatabaseService;
