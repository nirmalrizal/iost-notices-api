const axios = require("axios");
const cheerio = require("cheerio");

const REQUEST_BASE_URL = "https://tuiost.edu.np";
const TOTAL_NOTICE_PAGE = 4;

const fetchNoticeAndSendNotifications = async () => {
  console.log("Pushing notifications");
  var notices = [];

  for (var i = 1; i <= TOTAL_NOTICE_PAGE; i++) {
    const REQUEST_URL = `${REQUEST_BASE_URL}/?page=${i}`;
    try {
      const response = await axios.get(REQUEST_URL);
      if (response && response.status == 200) {
        var $ = cheerio.load(response.data);
        var noticesSel = $("#notices .feature-content .mt-3 a");
        noticesSel.each(function(index, notice) {
          const link = notice.attribs.href;
          const title = notice.children[3].children[0].data;

          const linkArr = link.split("/");
          const linkArrLen = linkArr.length;
          const linkLastRef = linkArr[linkArrLen - 1].split(".")[0];
          notices.push({
            title,
            link,
            ref: linkLastRef
          });
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
  return notices;
};

module.exports = fetchNoticeAndSendNotifications;
