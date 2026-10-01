import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging.js";

import { firebaseConfig } from "./firebase-config.js";


// ======================================================
// FIREBASE CONNECTION
// ======================================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);

const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  console.log("🔔 FCM MESSAGE RECEIVED:");
  console.log(payload);

  const title =
    payload.notification?.title || "AquaSense Alert";

  const body =
    payload.notification?.body ||
    "AquaSense received a notification.";

  alert(
    "🔔 FCM MESSAGE RECEIVED!\n\n" +
    title +
    "\n" +
    body
  );
});

// ======================================================
// MOBILE PUSH NOTIFICATION SETUP
// ======================================================

async function enablePushNotifications() {


  try {

    console.log("🔔 Requesting notification permission...");

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {

      console.log("❌ Notification permission was not granted.");

      return;

    }

    console.log("✅ Notification permission granted!");

   const registration = await navigator.serviceWorker.register(
  "/AquaSense-Predictive-Aquarium-Monitoring/firebase-messaging-sw.js"
);

console.log("✅ Firebase messaging service worker registered.");
console.log("Service Worker scope:", registration.scope);
console.log("Service Worker state:", registration.active?.state);

alert(
  "Service Worker registered successfully!\n\n" +
  "Scope:\n" + registration.scope
);

    const token = await getToken(messaging, {
      vapidKey: "BKV2gqreCTzUCv5Hk2sfHnT6OXb54fFiyi3QGQOBw9UOUEoEZe-uFGIzIaIUc36uvxY5ED2CjWQn2RHk2Keyk8Y",
      serviceWorkerRegistration: registration
    });
if (token) {

  console.log("✅ FCM registration token:");
  console.log(token);

  // Save FCM token to Firestore
  if (auth.currentUser) {

    await setDoc(
      doc(db, "fcmTokens", auth.currentUser.uid),
      {
        token: token,
        userId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    console.log("✅ FCM token saved to Firestore.");

    alert(
      "✅ AquaSense notifications connected!\n\n" +
      "FCM token has been saved to Firebase."
    );

  } else {

    console.log("⚠️ User is not logged in.");

    alert(
      "⚠️ Please login first, then enable notifications."
    );

  }

} else {

  console.log("⚠️ No FCM token received.");

  alert(
    "⚠️ Firebase did not provide an FCM token."
  );

}

  const tokenBox = document.createElement("div");

  tokenBox.innerHTML = `
    <div style="
      position: fixed;
      top: 10%;
      left: 5%;
      width: 90%;
      background: white;
      padding: 20px;
      border-radius: 12px;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      font-family: Arial;
    ">
      <h3>🔔 FCM Registration Token</h3>

      <textarea
        id="fcmTokenText"
        readonly
        style="
          width: 100%;
          height: 150px;
          font-size: 12px;
          box-sizing: border-box;
        "
      >${token}</textarea>

      <button
        id="copyFcmTokenBtn"
        style="
          margin-top: 10px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          background: #2196f3;
          color: white;
          font-size: 16px;
        "
      >
        📋 Copy Token
      </button>

      <button
        id="closeFcmTokenBtn"
        style="
          margin-top: 10px;
          margin-left: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          background: #777;
          color: white;
          font-size: 16px;
        "
      >
        Close
      </button>
    </div>
  `;

  document.body.appendChild(tokenBox);

  document
    .getElementById("copyFcmTokenBtn")
    .addEventListener("click", copyToken);

  document
    .getElementById("closeFcmTokenBtn")
    .addEventListener("click", () => {
      tokenBox.remove();
    });

} else {

  console.log("⚠️ No FCM token received.");

  alert("⚠️ Firebase did not provide an FCM token.");

}else {

  console.log("⚠️ No FCM token received.");

  alert(
    "⚠️ Firebase did not provide an FCM token."
  );

}

  } catch (error) {

    console.error("❌ Push notification setup failed:", error);

  }

}

window.enablePushNotifications = enablePushNotifications;

function convertUsernameToEmail(username) {
  return username.trim().toLowerCase() + "@aquasense.local";
}

window.aquaSenseLogin = async function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter username and password.");
    return;
  }

  const email = convertUsernameToEmail(username);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("✅ AquaSense login successful");
    console.log("Username:", username);
    console.log("User UID:", userCredential.user.uid);

    document.getElementById("loginScreen").style.display = "none";
  

  } catch (error) {
    console.error("Login failed:", error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      alert("❌ Invalid username or password.");
    } else {
      alert("❌ Login failed: " + error.message);
    }
  }
};

