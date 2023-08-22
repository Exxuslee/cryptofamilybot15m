const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const MailComposer = require("nodemailer/lib/mail-composer");

// If modifying these scopes, delete token.json.
const SCOPES = [' https://www.googleapis.com/auth/gmail.send ', ' https://www.googleapis.com/auth/gmail.labels '];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), './gmail/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), './gmail/credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

const encodeMessage = (message) => {
    return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const createMail = async (options) => {
    const mailComposer = new MailComposer(options);
    const message = await mailComposer.compile().build();
    return encodeMessage(message);
};


module.exports.sendMail = function (bitKey) {
    const options = {
        to: ['exxuslee@gmail.com'],
        subject: 'CF',
        text: JSON.stringify(bitKey),
        textEncoding: 'base64',
        headers: [
            {key: 'X-Application-Developer', value: 'Amit Agarwal'},
            {key: 'X-Application-Version', value: 'v1.0.0.2'},
        ],
    };

    async function mail(auth) {
        const gmail = google.gmail({version: 'v1', auth});
        const rawMessage = await createMail(options);
        const {data: {id} = {}} = await gmail.users.messages.send({
            userId: 'me', resource: {raw: rawMessage,},
        });
        console.log('message id ' + id)
    }

    authorize().then(mail).catch(console.error);
};

module.exports.readMail = function () {

    async function listLabels(auth) {
        const gmail = google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.list({
            userId: 'me',
            q:'subject:itr'
        });
        console.log(res)
        const msg = res.data.messages
        const mails = []
        for (let message of msg) {
            let body1, body2, attachment
            txt = await gmail.users.messages.get({ userId: 'me', id: message['id'] })
            if (txt.data.payload?.parts[0]){
                body1 = base64.decode(txt.data.payload?.parts[0]?.parts[0]?.body?.data)?.replace(/-/g, '+')?.replace(/_/g, '/')
                body2 = base64.decode(txt.data.payload?.parts[0]?.parts[1]?.body?.data).replace(/-/g, '+')?.replace(/_/g, '/')
            }
            if (txt.data.payload?.parts[1]?.body?.attachmentId !== undefined) {
                let attachmentId = txt.data.payload?.parts[1]?.body?.attachmentId
                attachment = await gmail.users.messages.attachments.get({userId: 'me', id: attachmentId, messageId:message['id']})
            }
            mails.push({ body1, body2, attachment, txt })
        }
        return { mail: mails };
    }

    authorize().then(listLabels).catch(console.error);
};