const gmail = require("./gmail/GmailApi");
require("dotenv").config()
const Binance = require('binance-api-node')
const dayjs = require("dayjs")
const telegram = require('./telegram');

const client = Binance.default({apiKey: process.env.binancePubKey, apiSecret: process.env.binancePrivKey,});
const LIMIT = 2
const SYMBOL = 'BTCTUSD'
let limit = 0
let count = 0
let date = ""
let price = 0

console.log('==== 💵 CFbot 💵 =====')
telegram.sendTelegramMessage('>CFbot 15m<')

async function response() {
        gmail.readInboxContent(process.env.READ_INBOX_GMAIL).then(act => {
            /** BUY */
            if (limit < LIMIT && act.trade === 'BUY' && act.date !== date && act.date !== "") {
                date = act.date
                limit++
                count = count - price - 1
                report()
            }
            /** SELL */
            if (limit > -LIMIT && act.trade === 'SELL' && act.date !== date && act.date !== "") {
                date = act.date
                limit--
                count = count + price - 1
                report()
            }

            function report() {
                let timeStart = dayjs(Date.now()).format('DD.MM.YY HH:mm:ss')
                let limitZero = count + price * limit
                let tgMessage = `${act.trade} ${(+price).toFixed(0)} #${limit} ${limitZero.toFixed(0)}`
                let message = `${timeStart} ${tgMessage}`
                console.log(message)
                telegram.sendTelegramMessage(tgMessage)
            }
        });
}

gmail.readInboxContent(process.env.READ_INBOX_GMAIL).then(act => date = act.date)
setInterval(response, 300000)
client.ws.aggTrades([SYMBOL], act => price = +act.price)