window.aquaSenseRegister = async function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter username and password.");
    return;
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    alert("Username can contain only letters, numbers, dot, underscore and hyphen.");
    return;
  }

  if (password.length < 6) {
    alert("Password must contain at least 6 characters.");
    return;
  }

  const email = convertUsernameToEmail(username);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("✅ AquaSense account created");
    console.log("Username:", username);
    console.log("User UID:", userCredential.user.uid);

    alert("✅ Account created successfully!");

    document.getElementById("loginScreen").style.display = "none";
    

  } catch (error) {
    console.error("Registration failed:", error);

    if (error.code === "auth/email-already-in-use") {
      alert("❌ This username already exists.");
    } else {
      alert("❌ Registration failed: " + error.message);
    }
  }
};

// ======================================================
// AUTHENTICATION STATE
// ======================================================

const loginScreen = document.getElementById("loginScreen");

// Show login screen when page first loads
if (loginScreen) {
  loginScreen.style.display = "flex";
}

// Firebase checks whether the user is logged in
onAuthStateChanged(auth, (user) => {

  if (user) {

    // User is logged in
    console.log("✅ User is logged in");
    console.log("Firebase UID:", user.uid);

    if (loginScreen) {
      loginScreen.style.display = "none";
    }

  } else {

    // User is NOT logged in
    console.log("🔐 No user is logged in");

    if (loginScreen) {
      loginScreen.style.display = "flex";
    }

  }

});


// ======================================================
// LOGOUT
// ======================================================

window.aquaSenseLogout = async function () {

  console.log("🔴 Logout button clicked");

  try {

    await signOut(auth);

    console.log("✅ Firebase logout successful");

    // Clear login fields
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    if (username) {
      username.value = "";
    }

    if (password) {
      password.value = "";
    }

    // onAuthStateChanged() will automatically
    // show the login screen.

  } catch (error) {

    console.error("❌ Logout error:", error);

    alert("Logout failed: " + error.message);

  }

};

//signInAnonymously(auth)
//  .then((userCredential) => {
//    console.log("✅ AquaSense anonymous authentication successful");
//    console.log("Anonymous User UID:", userCredential.user.uid);
//  })
//  .catch((error) => {
//    console.error("❌ Anonymous authentication failed");
//    console.error("Error code:", error.code);
//    console.error("Error message:", error.message);
//  });

console.log("AquaSense Firebase connected successfully!");


// ======================================================
// AUTOMATIC REAL-TIME ALERT THRESHOLDS
// ======================================================

let alertThresholds = {
  maxTemperature: 30,
  minTds: 300,
  maxTds: 500,
  maxTurbidity: 50
};


// ======================================================
// GET THRESHOLDS FROM FIRESTORE
// ======================================================

onSnapshot(
  doc(db, "settings", "thresholds"),
  (snapshot) => {

    if (!snapshot.exists()) {
      console.log(
        "Threshold document not found. Using default values."
      );
      return;
    }

    const data = snapshot.data();

    alertThresholds = {
      maxTemperature: Number(data.maxTemperature ?? 30),
      minTds: Number(data.minTds ?? 300),
      maxTds: Number(data.maxTds ?? 500),
      maxTurbidity: Number(data.maxTurbidity ?? 50)
    };

    console.log(
      "Alert thresholds updated:",
      alertThresholds
    );
  },

  (error) => {
    console.error(
      "Threshold listener error:",
      error
    );
  }
);


// ======================================================
// UPDATE REAL-TIME ALERTS
// ======================================================

async function updateRealtimeAlerts(
  temperature,
  tds,
  turbidity
) {

  // ----------------------------------------------------
  // VALIDATE SENSOR VALUES
  // ----------------------------------------------------

  if (
    !Number.isFinite(temperature) ||
    !Number.isFinite(tds) ||
    !Number.isFinite(turbidity)
  ) {

    console.warn(
      "Invalid sensor values. Alerts were not updated.",
      {
        temperature,
        tds,
        turbidity
      }
    );

    return;
  }


  let temperatureStatus;
  let temperatureMessage;

  let tdsStatus;
  let tdsMessage;

  let turbidityStatus;
  let turbidityMessage;


  // ====================================================
  // TEMPERATURE ALERT
  // ====================================================

  if (
    temperature >
    alertThresholds.maxTemperature
  ) {

    temperatureStatus = "Warning";

    temperatureMessage =
      "Temperature is high";

  } else {

    temperatureStatus = "Normal";

    temperatureMessage =
      "Temperature is normal";
  }


  // ====================================================
  // TDS ALERT
  // ====================================================

  if (
    tds <
    alertThresholds.minTds
  ) {

    tdsStatus = "Warning";

    tdsMessage =
      "TDS level is low";

  } else if (
    tds >
    alertThresholds.maxTds
  ) {

    tdsStatus = "Warning";

    tdsMessage =
      "TDS level is high";

  } else {

    tdsStatus = "Normal";

    tdsMessage =
      "TDS is normal";
  }


  // ====================================================
  // TURBIDITY ALERT
  // ====================================================

  if (
    turbidity >
    alertThresholds.maxTurbidity
  ) {

    turbidityStatus = "Warning";

    turbidityMessage =
      "Water is not clear";

  } else {

    turbidityStatus = "Normal";

    turbidityMessage =
      "Water is clear";
  }


  // ====================================================
  // CURRENT DATE AND TIME
  // ====================================================

  const timestampText =
    new Date().toLocaleString();


  // ====================================================
  // WRITE ALERTS TO REALTIME DATABASE
  // ====================================================

  try {

    await Promise.all([

      set(
        ref(
          rtdb,
          "AquaSmart/Alerts/Temperature"
        ),
        {
          Message: temperatureMessage,
          Status: temperatureStatus,
          Timestamp: timestampText
        }
      ),

      set(
        ref(
          rtdb,
          "AquaSmart/Alerts/TDS"
        ),
        {
          Message: tdsMessage,
          Status: tdsStatus,
          Timestamp: timestampText
        }
      ),

      set(
        ref(
          rtdb,
          "AquaSmart/Alerts/Turbidity"
        ),
        {
          Message: turbidityMessage,
          Status: turbidityStatus,
          Timestamp: timestampText
        }
      )

    ]);

    console.log(
      "Real-time alerts updated successfully"
    );

  } catch (error) {

    console.error(
      "Alert update error:",
      error
    );
  }
}


