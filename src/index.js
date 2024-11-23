const express = require('express');
const { Pool } = require('pg');
const BlockchainService = require('./services/blockchain.service');
const DatabaseService = require('./services/database.service');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());

const dbService = new DatabaseService();
const blockchainService = new BlockchainService();

const monitoredAddresses = [
  "0x307AEFE7fEE2Bcf9B6bDC159e95A959100BE7b33",
  "0x8E978fAEa665092aCF47f57BC94785C4ffecB756",
  "0x3e0b81C7B552DE2B1c212F8EFC163c0FA81Ded82",
  "0x9Cfe8b9D8a1C545421E14560A490B67AFcF16bd8",
  '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
  '0x602d9aBD5671D24026e2ca473903fF2A9A957407',
  '0x26C7199e9dfE0E0C73Cf890c96893de0129062Cb',
  '0x26C7199e9dfE0E0C73Cf890c96893de0129062Cb',
  '0x0084EE6c8893C01E252198b56eC127443dc27464',
  '0x272492e7f7f4cfa8D2F7F6e4E49E9c6bCE76c9cd',
  '0x886FAa52466097f7835648c40642B383788e2899',
  '0x28C6c06298d514Db089934071355E5743bf21d60'
];

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
    await blockchainService.monitorLiquidationRisk(monitoredAddresses);
    
    setInterval(async () => {
      try {
        await blockchainService.monitorLiquidationRisk(monitoredAddresses);
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
