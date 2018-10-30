const express = require("express");
const router = express.Router();

const fetchNoticeAndSendNotifications = require("../trigger-notifications");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/notices", async function(req, res) {
  const notices = await fetchNoticeAndSendNotifications();
  res.json(notices);
});

module.exports = router;