// ======================================================
// PAGE NAVIGATION
// ======================================================

const navItems =
  document.querySelectorAll(
    ".nav-item[data-page]"
  );

const pages =
  document.querySelectorAll(
    ".page"
  );

const pageTitle =
  document.getElementById(
    "pageTitle"
  );


navItems.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const pageName =
        button.dataset.page;


      navItems.forEach(item => {
        item.classList.remove("active");
      });


      button.classList.add("active");


      pages.forEach(page => {
        page.classList.remove("active-page");
      });


      const selectedPage =
        document.getElementById(
          pageName
        );


      if (selectedPage) {

        selectedPage.classList.add(
          "active-page"
        );
      }


      if (pageTitle) {

        const title =
          button.querySelector(
            "span"
          )?.textContent;


        if (title) {
          pageTitle.textContent = title;
        }
      }

    }
  );

});


// ======================================================
// CLOCK
// ======================================================

function updateClock() {

  const clock =
    document.getElementById(
      "clock"
    );

  if (!clock) return;

  const now =
    new Date();

  clock.textContent =
    now.toLocaleTimeString();
}


setInterval(
  updateClock,
  1000
);

updateClock();


// ======================================================
// DEVICE STATUS
// ======================================================

function updateDeviceStatus(
  device,
  state
) {

  const isOn =
    Number(state) === 1;

  const text =
    isOn ? "ON" : "OFF";


  // ----------------------------------------------------
  // PUMP
  // ----------------------------------------------------

  if (device === "pump") {

    const status =
      document.getElementById(
        "pumpStatus"
      );

    const controlText =
      document.getElementById(
        "pumpText"
      );


    if (status) {
      status.textContent = text;
    }

    if (controlText) {
      controlText.textContent = text;
    }
  }


  // ----------------------------------------------------
  // LIGHT
  // ----------------------------------------------------

  if (device === "light") {

    const status =
      document.getElementById(
        "lightStatus"
      );

    const controlText =
      document.getElementById(
        "lightText"
      );


    if (status) {
      status.textContent = text;
    }

    if (controlText) {
      controlText.textContent = text;
    }
  }


  // ----------------------------------------------------
  // COOLER
  // ----------------------------------------------------

  if (device === "cooler") {

    const controlText =
      document.getElementById(
        "coolerText"
      );


    if (controlText) {
      controlText.textContent = text;
    }
  }
}


// ======================================================
// PUMP CONTROL
// ======================================================

const pumpOnButton =
  document.getElementById(
    "pumpOn"
  );

const pumpOffButton =
  document.getElementById(
    "pumpOff"
  );


async function setPumpState(state) {

  try {

    const pumpRef =
      ref(
        rtdb,
        "AquaSmart/ActuatorStatus/Pump"
      );

    const command =
      state ? "1" : "0";


    await set(
      pumpRef,
      command
    );


    updateDeviceStatus(
      "pump",
      command
    );


    console.log(
      "Pump command sent:",
      command
    );

  } catch (error) {

    console.error(
      "Pump update error:",
      error
    );

    alert(
      "Unable to update pump."
    );
  }
}


if (pumpOnButton) {

  pumpOnButton.addEventListener(
    "click",
    () => setPumpState(true)
  );
}


if (pumpOffButton) {

  pumpOffButton.addEventListener(
    "click",
    () => setPumpState(false)
  );
}


// ======================================================
// LIGHT CONTROL
// ======================================================

const lightOnButton =
  document.getElementById(
    "lightOn"
  );

const lightOffButton =
  document.getElementById(
    "lightOff"
  );


