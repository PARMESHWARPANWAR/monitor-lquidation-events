# Aave Liquidation Indexer

## Prerequisites
- Docker
- Docker Compose
- Infura API Key (for Ethereum mainnet access)

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/PARMESHWARPANWAR/monitor-lquidation-events
cd aave-liquidation-indexer
```

2. Create a `.env` file in the project root with the following variables:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
ALERT_EMAIL=recipient_email@example.com
ETH_MAIN_NET_URL='https://mainnet.infura.io/v3/'
AVALANCHE_FUJI_NET_URL='https://avalanche-fuji.infura.io/v3/'
INFURA_ID=your_infura_project_id
PORT=3000


INFURA_ID=1cc81f4ddef24f439bd8f8a1f811b0c0
DATABASE_URL='postgres://test:test@localhost:5432/aave_indexer'
NETWORK_TYPE='MAIN'
```

3. Build and start the application
```bash
docker-compose up --build
```

## Running the Application
- The application will start and begin monitoring the specified wallet addresses
- Access the API at `http://localhost:3000`
- Available Endpoints:
  - `/accounts`: List all monitored accounts
  - `/accounts/:address`: Get details for a specific account
  - `/health`: Check application health status

## Environment Variables
- `EMAIL_USER`: Gmail account for sending alerts
- `EMAIL_PASS`: Gmail account password
- `ALERT_EMAIL`: Email address to receive liquidation alerts
- `ETH_MAIN_NET_URL`: Ethereum mainnet RPC endpoint
- `INFURA_ID`: Your Infura project ID
- `DATABASE_URL`: PostgreSQL connection string

## Notes
- Ensure you have a valid Infura API key
- The application monitors predefined wallet addresses
- Liquidation risk is checked every 15 minutes

## Security Recommendations
- Use app-specific passwords for Gmail
- Keep your `.env` file private
- Use environment-specific configurations in production
