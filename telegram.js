process.env.NTBA_FIX_319 = "1";
require("dotenv").config();
const telegram = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN_IRA
const bot = new telegram(token, {polling: true});

// bot.setMyCommands([
//     { command: "start", description: "start" },
//     { command: "btc", description: "btc" },
// ]);

module.exports.sendTelegramMessage = function (message) {
    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message)
};