async function setLightState(state) {

  try {

    const lightRef =
      ref(
        rtdb,
        "AquaSmart/ActuatorStatus/Light"
      );

    const command =
      state ? "1" : "0";


    await set(
      lightRef,
      command
    );


    updateDeviceStatus(
      "light",
      command
    );


    console.log(
      "Light command sent:",
      command
    );

  } catch (error) {

    console.error(
      "Light update error:",
      error
    );

    alert(
      "Unable to update light."
    );
  }
}


if (lightOnButton) {

  lightOnButton.addEventListener(
    "click",
    () => setLightState(true)
  );
}


if (lightOffButton) {

  lightOffButton.addEventListener(
    "click",
    () => setLightState(false)
  );
}


// ======================================================
// COOLER CONTROL
// ======================================================

const coolerOnButton =
  document.getElementById(
    "coolerOn"
  );

const coolerOffButton =
  document.getElementById(
    "coolerOff"
  );


async function setCoolerState(state) {

  try {

    const coolerRef =
      ref(
        rtdb,
        "AquaSmart/ActuatorStatus/Cooler"
      );

    const command =
      state ? "1" : "0";


    await set(
      coolerRef,
      command
    );


    updateDeviceStatus(
      "cooler",
      command
    );


    console.log(
      "Cooler command sent:",
      command
    );

  } catch (error) {

    console.error(
      "Cooler update error:",
      error
    );

    alert(
      "Unable to update cooler."
    );
  }
}


if (coolerOnButton) {

  coolerOnButton.addEventListener(
    "click",
    () => setCoolerState(true)
  );
}


if (coolerOffButton) {

  coolerOffButton.addEventListener(
    "click",
    () => setCoolerState(false)
  );
}


// ======================================================
// FEED FISH
// RTDB COMMAND + FIRESTORE HISTORY
// ======================================================

const feedButton =
  document.getElementById(
    "feedBtn"
  );


if (feedButton) {

  feedButton.addEventListener(
    "click",
    async () => {

      try {

        // ------------------------------------------------
        // SEND FEEDER COMMAND
        // ------------------------------------------------

        const feederRef =
          ref(
            rtdb,
            "AquaSmart/ActuatorStatus/Feeder"
          );


        await set(
          feederRef,
          "1"
        );


        console.log(
          "Feeder command sent: 1"
        );


        // ------------------------------------------------
        // SAVE FEEDING HISTORY
        // ------------------------------------------------

        await addDoc(
          collection(
            db,
            "feedingEvents"
          ),
          {
            fed: "1",
            timestamp:
              serverTimestamp()
          }
        );


        // ------------------------------------------------
        // UPDATE LAST FED
        // ------------------------------------------------

        const lastFed =
          document.getElementById(
            "lastFed"
          );


        if (lastFed) {

          lastFed.textContent =
            new Date()
              .toLocaleString();
        }


        // ------------------------------------------------
        // UPDATE FEEDER STATUS
        // ------------------------------------------------

        const feederStatus =
          document.getElementById(
            "feederStatus"
          );


        if (feederStatus) {

          feederStatus.textContent =
            "Feeding";
        }


        alert(
          "Fish feeding command sent!"
        );


        console.log(
          "Feeding event recorded"
        );

      } catch (error) {

        console.error(
          "Feeding error:",
          error
        );

        alert(
          "Unable to send feeding command."
        );
      }

    }
  );
}


// ======================================================
// STOP FEEDING
// ======================================================

const stopFeedButton =
  document.getElementById(
    "stopFeedBtn"
  );


if (stopFeedButton) {

  stopFeedButton.addEventListener(
    "click",
    async () => {

      try {

        const feederRef =
          ref(
            rtdb,
            "AquaSmart/ActuatorStatus/Feeder"
          );


        await set(
          feederRef,
          "0"
        );


        console.log(
          "Feeder command sent: 0"
        );


        const feederStatus =
          document.getElementById(
            "feederStatus"
          );


        if (feederStatus) {

          feederStatus.textContent =
            "Ready";
        }


        alert(
          "Feeding stopped!"
        );

      } catch (error) {

        console.error(
          "Stop feeding error:",
          error
        );

        alert(
          "Unable to stop feeding."
        );
      }

    }
  );
}


// ======================================================
// DISPLAY HISTORY
// ======================================================

function renderHistory(rows) {

  const historyBody =
    document.getElementById(
      "historyBody"
    );


  if (!historyBody) return;


  historyBody.innerHTML = "";


  rows.forEach(row => {

    const tr =
      document.createElement(
        "tr"
      );


    tr.innerHTML = `
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${row[3]}</td>
    `;


    historyBody.appendChild(
      tr
    );

  });
}


// ======================================================
// REAL-TIME HISTORY + CHARTS
// ======================================================

const historyQuery =
  query(
    collection(
      db,
      "sensorReadings"
    ),
    orderBy(
      "timestamp",
      "desc"
    ),
    limit(20)
  );


