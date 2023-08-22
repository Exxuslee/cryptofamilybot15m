const mail = require("./gmail/index");
// mail.sendMail({test:"test"});
// console.log(mail.readMail())

const gmail = require("./gmail/GmailApi");

gmail.readInboxContent(process.env.READ_INBOX_GMAIL);