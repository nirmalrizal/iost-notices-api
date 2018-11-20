const firebase = require("firebase");
const webpush = require("web-push");

const fetchNotices = require("../src/fetch-notices");

// Initialize web-push
webpush.setGCMAPIKey(
  "AAAAu_5Hx98:APA91bEp83PtYMrByizUw5x-FH8tyU6ToWtvPYx_b0lApu8P9RFOfzwcdSX5A4rMBMuYv0jF0Ty2o2XYqFIsle025wDzlQ7SLcTVTM1rNMvEVuDbGCXNyTVJhfr7DVU1XVFAtoTjz-Ab"
);
webpush.setVapidDetails(
  "mailto:nirmalrijal41@gmail.com",
  "BEYEcsgymIys7d7rrCHgkLH_V5pBlUZxVqqrn2Vd3ubvEsOdw9dSMVolPZRnBOfScBJOxeBiUl-clrhmO7G4Sb0",
  "sI3efmZYroqjbQ_mnSn474mt7mQC8NR-meVFKdUpe5c"
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

        /* Loop over new notices, save them and send notifications */
        notices.forEach(notice => {
          saveAndSendForSingleNotice(notice, subscribers);
        });
      }
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
  console.log(subscriber);
  webpush
    .sendNotification(subscriber, JSON.stringify(notice))
    .then(() => {
      console.log("Pushed");
    })
    .catch(err => {
      // console.log(err);
      console.log("Error on pushing");
    });
}

module.exports = pushNotifications;
