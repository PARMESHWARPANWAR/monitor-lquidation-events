const ethers = require('ethers');
const { BLOCKCHAIN_CONFIG } = require('../config/constants');
const DatabaseService = require('./database.service');
const NotificationService = require('./notification.service');
const { getPriceFeeds } = require('../utils/price-feed.util');

const POOL_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "reserve",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "onBehalfOf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "referralCode",
                "type": "uint16"
            }
        ],
        "name": "Deposit",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "reserve",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "onBehalfOf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowRateMode",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowRate",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "referralCode",
                "type": "uint16"
            }
        ],
        "name": "Borrow",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "reserve",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "repayer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "useATokens",
                "type": "bool"
            }
        ],
        "name": "Repay",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "reserve",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Withdraw",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "collateralAsset",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "debtAsset",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "debtToCover",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "liquidatedCollateralAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "liquidator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "receiveAToken",
                "type": "bool"
            }
        ],
        "name": "LiquidationCall",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserAccountData",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalCollateralBase",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalDebtBase",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "availableBorrowsBase",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentLiquidationThreshold",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "ltv",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "healthFactor",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

const DATA_PROVIDER_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserReserveData",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "currentATokenBalance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentStableDebt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentVariableDebt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "principalStableDebt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "scaledVariableDebt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "stableBorrowRate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "liquidityRate",
                "type": "uint256"
            },
            {
                "internalType": "uint40",
                "name": "stableRateLastUpdated",
                "type": "uint40"
            },
            {
                "internalType": "bool",
                "name": "usageAsCollateralEnabled",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

class BlockchainService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.PROVIDER_URL);
        this.lendingPoolContract = new ethers.Contract(
            BLOCKCHAIN_CONFIG.POOL,
            POOL_ABI,
            this.provider
        );
        this.dataProviderContract = new ethers.Contract(
            BLOCKCHAIN_CONFIG.POOL_DATA_PROVIDER,
            DATA_PROVIDER_ABI,
            this.provider
        );
        this.databaseService = new DatabaseService();
        this.notificationService = new NotificationService();
    }

    async monitorLiquidationRisk(walletAddresses) {
        try {
            for (const address of walletAddresses) {
                const accountData = await this.fetchAccountLiquidationData(address);

                if (accountData.healthFactor < 1.05) {
                    this.notificationService.sendAlert(accountData);
                }

                await this.databaseService.saveAccountData(accountData);
            }
        } catch (err) {
            console.log('err', err)
        }

    }

    async fetchAccountLiquidationData(walletAddress) {
        const userData = await this.lendingPoolContract.getUserAccountData(walletAddress);
        const [
            totalCollateralETH,
            totalDebtETH,
            availableBorrowsETH,
            currentLiquidationThreshold,
            healthFactor
        ] = userData;

        const usdPrices = { ETH: 3400 };

        return {
            walletAddress,
            healthFactor: parseFloat(ethers.formatUnits(healthFactor, 18)),
            totalCollateralUSD: parseFloat(ethers.formatUnits(totalCollateralETH, 18)) * usdPrices.ETH,
            totalDebtUSD: parseFloat(ethers.formatUnits(totalDebtETH, 18)) * usdPrices.ETH,
            lastUpdated: new Date()
        };
    }

    async listenToAaveEvents() {
        const events = ['Deposit', 'Borrow', 'Repay', 'Withdraw', 'LiquidationCall'];

        events.forEach(eventName => {
            console.log('Setting up listener for:', eventName);

            this.lendingPoolContract.on(eventName, (...args) => {
                const event = args[args.length - 1];
                const values = args.slice(0, -1);

                switch (eventName) {
                    case 'Deposit':
                        const [reserve, user, onBehalfOf, amount, referralCode] = values;
                        console.log('Deposit Event:', {
                            reserve,
                            user,
                            onBehalfOf,
                            amount: amount.toString(),
                            referralCode
                        });
                        break;

                    case 'Borrow':
                        const [borrowReserve, borrowUser, borrowOnBehalfOf, borrowAmount, borrowRateMode, borrowRate, borrowReferralCode] = values;
                        console.log('Borrow Event:', {
                            reserve: borrowReserve,
                            user: borrowUser,
                            onBehalfOf: borrowOnBehalfOf,
                            amount: borrowAmount.toString(),
                            borrowRateMode: borrowRateMode.toString(),
                            borrowRate: borrowRate.toString(),
                            referralCode: borrowReferralCode
                        });
                        break;

                    case 'Repay':
                        const [repayReserve, repayUser, repayer, repayAmount, useATokens] = values;
                        console.log('Repay Event:', {
                            reserve: repayReserve,
                            user: repayUser,
                            repayer,
                            amount: repayAmount.toString(),
                            useATokens
                        });
                        break;

                    case 'Withdraw':
                        const [withdrawReserve, withdrawUser, to, withdrawAmount] = values;
                        console.log('Withdraw Event:', {
                            reserve: withdrawReserve,
                            user: withdrawUser,
                            to,
                            amount: withdrawAmount.toString()
                        });
                        break;

                    case 'LiquidationCall':
                        const [collateralAsset, debtAsset, liquidatedUser, debtToCover, liquidatedCollateralAmount, liquidator, receiveAToken] = values;
                        console.log('Liquidation Event:', {
                            collateralAsset,
                            debtAsset,
                            user: liquidatedUser,
                            debtToCover: debtToCover.toString(),
                            liquidatedCollateralAmount: liquidatedCollateralAmount.toString(),
                            liquidator,
                            receiveAToken
                        });
                        break;
                }

                this.updateUserAccountData(event);
            });
        });
    }

    async updateUserAccountData(event) {
        try {
            let userAddress;
            if (event.args) {
                userAddress = event.args.user || event.args.onBehalfOf;
            }

            if (userAddress) {
                const accountData = await this.fetchAccountLiquidationData(userAddress);

                if (accountData.healthFactor < 1.05) {
                    this.notificationService.sendAlert(accountData);
                }

                await this.databaseService.saveAccountData(accountData);
            }
        } catch (error) {
            console.error('Error updating user account data:', error);
        }
    }
}

module.exports = BlockchainService;
