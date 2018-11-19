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
  console.log("Service Worker and Push is supported");

  navigator.serviceWorker
    .register("sw.js")
    .then(function(swReg) {
      console.log("Service Worker is registered", swReg);

      swRegistration = swReg;
      initializeUI();
    })
    .catch(function(error) {
      console.error("Service Worker Error", error);
    });
} else {
  console.warn("Push messaging is not supported");
  $(noticesSel).html(
    '<div class="alert alert-warning"><i class="fa fa-info-circle"></i> Push messaging is not supported</div>'
  );
}

function initializeUI() {
  pushButton.addEventListener("click", function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      //   unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
      console.log("User IS subscribed.");
    } else {
      console.log("User is NOT subscribed.");
    }

    updateBtn();
  });
}

function updateBtn() {
  if (Notification.permission === "denied") {
    $(noticesSel).html(
      '<div class="alert alert-warning"><i class="fa fa-info-circle"></i> Push Messaging Blocked.</div>'
    );
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    $("#btnSubscribe").html('<i class="fa fa-bell"></i> Subscribed');
    $(noticesSel).html(
      '<div class="alert alert-success"><i class="fa fa-info-circle"></i> You will receive notification when IOST publishes new notice</div>'
    );
  } else {
    $(noticesSel).html(
      '<div class="alert alert-info"><i class="fa fa-info-circle"></i> Enable Push Messaging</div>'
    );
    pushButton.disabled = false;
  }
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      console.log("User is subscribed.");

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

      console.log("User is unsubscribed.");
      isSubscribed = false;

      updateBtn();
    });
}

function updateSubscriptionOnServer(subscription, subscriptionInfo) {
  // TODO: Send subscription to application server

  /* const subscriptionJson = document.querySelector(".js-subscription-json");
  const subscriptionDetails = document.querySelector(
    ".js-subscription-details"
  ); */

  if (subscription) {
    // subscriptionJson.textContent = JSON.stringify(subscription);
    saveTheSubscription(subscription, "/save/subscribers");
    // subscriptionDetails.classList.remove("is-invisible");
  } else {
    // saveTheSubscription(subscriptionInfo, "/remove/subscriber");
    // subscriptionDetails.classList.add("is-invisible");
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
