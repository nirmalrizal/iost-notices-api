/* require("dotenv").config();
const Telegraf = require("telegraf");
const firebase = require("firebase");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(ctx => {
  saveTelegramUsers(ctx.from.id, ctx.chat.id);
  ctx.reply("You will receive message whenever IOST publishes any notices.");
});

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

bot.startPolling();

module.exports = sendNoticeToUser;
 */
