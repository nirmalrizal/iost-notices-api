require("dotenv").config();
const firebase = require("firebase");
const axios = require("axios");

const botBaseUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

function handleBotUpdates(data) {
  console.log("I am here");
  const { from, chat, entities, text } = data.message;
  const chatId = chat.id;
  const fromId = from.id;
  if (entities && entities[0].type === "bot_command") {
    console.log(text);
    if (text === "/start") {
      saveTelegramUsers(fromId, chatId);
      sendReplyToUser(
        chatId,
        "You will receive message whenever IOST publishes any notices."
      );
    } else {
      sendReplyToUser(chatId, `No action found for command : ${text}`);
    }
  } else {
    sendReplyToUser(chatId, "So sorry !! You cannot interact with the bot.");
  }
}

function sendNoticeToUser(notices) {
  if (notices && notices.length > 0) {
    firebase
      .database()
      .ref("telegrams")
      .once("value", function(d) {
        const usersObj = d.val();
        let users = [];
        if (usersObj) {
          users = Object.entries(usersObj);
        }
        notices.forEach(notice => {
          users.forEach(user => {
            sendReplyToUser(user[1].chatId, `${notice.title}\n${notice.link}`);
          });
        });
      });
  }
}

function saveTelegramUsers(fromId, chatId) {
  const userObj = {
    fromId,
    chatId
  };
  const newUser = `${fromId}-${chatId}`;
  firebase
    .database()
    .ref("telegrams/" + newUser)
    .set(userObj);
}

function sendReplyToUser(chatId, message) {
  axios.get(`${botBaseUrl}/sendMessage?chat_id=${chatId}&text=${message}`);
}

module.exports = {
  sendNoticeToUser,
  handleBotUpdates
};