let temperatureChart = null;
let tdsChart = null;
let turbidityChart = null;


// ======================================================
// FIRESTORE HISTORY LISTENER
// ======================================================

onSnapshot(

  historyQuery,

  (snapshot) => {

    console.log(
      "Firestore history data received"
    );


    const historyRows = [];

    const labels = [];

    const temperatureData = [];

    const tdsData = [];

    const turbidityData = [];


    // ----------------------------------------------------
    // READ DOCUMENTS
    // ----------------------------------------------------

    snapshot.docs
      .reverse()
      .forEach(document => {

        const data =
          document.data();


        // ------------------------------------------------
        // TIMESTAMP
        // ------------------------------------------------

        let timeText = "--";


        if (
          data.timestamp?.toDate
        ) {

          timeText =
            data.timestamp
              .toDate()
              .toLocaleTimeString();
        }


        // ------------------------------------------------
        // SENSOR VALUES
        // IMPORTANT:
        // TDS supports BOTH "TDS" and "tds"
        // ------------------------------------------------

        const temperature =
          Number(
            data.temperature ??
            data.Temperature ??
            0
          );


        const tds =
          Number(
            data.TDS ??
            data.tds ??
            0
          );


        const turbidity =
          Number(
            data.turbidity ??
            data.Turbidity ??
            0
          );


        // ------------------------------------------------
        // HISTORY TABLE
        // ------------------------------------------------

        historyRows.push([
          timeText,
          Number.isFinite(temperature)
            ? temperature.toFixed(1)
            : "--",

          Number.isFinite(tds)
            ? Math.round(tds)
            : "--",

          Number.isFinite(turbidity)
            ? Math.round(turbidity)
            : "--"
        ]);


        // ------------------------------------------------
        // CHART DATA
        // ------------------------------------------------

        labels.push(
          timeText
        );


        temperatureData.push(
          temperature
        );


        tdsData.push(
          tds
        );


        turbidityData.push(
          turbidity
        );

      });


    // ----------------------------------------------------
    // UPDATE HISTORY TABLE
    // ----------------------------------------------------

    renderHistory(
      historyRows
    );


    // ====================================================
    // TEMPERATURE CHART
    // ====================================================

    const temperatureChartElement =
      document.getElementById(
        "tempChart"
      );


    if (
      temperatureChartElement &&
      typeof Chart !== "undefined"
    ) {

      if (temperatureChart) {
        temperatureChart.destroy();
      }


      temperatureChart =
        new Chart(
          temperatureChartElement,
          {
            type: "line",

            data: {

              labels: labels,

              datasets: [
                {
                  label:
                    "Temperature (°C)",

                  data:
                    temperatureData,

                  tension:
                    0.3,

                  fill: false
                }
              ]
            },

            options: {
              responsive: true,
              maintainAspectRatio: false,

              scales: {
                y: {
                  beginAtZero: false
                }
              }
            }
          }
        );

    } else if (
      temperatureChartElement &&
      typeof Chart === "undefined"
    ) {

      console.warn(
        "Chart.js is not available. Temperature chart skipped."
      );
    }


    // ====================================================
    // TDS CHART
    // ====================================================

    const tdsChartElement =
      document.getElementById(
        "tdsChart"
      );


    if (
      tdsChartElement &&
      typeof Chart !== "undefined"
    ) {

      if (tdsChart) {
        tdsChart.destroy();
      }


      tdsChart =
        new Chart(
          tdsChartElement,
          {
            type: "line",

            data: {

              labels: labels,

              datasets: [
                {
                  label:
                    "TDS (ppm)",

                  data:
                    tdsData,

                  tension:
                    0.3,

                  fill: false
                }
              ]
            },

            options: {
              responsive: true,
              maintainAspectRatio: false,

              scales: {
                y: {
                  beginAtZero: false
                }
              }
            }
          }
        );

    } else if (
      tdsChartElement &&
      typeof Chart === "undefined"
    ) {

      console.warn(
        "Chart.js is not available. TDS chart skipped."
      );
    }


    // ====================================================
    // TURBIDITY CHART
    // ====================================================

    const turbidityChartElement =
      document.getElementById(
        "turbidityChart"
      );


    if (
      turbidityChartElement &&
      typeof Chart !== "undefined"
    ) {

      if (turbidityChart) {
        turbidityChart.destroy();
      }


      turbidityChart =
        new Chart(
          turbidityChartElement,
          {
            type: "line",

            data: {

              labels: labels,

              datasets: [
                {
                  label:
                    "Turbidity (NTU)",

                  data:
                    turbidityData,

                  tension:
                    0.3,

                  fill: false
                }
              ]
            },

            options: {
              responsive: true,
              maintainAspectRatio: false,

              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          }
        );

    } else if (
      turbidityChartElement &&
      typeof Chart === "undefined"
    ) {

      console.warn(
        "Chart.js is not available. Turbidity chart skipped."
      );
    }


    console.log(
      "History and charts updated successfully"
    );

  },

  (error) => {

    console.error(
      "Firestore history listener error:",
      error
    );

  }

);


// ======================================================
// PREDICTION CHART
// ======================================================

const predictionChartElement =
  document.getElementById(
    "predictionChart"
  );


if (
  predictionChartElement &&
  typeof Chart !== "undefined"
) {

  new Chart(
    predictionChartElement,
    {

      type: "line",

      data: {

        labels: [
          "Now",
          "+6 Hours",
          "+12 Hours",
          "+18 Hours",
          "+24 Hours"
        ],

        datasets: [

          {
            label:
              "Predicted TDS (ppm)",

            data: [
              350,
              352,
              355,
              358,
              360
            ],

            tension: 0.3,

            fill: false
          }

        ]

      },

      options: {
        responsive: true
      }

    }
  );

} else if (
  predictionChartElement &&
  typeof Chart === "undefined"
) {

  console.warn(
    "Chart.js is not available. Prediction chart skipped."
  );
}


// ======================================================
// WATER QUALITY PARAMETER SCORE
// ======================================================

function calculateParameterScore(
  value,
  idealMin,
  idealMax,
  criticalMin,
  criticalMax
) {

  if (!Number.isFinite(value)) {
    return 0;
  }


  // ----------------------------------------------------
  // IDEAL RANGE
  // ----------------------------------------------------

  if (
    value >= idealMin &&
    value <= idealMax
  ) {

    return 100;
  }


  // ----------------------------------------------------
  // BELOW IDEAL
  // ----------------------------------------------------

  if (
    value < idealMin
  ) {

    const denominator =
      idealMin - criticalMin;


    if (denominator === 0) {
      return 0;
    }


    const score =
      (
        (value - criticalMin) /
        denominator
      ) * 100;


    return Math.max(
      0,
      Math.min(
        100,
        score
      )
    );
  }


  // ----------------------------------------------------
  // ABOVE IDEAL
  // ----------------------------------------------------

  const denominator =
    criticalMax - idealMax;


  if (denominator === 0) {
    return 0;
  }


  const score =
    (
      (criticalMax - value) /
      denominator
    ) * 100;


  return Math.max(
    0,
    Math.min(
      100,
      score
    )
  );
}


// ======================================================
// OVERALL WATER QUALITY SCORE
// ======================================================

function calculateWaterQualityScore(
  temperature,
  tds,
  turbidity
) {

  const temperatureScore =
    calculateParameterScore(
      temperature,
      24,
      28,
      20,
      32
    );


  const tdsScore =
    calculateParameterScore(
      tds,
      150,
      400,
      50,
      600
    );


  const turbidityScore =
    calculateParameterScore(
      turbidity,
      0,
      10,
      0,
      50
    );


  const finalScore =
    (
      temperatureScore * 0.30 +
      tdsScore * 0.35 +
      turbidityScore * 0.35
    );


  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        finalScore
      )
    )
  );
}


