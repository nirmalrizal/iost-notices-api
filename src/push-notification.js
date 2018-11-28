require("dotenv").config();
const firebase = require("firebase");
const webpush = require("web-push");

const fetchNotices = require("../src/fetch-notices");
// const sendNoticeToUser = require("../src/telegram-bot");

// Initialize web-push
webpush.setGCMAPIKey(process.env.GCMAPI_KEY);
webpush.setVapidDetails(
  "mailto:nirmalrijal41@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const pushNotifications = async () => {
  const siteNotices = await fetchNotices();
  // console.log(siteNotices.length);
  firebase
    .database()
    .ref("notices/")
    .once("value", function(d) {
      const noticeObj = d.val();
      let newNotices = [];
      let dbNotices = [];
      if (!noticeObj || Object.keys(noticeObj).length === 0) {
        newNotices = siteNotices;
      } else {
        dbNotices = Object.keys(noticeObj);
        newNotices = siteNotices.reduce((a, b) => {
          if (dbNotices.indexOf(b.ref) === -1) {
            a.push(b);
          }
          return a;
        }, []);
      }
      console.log("Site notice : " + siteNotices.length);
      console.log("Database notice : " + dbNotices.length);
      console.log("New notice : " + newNotices.length);
      handleNewNotices(newNotices);
    });
};

function handleNewNotices(notices) {
  firebase
    .database()
    .ref("subscribers/")
    .once("value", function(d) {
      const subscribersObj = d.val();
      let subscribers = [];
      if (subscribersObj) {
        subscribers = Object.entries(subscribersObj);
      }

      /* Loop over new notices, save them and send notifications */
      notices.forEach(notice => {
        saveAndSendForSingleNotice(notice, subscribers);
      });

      // sendNoticeToUser(notices);
    });
}

function saveAndSendForSingleNotice(notice, subscribers) {
  firebase
    .database()
    .ref("notices/" + notice.ref)
    .set(notice);

  /* Loop over subscribers and send notification */
  subscribers.forEach(sub => {
    sendNotificationToSingleSubscriber(sub[1], notice);
  });
}

function sendNotificationToSingleSubscriber(subscriber, notice) {
  webpush
    .sendNotification(subscriber, JSON.stringify(notice))
    .then(() => {
      console.log("Pushed : " + new Date());
    })
    .catch(err => {
      firebase
        .database()
        .ref("subscribers/" + subscriber.keys.auth)
        .remove();
    });
}

module.exports = pushNotifications;
