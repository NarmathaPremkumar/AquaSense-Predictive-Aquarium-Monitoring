importScripts(
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBq9Sgx_EHhUhoZDkI9xXCtmaPUTq56UP4",
  authDomain: "aqua-smart-e5d78.firebaseapp.com",
  databaseURL: "https://aqua-smart-e5d78-default-rtdb.firebaseio.com",
  projectId: "aqua-smart-e5d78",
  storageBucket: "aqua-smart-e5d78.firebasestorage.app",
  messagingSenderId: "950175872930",
  appId: "1:950175872930:web:b83ba54188cdd86dd2e4fb",
  measurementId: "G-ZM40NE7MXL"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log(
    "[firebase-messaging-sw.js] Background message:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "AquaSense Alert";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "AquaSense detected a water-quality alert.",
    icon: "/AquaSense-Predictive-Aquarium-Monitoring/favicon.ico"
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

});