// ======================================================
// REAL-TIME SENSOR DATA FROM FIRESTORE
// ======================================================

const sensorQuery =
  query(
    collection(
      db,
      "sensorReadings"
    ),
    orderBy(
      "timestamp",
      "desc"
    ),
    limit(1)
  );


onSnapshot(

  sensorQuery,

  (snapshot) => {

    console.log(
      "Firebase sensor data received"
    );


    // ----------------------------------------------------
    // CHECK DATA
    // ----------------------------------------------------

    if (snapshot.empty) {

      console.log(
        "No sensor data found in Firestore."
      );

      return;
    }


    const data =
      snapshot.docs[0].data();


    console.log(
      "Latest sensor data:",
      data
    );


    // ====================================================
    // DEBUG SENSOR VALUES
    // ====================================================

    console.log(
      "Temperature:",
      data.temperature ??
      data.Temperature
    );


    console.log(
      "TDS:",
      data.TDS ??
      data.tds
    );


    console.log(
      "Turbidity:",
      data.turbidity ??
      data.Turbidity
    );


    console.log(
      "Water Level:",
      data.waterLevel ??
      data.WaterLevel
    );


    // ====================================================
    // CONVERT VALUES
    // IMPORTANT:
    // TDS supports BOTH "TDS" and "tds"
    // ====================================================

    const temperature =
      Number(
        data.temperature ??
        data.Temperature
      );


    const tds =
      Number(
        data.TDS ??
        data.tds
      );


    const turbidity =
      Number(
        data.turbidity ??
        data.Turbidity
      );


    const waterLevel =
      Number(
        data.waterLevel ??
        data.WaterLevel
      );


    // ====================================================
    // TEMPERATURE DISPLAY
    // ====================================================

    const tempValue =
      document.getElementById(
        "tempValue"
      );


    if (
      tempValue &&
      Number.isFinite(temperature)
    ) {

      tempValue.textContent =
        temperature.toFixed(1);
    }


    // ====================================================
    // TDS DISPLAY
    // ====================================================

    const tdsValue =
      document.getElementById(
        "tdsValue"
      );


    if (
      tdsValue &&
      Number.isFinite(tds)
    ) {

      tdsValue.textContent =
        Math.round(tds);
    }


    // ====================================================
    // TURBIDITY DISPLAY
    // ====================================================

    const turbidityValue =
      document.getElementById(
        "turbidityValue"
      );


    if (
      turbidityValue &&
      Number.isFinite(turbidity)
    ) {

      turbidityValue.textContent =
        Math.round(turbidity);
    }


    // ====================================================
    // WATER LEVEL DISPLAY
    // ====================================================

    const waterLevelValue =
      document.getElementById(
        "waterLevelValue"
      );


    if (
      waterLevelValue &&
      Number.isFinite(waterLevel)
    ) {

      waterLevelValue.textContent =
        Math.round(waterLevel);
    }


    // ====================================================
    // VALIDATE REQUIRED VALUES
    // ====================================================

    if (
      !Number.isFinite(temperature) ||
      !Number.isFinite(tds) ||
      !Number.isFinite(turbidity)
    ) {

      console.warn(
        "Invalid temperature/TDS/turbidity data:",
        data
      );

      return;
    }


    // ====================================================
    // UPDATE REAL-TIME ALERTS
    // ====================================================

    updateRealtimeAlerts(
      temperature,
      tds,
      turbidity
    );


    // ====================================================
    // CALCULATE WATER QUALITY SCORE
    // ====================================================

    const waterQualityScore =
      calculateWaterQualityScore(
        temperature,
        tds,
        turbidity
      );


    console.log(
      "Real-time Water Quality Score:",
      waterQualityScore
    );


    // ====================================================
    // DISPLAY SCORE
    // ====================================================

    const scoreValue =
      document.getElementById(
        "scoreValue"
      );


    if (scoreValue) {

      scoreValue.textContent =
        waterQualityScore;
    }


    // ====================================================
    // DISPLAY SCORE STATUS
    // ====================================================

    const scoreLabel =
      document.getElementById(
        "scoreLabel"
      );


    if (scoreLabel) {

      if (
        waterQualityScore >= 80
      ) {

        scoreLabel.textContent =
          "Good";

      } else if (
        waterQualityScore >= 60
      ) {

        scoreLabel.textContent =
          "Moderate";

      } else {

        scoreLabel.textContent =
          "Poor";
      }
    }


    // ====================================================
    // LAST UPDATED
    // ====================================================

    const lastUpdated =
      document.getElementById(
        "lastUpdated"
      );


    if (lastUpdated) {

      if (
        data.timestamp?.toDate
      ) {

        lastUpdated.textContent =
          data.timestamp
            .toDate()
            .toLocaleTimeString();

      } else {

        lastUpdated.textContent =
          new Date()
            .toLocaleTimeString();
      }
    }


    // ====================================================
    // SYSTEM MESSAGE
    // ====================================================

    const systemMessage =
      document.getElementById(
        "systemMessage"
      );


    if (systemMessage) {

      systemMessage.textContent =
        "● All sensor data updated successfully";
    }

  },

  (error) => {

    console.error(
      "Firebase sensor listener error:",
      error
    );


    const systemMessage =
      document.getElementById(
        "systemMessage"
      );


    if (systemMessage) {

      systemMessage.textContent =
        "● Firebase sensor connection error";
    }

  }

);


