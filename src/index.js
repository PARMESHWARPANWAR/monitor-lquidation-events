const express = require('express');
const { Pool } = require('pg');
const BlockchainService = require('./services/blockchain.service');
const DatabaseService = require('./services/database.service');
const { MONITORED_ADDRESSES } = require('./config/constants');
require('dotenv').config();

const app = express();
app.use(express.json());

const dbService = new DatabaseService();
const blockchainService = new BlockchainService();

app.get('/accounts', async (req, res) => {
  try {
    const { rows } = await dbService.pool.query('SELECT * FROM account_liquidation_data');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching account data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/accounts/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { rows } = await dbService.pool.query(
      'SELECT * FROM account_liquidation_data WHERE wallet_address = $1',
      [address]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching specific account:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'running',
    lastChecked: new Date().toISOString(),
    databaseConnection: dbService.pool.totalCount > 0 ? 'connected' : 'disconnected'
  });
});

async function startBlockchainMonitoring() {
  try {
    await blockchainService.monitorLiquidationRisk(MONITORED_ADDRESSES);
    
    setInterval(async () => {
      try {
        await blockchainService.monitorLiquidationRisk(MONITORED_ADDRESSES);
      } catch (error) {
        console.error('Error in monitoring interval:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes

    blockchainService.listenToAaveEvents();
  } catch (error) {
    console.error('Error starting blockchain monitoring:', error);
  }
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await startBlockchainMonitoring();
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  await dbService.pool.end();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise rejection:', error);
});
