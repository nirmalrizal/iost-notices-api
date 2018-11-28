require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const firebase = require("firebase");
const exphbs = require("express-handlebars");

const pushNotifications = require("./src/push-notification");
require("./src/telegram-bot");

var indexRouter = require("./routes/index");

var app = express();

var config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DB_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSENGER_ID
};
firebase.initializeApp(config);

// view engine setup
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

/* Run timer */
var TOTAL_MILISECONDS_IN_MINUTE = 60000;
var intervalWork = setInterval(function() {
  checkTimeAndSendNotifications();
}, TOTAL_MILISECONDS_IN_MINUTE);

// pushNotifications();

function checkTimeAndSendNotifications() {
  var currentDate = new Date();
  var currentMinute = currentDate.getMinutes();
  // var isMinuteDivisibleByFive = !Boolean(currentMinute % 5);
  console.log(currentMinute);
  var isItFirstMinute = currentMinute === 1;
  if (isItFirstMinute) {
    console.log("Call the push function");
    pushNotifications();
  }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