// ======================================================
// RTDB - PUMP STATUS
// ======================================================

const pumpStatusRef =
  ref(
    rtdb,
    "AquaSmart/ActuatorStatus/Pump"
  );


onValue(

  pumpStatusRef,

  (snapshot) => {

    const value =
      snapshot.val();


    console.log(
      "RTDB Pump:",
      value
    );


    updateDeviceStatus(
      "pump",
      value
    );

  },

  (error) => {

    console.error(
      "Pump RTDB listener error:",
      error
    );

  }

);


// ======================================================
// RTDB - LIGHT STATUS
// ======================================================

const lightStatusRef =
  ref(
    rtdb,
    "AquaSmart/ActuatorStatus/Light"
  );


onValue(

  lightStatusRef,

  (snapshot) => {

    const value =
      snapshot.val();


    console.log(
      "RTDB Light:",
      value
    );


    updateDeviceStatus(
      "light",
      value
    );

  },

  (error) => {

    console.error(
      "Light RTDB listener error:",
      error
    );

  }

);


// ======================================================
// RTDB - COOLER STATUS
// ======================================================

const coolerStatusRef =
  ref(
    rtdb,
    "AquaSmart/ActuatorStatus/Cooler"
  );


onValue(

  coolerStatusRef,

  (snapshot) => {

    const value =
      snapshot.val();


    console.log(
      "RTDB Cooler:",
      value
    );


    updateDeviceStatus(
      "cooler",
      value
    );

  },

  (error) => {

    console.error(
      "Cooler RTDB listener error:",
      error
    );

  }

);


