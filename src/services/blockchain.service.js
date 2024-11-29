const ethers = require('ethers');
const DatabaseService = require('./database.service');
const NotificationService = require('./notification.service');
const { getContract } = require('../../utils/getContract');

const { BLOCKCHAIN_CONFIG } = require('../config/constants');
const AAVE_LENDING_POOL_CONTRACT = require('../contract/aaveLendingPool.json')
const AAVE_PROTOCOLA_DATA_PROVIDER_CONTRACT = require('../contract/aaveProtocolaDataProvider.json');

class BlockchainService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.PROVIDER_URL);
        this.aaveLendingPool = getContract(
            BLOCKCHAIN_CONFIG.AAVE_LENDING_POOL,
            AAVE_LENDING_POOL_CONTRACT.abi,
            this.provider
        )
        
        this.aaveProtocolaDataProvider = getContract(
            BLOCKCHAIN_CONFIG.AAVE_PROTOCOLA_DATA_PROVIDER,
            AAVE_PROTOCOLA_DATA_PROVIDER_CONTRACT.abi,
            this.provider
        )

        this.databaseService = new DatabaseService();
        this.notificationService = new NotificationService();
    }

    async monitorLiquidationRisk(walletAddresses) {
        try {
            for (const address of walletAddresses) {
                const accountData = await this.fetchAccountLiquidationData(address);

                //CALLING LIQUIDATION HERE
                if (accountData.healthFactor < 1.05) {
                    try {
                        const userReserves = await this.aaveProtocolaDataProvider.getUserReservesData(address)
                       
                        const collateralAsset = userReserves[0].underlyingAsset;
                        const debtAsset = userReserves[0].underlyingAsset;
                        const debtToCover = userData[1];
                        const receiveAToken = true;

                        await this.aaveLendingPool.liquidationCall(
                            collateralAsset,
                            debtAsset,
                            address,
                            debtToCover,
                            receiveAToken
                        );
                    } catch (error) {
                        console.error('user reserves data :', error);
                    }

                    this.notificationService.sendAlert(accountData);
                }

                await this.databaseService.saveAccountData(accountData);
            }
        } catch (err) {
            console.log('err', err)
        }

    }

    async fetchAccountLiquidationData(walletAddress) {
        const userData = await this.aaveLendingPool.getUserAccountData(walletAddress);
        const [
            totalCollateralETH,
            totalDebtETH,
            availableBorrowsETH,
            currentLiquidationThreshold,
            healthFactor
        ] = userData;

        //[TODO] GET PRICE FROM PRICE FEED FOLLOWING IS HARDCODE FOR EXAMPLE PURPOSE
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
            this.aaveLendingPool.on(eventName, (...args) => {
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
