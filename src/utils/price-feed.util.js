const axios = require('axios');

async function getPriceFeeds() {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    params: {
      ids: 'ethereum,usd-coin',
      vs_currencies: 'usd'
    }
  });

  return {
    usdPrices: {
      ETH: response.data.ethereum.usd,
      USDC: response.data['usd-coin'].usd
    }
  };
}

module.exports = { getPriceFeeds };