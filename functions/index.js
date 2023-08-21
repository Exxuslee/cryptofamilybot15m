const {onRequest} = require("firebase-functions/v2/https");

exports.data = onRequest({maxInstances: 1, concurrency: 10}, (req, res) => {
    res.send("Hello from Firebase!")
});

exports.bot = onRequest({maxInstances: 1, concurrency: 10}, (req, res) => {
    const telegraf = require('telegraf');
    let bot = new telegraf.Telegram("1640757959:AAEhu30jHIhq25iVVEt6_m9e-a3_5317GHE");
    bot.sendMessage("530667295", 'New user joined 🎉').then(r => {
        res.send(r);
        bot = null
    });
});