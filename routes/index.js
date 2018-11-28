const express = require("express");
const router = express.Router();
const firebase = require("firebase");

const fetchNotices = require("../src/fetch-notices");
const pushNotifications = require("../src/push-notification");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/notices", async function(req, res) {
  const notices = await fetchNotices();
  res.json(notices);
});

/* router.get("/push", function(req, res, next) {
  pushNotifications();
  res.send(true);
}); */

router.post("/save/subscribers", function(req, res) {
  const userHash = req.body.keys.auth;
  firebase
    .database()
    .ref("subscribers/" + userHash)
    .set(req.body);
  res.send(true);
});

router.post("/remove/subscriber", function(req, res) {
  const userHash = req.body.keys.auth;
  firebase
    .database()
    .ref("subscribers/" + userHash)
    .remove();
  res.send(true);
});

router.post("/get/telegram/updates", function(req, res) {
  console.log(req.body);
  res.send(true);
});

module.exports = router;
