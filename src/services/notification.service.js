const nodemailer = require('nodemailer');
require('dotenv').config();

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  sendAlert(accountData) {
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: process.env.ALERT_EMAIL,
    //   subject: 'Liquidation Risk Alert',
    //   text: `
    //     ALERT: Account ${accountData.walletAddress} has a Health Factor of ${accountData.healthFactor}.
    //     Total Collateral: $${accountData.totalCollateralUSD}
    //     Total Debt: $${accountData.totalDebtUSD}
    //     Immediate action required.
    //   `
    // };

    // this.transporter.sendMail(mailOptions);
    console.log(`Liquidation Alert for ${accountData.walletAddress}`);
  }
}

module.exports = NotificationService;