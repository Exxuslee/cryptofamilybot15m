require("dotenv").config();
const axios = require("axios");
const qs = require("qs");

class GmailAPI {
    accessToken = "";

    getAcceToken = async () => {
        const data = qs.stringify({
            client_id: process.env.CLIENT_ID_GMAIL,
            client_secret: process.env.CLIENT_SECRET_GMAIL,
            refresh_token: process.env.REFRESH_TOKEN_GMAIL,
            grant_type: "refresh_token",
        });
        const config = {
            method: "post",
            url: process.env.API_URL_GMAIL,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: data,
        };
        let accessToken = "";
        await axios(config)
            .then(async function (response) {
                accessToken = await response.data.access_token;
                console.log("AccessToken: " + accessToken.length);
            })
            .catch(function (error) {
                console.log(error);
            });
        this.accessToken = accessToken
    };

    searchGmail = async (searchItem) => {
        const config1 = {
            method: "get",
            url: "https://www.googleapis.com/gmail/v1/users/me/messages?q=" + searchItem,
            headers: {Authorization: `Bearer ${this.accessToken}`},
        };
        let threadId = "";

        await axios(config1)
            .then(async function (response) {
                threadId = await response.data["messages"][0].id;
                // console.log("threadId: " + threadId);
            })
            .catch(function (error) {
                console.log(error);
            });
        return threadId;
    };

    readGmailContent = async (messageId) => {
        const config = {
            method: "get",
            url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
            headers: {Authorization: `Bearer ${this.accessToken}`},
        };

        let data = {};

        await axios(config)
            .then(async function (response) {
                data = await response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
        return data;
    };

    readInboxContent = async (searchText) => {
        await this.getAcceToken()
        let trade = ""
        const threadId = await this.searchGmail(searchText);
        const message = await this.readGmailContent(threadId);

        if (message.payload.headers.length > 0) {
            for (let i in message.payload.headers) {
                if (message.payload.headers[i].name === 'Subject') trade = message.payload.headers[i].value.substr(12, 1) === '1' ? 'SELL' : 'BUY'
            }
        }
        // const encodedMessage = await message.payload["parts"][0].body.data;
        // const decodedStr = Buffer.from(encodedMessage, "base64").toString("ascii");
        // console.log(decodedStr);
        console.log({date: threadId, trade: trade})
        return {
            date: threadId,
            trade: trade
        }
    };
}

module.exports = new GmailAPI();