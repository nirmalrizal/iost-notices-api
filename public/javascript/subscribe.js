const applicationServerPublicKey =
  "BEYEcsgymIys7d7rrCHgkLH_V5pBlUZxVqqrn2Vd3ubvEsOdw9dSMVolPZRnBOfScBJOxeBiUl-clrhmO7G4Sb0";

const pushButton = document.querySelector("#btnSubscribe");
const noticesSel = $("#notices");

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("sw.js")
    .then(function(swReg) {
      swRegistration = swReg;
      initializeUI();
    })
    .catch(function(error) {
      console.error("Service Worker Error", error);
    });
} else {
  showAlertMessage("Push messaging is not supported", "w");
}

function initializeUI() {
  pushButton.addEventListener("click", function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateBtn();
  });
}

function updateBtn() {
  if (Notification.permission === "denied") {
    showAlertMessage("Push Messaging Blocked", "w");
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    $("#btnSubscribe").html('<i class="fa fa-bell"></i> Unsubscribe');
    showAlertMessage(
      "You will receive notification when IOST publishes new notice",
      "s"
    );
  } else {
    $("#btnSubscribe").html('<i class="fa fa-bell"></i> Subscribe');
    showAlertMessage("Enable Push Messaging", "i");
  }
  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn();
    })
    .catch(function(err) {
      console.log("Failed to subscribe the user: ", err);
      updateBtn();
    });
}

function unsubscribeUser() {
  var subscriptionInfo;
  swRegistration.pushManager
    .getSubscription()
    .then(function(subscription) {
      if (subscription) {
        subscriptionInfo = subscription;
        return subscription.unsubscribe();
      }
    })
    .catch(function(error) {
      console.log("Error unsubscribing", error);
    })
    .then(function() {
      updateSubscriptionOnServer(null, subscriptionInfo);
      isSubscribed = false;

      updateBtn();
    });
}

function updateSubscriptionOnServer(subscription, subscriptionInfo) {
  if (subscription) {
    saveTheSubscription(subscription, "/save/subscribers");
  } else {
    saveTheSubscription(subscriptionInfo, "/remove/subscriber");
  }
}

function saveTheSubscription(subscription, url) {
  fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(subscription)
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);
    });
}

function showAlertMessage(message, messageType) {
  let alertType = "info";
  const allAlertTypes = {
    s: "success",
    d: "danger",
    i: "info",
    w: "warning"
  };
  alertType = allAlertTypes[messageType];

  $(noticesSel).html(
    '<div class="alert alert-' +
      alertType +
      '"><i class="fa fa-info-circle"></i> ' +
      message +
      "</div>"
  );
}