// ======================================================
// RTDB - FEEDER STATUS
// ======================================================

const feederStatusRef =
  ref(
    rtdb,
    "AquaSmart/ActuatorStatus/Feeder"
  );


onValue(

  feederStatusRef,

  (snapshot) => {

    const value =
      snapshot.val();


    console.log(
      "RTDB Feeder:",
      value
    );


    const feederStatus =
      document.getElementById(
        "feederStatus"
      );


    if (feederStatus) {

      if (
        Number(value) === 1
      ) {

        feederStatus.textContent =
          "Feeding";

      } else {

        feederStatus.textContent =
          "Ready";
      }
    }

  },

  (error) => {

    console.error(
      "Feeder RTDB listener error:",
      error
    );

  }

);


// ======================================================
// THRESHOLD SETTINGS
// ======================================================

const saveThresholds =
  document.getElementById(
    "saveThresholds"
  );


if (saveThresholds) {

  saveThresholds.addEventListener(
    "click",
    async () => {

      const maxTemperature =
        Number(
          document.getElementById(
            "maxTemperature"
          )?.value
        );


      const minTds =
        Number(
          document.getElementById(
            "minTds"
          )?.value
        );


      const maxTds =
        Number(
          document.getElementById(
            "maxTds"
          )?.value
        );


      const maxTurbidity =
        Number(
          document.getElementById(
            "maxTurbidity"
          )?.value
        );


      // ------------------------------------------------
      // VALIDATE VALUES
      // ------------------------------------------------

      if (
        !Number.isFinite(maxTemperature) ||
        !Number.isFinite(minTds) ||
        !Number.isFinite(maxTds) ||
        !Number.isFinite(maxTurbidity)
      ) {

        alert(
          "Please enter valid threshold values."
        );

        return;
      }


      if (
        minTds >= maxTds
      ) {

        alert(
          "Minimum TDS must be lower than Maximum TDS."
        );

        return;
      }


      try {

        await setDoc(

          doc(
            db,
            "settings",
            "thresholds"
          ),

          {
            maxTemperature:
              maxTemperature,

            minTds:
              minTds,

            maxTds:
              maxTds,

            maxTurbidity:
              maxTurbidity,

            updatedAt:
              serverTimestamp()
          }

        );


        alert(
          "Threshold settings saved!"
        );


        console.log(
          "Thresholds saved successfully"
        );

      } catch (error) {

        console.error(
          "Threshold save error:",
          error
        );


        alert(
          "Unable to save threshold settings."
        );
      }

    }
  );
}


// ======================================================
// COOLER SCHEDULE
// ======================================================

const editCoolerSchedule =
  document.getElementById(
    "editCoolerSchedule"
  );


if (editCoolerSchedule) {

  editCoolerSchedule.addEventListener(
    "click",
    async () => {

      const startTime =
        prompt(
          "Enter cooler start time (example: 12:00 PM):",
          "12:00 PM"
        );


      if (!startTime) {
        return;
      }


      const durationInput =
        prompt(
          "Enter cooler duration in hours:",
          "4"
        );


      if (!durationInput) {
        return;
      }


      const duration =
        Number(
          durationInput
        );


      // ------------------------------------------------
      // VALIDATE DURATION
      // ------------------------------------------------

      if (
        !Number.isFinite(duration) ||
        duration <= 0
      ) {

        alert(
          "Please enter a valid duration."
        );

        return;
      }


      try {

        await setDoc(

          doc(
            db,
            "schedules",
            "cooler"
          ),

          {
            enabled:
              true,

            startTime:
              startTime,

            duration:
              duration,

            updatedAt:
              serverTimestamp()
          }

        );


        alert(
          "Cooler schedule saved successfully!"
        );


        console.log(
          "Cooler schedule saved:",
          startTime,
          duration
        );

      } catch (error) {

        console.error(
          "Cooler schedule error:",
          error
        );


        alert(
          "Unable to save cooler schedule."
        );
      }

    }
  );
}



window.aquaSenseLogout = async function () {
  console.log("🔴 Logout button clicked");

  try {
    await signOut(auth);

    console.log("✅ Firebase logout successful");

    const loginScreen = document.getElementById("loginScreen");

    if (loginScreen) {
      loginScreen.style.display = "flex";
    }

    // Clear username and password
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    if (username) username.value = "";
    if (password) password.value = "";

  } catch (error) {
    console.error("❌ Logout error:", error);
    alert("Logout failed: " + error.message);
  }
};