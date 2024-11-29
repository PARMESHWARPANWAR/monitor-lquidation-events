require('dotenv').config();

//NOTE :- USING THESE HARDCODE WALLET ADDRESS FOR TESTING
const MONITORED_ADDRESSES = [
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

//NOTE :- TESTNET AVALANCE FUJI V2 MARKET
// V2 AEVE PROTOCOAL

const TEST_NET_CONFIG = {
  NETWORK: 'testnet',
  PROVIDER_URL: `${process.env.AVALANCHE_FUJI_NET_URL}${process.env.INFURA_ID}` || '',
  AAVE_PROTOCOLA_DATA_PROVIDER: '0x0668EDE013c1c475724523409b8B6bE633469585',
  AAVE_LENDING_POOL: '0x76cc67FF2CC77821A70ED14321111Ce381C2594D',
  AUSD_CONTRACT: '',
  POOL_ADDRESSES_PROVIDER:'0x7fdC1FdF79BE3309bf82f4abdAD9f111A6590C0f'
}

const MAIN_NET_CONFIG = {
  NETWORK: 'mainnet',
  PROVIDER_URL: `${process.env.ETH_MAIN_NET_URL}${process.env.INFURA_ID}` || '',
  AAVE_PROTOCOLA_DATA_PROVIDER: '0x057835ad21a177dbdd3090bb1cae03eacf78fc6d',
  AAVE_LENDING_POOL: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
  AUSD_CONTRACT: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
  POOL_ADDRESSES_PROVIDER:'0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'
}

module.exports = {
  MONITORED_ADDRESSES,
  BLOCKCHAIN_CONFIG : process.env.NETWORK_TYPE === 'MAIN'? MAIN_NET_CONFIG:TEST_NET_CONFIG,
};