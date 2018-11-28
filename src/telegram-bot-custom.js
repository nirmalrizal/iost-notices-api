require("dotenv").config();
const firebase = require("firebase");
const axios = require("axios");

const botBaseUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

function handleBotUpdates(data) {
  const { chat } = data;
  //   const fromId = from.id;
  const chatId = chat.id;
  if (data.entities && data.entities.type === "bot_command") {
    console.log("I will handle this");
  } else {
    sendReplyToUser(
      chatId,
      "We are very sorry. You cannot interact with the bot."
    );
  }
}

function sendReplyToUser(chatId, message) {
  axios.get(`${botBaseUrl}/sendMessage?chat_id=${chatId}&text=${message}`);
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
            bot.telegram.sendMessage(user[1].chatId, notice.title);
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

module.exports = {
  sendNoticeToUser,
  handleBotUpdates
};
