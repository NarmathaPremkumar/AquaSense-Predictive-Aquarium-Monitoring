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
  onValue,
  push
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

  loadThresholdSettings();
  const rtdb = getDatabase(app);


  // ======================================================
  // REAL-TIME SENSOR DATA FROM FIREBASE RTDB
  // ======================================================
  // Source:
  // Realtime Database → AquaSmart/SensorData
  //
  // Dashboard Temperature, TDS, Turbidity
  // and Water Quality Score come from RTDB.
  // ======================================================

  const sensorDataRef = ref(
    rtdb,
    "AquaSmart/SensorData"
  );

  onValue(
    sensorDataRef,
    async (snapshot) => {

      const data = snapshot.val();

      // --------------------------------------------------
      // CHECK DATA
      // --------------------------------------------------

      if (!data) {

        console.log(
          "❌ No sensor data found in RTDB."
        );

        return;
      }


      // --------------------------------------------------
      // READ SENSOR VALUES FROM RTDB
      // --------------------------------------------------

      const temperature =
        Number(data.Temperature);

      const tds =
        Number(data.TDS);

      const turbidity =
        Number(data.Turbidity);

      const waterLevel =
        Number(data.waterLevel);


      console.log(
        "================================"
      );

      console.log(
        "REAL-TIME RTDB SENSOR DATA"
      );

      console.log(
        "Temperature:",
        temperature
      );

      console.log(
        "TDS:",
        tds
      );

      console.log(
        "Turbidity:",
        turbidity
      );


      // ==================================================
      // DISPLAY TEMPERATURE
      // ==================================================

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


      // ==================================================
      // DISPLAY TDS
      // ==================================================

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


      // ==================================================
      // DISPLAY TURBIDITY
      // ==================================================

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


// ==================================================
// DISPLAY WATER LEVEL
// ==================================================

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


      // ==================================================
      // VALIDATE SENSOR VALUES
      // ==================================================

      if (
        !Number.isFinite(temperature) ||
        !Number.isFinite(tds) ||
        !Number.isFinite(turbidity)
      ) {

        console.warn(
          "Invalid RTDB sensor values:",
          data
        );

        return;
      }


      // ======================================================
// SAVE SENSOR READING TO RTDB HISTORY
// ======================================================

const historyRef =
  push(
    ref(
      rtdb,
      "AquaSmart/SensorHistory"
    )
  );

await set(
  historyRef,
  {
    Temperature: temperature,
    TDS: tds,
    Turbidity: turbidity,

    Timestamp:
      Date.now()
  }
);

console.log(
  "📊 Sensor reading saved to history"
);

// ==================================================
// UPDATE REAL-TIME ALERTS
// ==================================================

await updateRealtimeAlerts(
  temperature,
  tds,
  turbidity
);

     // ==================================================
// CALCULATE WATER QUALITY SCORE
// ==================================================

const waterQualityScore =
  calculateWaterQualityScore(
    tds,
    turbidity
  );

const riskLevel =
  getRiskLevel(
    waterQualityScore
  );

console.log(
  "💧 Water Quality Score:",
  waterQualityScore
);

console.log(
  "⚠️ Risk Level:",
  riskLevel
);


// ==================================================
// DISPLAY RISK LEVEL
// ==================================================

const riskElement =
  document.getElementById(
    "riskValue"
  );

if (riskElement) {

  riskElement.textContent =
    riskLevel;
}

      // ==================================================
      // DISPLAY WATER QUALITY SCORE
      // ==================================================

      const scoreValue =
        document.getElementById(
          "scoreValue"
        );

      if (scoreValue) {

        scoreValue.textContent =
          waterQualityScore;
      }


      // ==================================================
      // DISPLAY SCORE STATUS
      // ==================================================

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

          scoreLabel.className =
            "good";

        } else if (
          waterQualityScore >= 60
        ) {

          scoreLabel.textContent =
            "Moderate";

          scoreLabel.className =
            "warning";

        } else {

          scoreLabel.textContent =
            "Poor";

          scoreLabel.className =
            "danger";
        }
      }


      // ==================================================
      // LAST UPDATED
      // ==================================================

      const lastUpdated =
        document.getElementById(
          "lastUpdated"
        );

      if (lastUpdated) {

        lastUpdated.textContent =
          new Date()
            .toLocaleTimeString();
      }


      // ==================================================
      // SYSTEM MESSAGE
      // ==================================================

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
        "RTDB sensor listener error:",
        error
      );

    }
  );
  const auth = getAuth(app);

  // ======================================================
// DISPLAY LOGGED-IN USER PROFILE
// ======================================================

function displayLoggedInUserProfile() {

  const user = auth.currentUser;

  const profileName =
    document.getElementById("profileUserName");

  const profileEmail =
    document.getElementById("profileUserEmail");

  if (!profileName || !profileEmail) {
    return;
  }

  if (user) {

    // Firebase login email
    const email = user.email || "";

    // Convert email back to username
    // Example:
    // narmatha@aquasense.local
    // becomes:
    // narmatha
    let username = email
      .split("@")[0];

    // Make first letter capital
    username =
      username.charAt(0).toUpperCase() +
      username.slice(1);

    profileName.textContent =
      username;

    profileEmail.textContent =
      email;

  } else {

    profileName.textContent =
      "User";

    profileEmail.textContent =
      "---";
  }
}

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

      // --------------------------------------------------
      // REQUEST NOTIFICATION PERMISSION
      // --------------------------------------------------

      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {

        console.log(
          "❌ Notification permission was not granted."
        );

        alert(
          "❌ Notification permission was not granted."
        );

        return;
      }

      console.log(
        "✅ Notification permission granted!"
      );


      // --------------------------------------------------
      // REGISTER FIREBASE MESSAGING SERVICE WORKER
      // --------------------------------------------------
  const registration = await navigator.serviceWorker.register(
    "./firebase-messaging-sw.js"
  );

  console.log(
  "📱 MOBILE SERVICE WORKER:",
  registration
);

console.log(
  "📱 SERVICE WORKER STATE:",
  registration?.active?.state
);


      console.log(
        "✅ Firebase messaging service worker registered."
      );

      console.log(
        "Service Worker scope:",
        registration.scope
      );


      // --------------------------------------------------
      // GET FCM TOKEN
      // --------------------------------------------------

      const token =
        await getToken(messaging, {

          vapidKey:
            "BKV2gqreCTzUCv5Hk2sfHnT6OXb54fFiyi3QGQOBw9UOUEoEZe-uFGIzIaIUc36uvxY5ED2CjWQn2RHk2Keyk8Y",

          serviceWorkerRegistration:
            registration

        });


      // --------------------------------------------------
      // CHECK TOKEN
      // --------------------------------------------------

      if (token) {

        console.log(
          "✅ FCM registration token:"
        );

        console.log(token);


        // ------------------------------------------------
        // CHECK LOGIN
        // ------------------------------------------------

        if (!auth.currentUser) {

          console.log(
            "⚠️ User is not logged in."
          );

          alert(
            "⚠️ Please login first, then enable notifications."
          );

          return;
        }


        // ------------------------------------------------
        // SAVE FCM TOKEN TO FIRESTORE
        // ------------------------------------------------

        await setDoc(

          doc(
            db,
            "fcmTokens",
            auth.currentUser.uid
          ),

          {

            token: token,

            userId:
              auth.currentUser.uid,

            updatedAt:
              serverTimestamp()

          },

          {
            merge: true
          }

        );


        console.log(
          "✅ FCM token saved to Firestore."
        );


        // ------------------------------------------------
        // SUCCESS MESSAGE
        // ------------------------------------------------

        alert(
          "✅ AquaSense notifications connected!\n\n" +
          "FCM token has been saved to Firebase."
        );

      } else {

        console.log(
          "⚠️ No FCM token received."
        );

        alert(
          "⚠️ Firebase did not provide an FCM token."
        );

      }

  } catch (error) {
    console.error("❌ Push notification setup failed:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    alert(
      "Push notification failed.\n\n" +
      "Error: " +
      (error?.message || error)
    );
  }

  }

  window.enablePushNotifications =
    enablePushNotifications;

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
      displayLoggedInUserProfile();

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

  // ======================================================
// ALERT THRESHOLD VALUES
// ======================================================

let alertThresholds = {
  maxTemperature: 30,
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

      maxTemperature:
        Number(data.maxTemperature ?? 30),

      maxTds:
        Number(data.maxTDS ?? data.maxTds ?? 500),

      maxTurbidity:
        Number(data.maxTurbidity ?? 50)

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
// REAL-TIME ALERT SYSTEM
// ======================================================

// Store previous alert levels

let previousAlertLevels = {

  TDS: null,

  Turbidity: null,

  Temperature: null

};


// ======================================================
// GET TDS LEVEL
// ======================================================

function getTdsLevel(tds) {

  if (
    tds <= alertThresholds.maxTds
  ) {

    return "MEDIUM";

  }

  return "HIGH";
}


// ======================================================
// GET TURBIDITY LEVEL
// ======================================================

function getTurbidityLevel(turbidity) {

  if (
    turbidity <=
    alertThresholds.maxTurbidity
  ) {

    return "MEDIUM";

  }

  return "HIGH";
}


// ======================================================
// GET TEMPERATURE LEVEL
// ======================================================

function getTemperatureLevel(temperature) {

  if (
    temperature <=
    alertThresholds.maxTemperature
  ) {

    return "NORMAL";

  }

  return "HIGH";
}



// ======================================================
// LOCAL MOBILE ALERT NOTIFICATION
// ======================================================

async function showMobileAlertNotification(
  parameter,
  value,
  message
) {

  try {

    console.log(
      "📱 Starting AquaSense notification..."
    );


    // --------------------------------------------------
    // CHECK NOTIFICATION SUPPORT
    // --------------------------------------------------

    if (!("Notification" in window)) {

      console.error(
        "❌ Notifications are not supported."
      );

      return;
    }


    console.log(
      "📱 Notification permission:",
      Notification.permission
    );


    // --------------------------------------------------
    // CHECK PERMISSION
    // --------------------------------------------------

    if (
      Notification.permission !== "granted"
    ) {

      console.error(
        "❌ Notification permission is:",
        Notification.permission
      );

      return;
    }


    // --------------------------------------------------
    // GET SERVICE WORKER
    // --------------------------------------------------

    const registration =
      await navigator.serviceWorker.getRegistration(
        "./"
      );


    console.log(
      "📱 Service worker registration:",
      registration
    );


    if (!registration) {

      console.error(
        "❌ AquaSense service worker was not found."
      );

      return;
    }


    // --------------------------------------------------
    // CHECK ACTIVE SERVICE WORKER
    // --------------------------------------------------

    if (!registration.active) {

      console.error(
        "❌ Service worker is registered but not active."
      );

      return;
    }


    console.log(
      "✅ Service worker is active."
    );


    // --------------------------------------------------
    // SHOW NOTIFICATION
    // --------------------------------------------------

    await registration.showNotification(
      "🚨 AquaSense Alert",
      {

        body:
          parameter +
          ": " +
          value +
          "\n" +
          message,

        icon:
          "/AquaSense-Predictive-Aquarium-Monitoring/favicon.ico",

        badge:
          "/AquaSense-Predictive-Aquarium-Monitoring/favicon.ico",

        tag:
          "aquasense-" +
          parameter +
          "-" +
          Date.now(),

        renotify: true,

        silent: false,

        requireInteraction: true,

        data: {
          parameter: parameter,
          value: value
        }

      }
    );


    console.log(
      "✅ AquaSense notification sent to service worker."
    );

  }

  catch (error) {

    console.error(
      "❌ AquaSense notification failed:",
      error
    );

  }

}

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
      "Invalid sensor values. Alerts were not updated."
    );

    return;
  }


  // ----------------------------------------------------
  // GET CURRENT LEVELS
  // ----------------------------------------------------

  const tdsLevel =
    getTdsLevel(tds);

  const turbidityLevel =
    getTurbidityLevel(turbidity);

  const temperatureLevel =
    getTemperatureLevel(temperature);


  console.log(
    "🚨 Current Alert Levels:",
    {
      TDS: tdsLevel,
      Turbidity: turbidityLevel,
      Temperature: temperatureLevel
    }
  );

  // ====================================================
// MOBILE NOTIFICATIONS FOR NEW HIGH ALERTS
// ====================================================

// TDS HIGH
if (
  tdsLevel === "HIGH" &&
  previousAlertLevels.TDS !== "HIGH"
) {

  showMobileAlertNotification(
    "TDS",
    tds + " ppm",
    "TDS level is high."
  );

}


// TURBIDITY HIGH
if (
  turbidityLevel === "HIGH" &&
  previousAlertLevels.Turbidity !== "HIGH"
) {

  showMobileAlertNotification(
    "Turbidity",
    turbidity + " NTU",
    "Water is highly turbid."
  );

}


// TEMPERATURE HIGH
if (
  temperatureLevel === "HIGH" &&
  previousAlertLevels.Temperature !== "HIGH"
) {

  showMobileAlertNotification(
    "Temperature",
    temperature + " °C",
    "Temperature is high."
  );

}


  // ----------------------------------------------------
  // CURRENT DATE AND TIME
  // ----------------------------------------------------

  const now = new Date();

  const date =
    now.toLocaleDateString();

  const time =
    now.toLocaleTimeString();

  const year =
    now.getFullYear();


  // ====================================================
  // UPDATE CURRENT ALERT STATUS
  // ====================================================

  try {

    await Promise.all([

      // TEMPERATURE
      set(
        ref(
          rtdb,
          "AquaSmart/Alerts/Temperature"
        ),
        {
          Parameter: "Temperature",
          Value: temperature,
          Level: temperatureLevel,
          Message:
            temperatureLevel === "HIGH"
              ? "Temperature is high"
              : "Temperature is normal",
          Date: date,
          Time: time,
          Year: year,
          Timestamp: now.getTime()
        }
      ),


      // TDS
      set(
        ref(
          rtdb,
          "AquaSmart/Alerts/TDS"
        ),
        {
          Parameter: "TDS",
          Value: tds,
          Level: tdsLevel,
          Message:
            tdsLevel === "HIGH"
              ? "TDS level is high"
              : tdsLevel === "MEDIUM"
                ? "TDS level is in medium range"
                : "TDS level is low",
          Date: date,
          Time: time,
          Year: year,
          Timestamp: now.getTime()
        }
      ),


      // TURBIDITY
      set(
        ref(
          rtdb,
          "AquaSmart/Alerts/Turbidity"
        ),
        {
          Parameter: "Turbidity",
          Value: turbidity,
          Level: turbidityLevel,
          Message:
            turbidityLevel === "HIGH"
              ? "Water is highly turbid"
              : turbidityLevel === "MEDIUM"
                ? "Water turbidity is in medium range"
                : "Water turbidity is low",
          Date: date,
          Time: time,
          Year: year,
          Timestamp: now.getTime()
        }
      )

    ]);


    console.log(
      "✅ Current alert status updated in Firebase"
    );


  } catch (error) {

    console.error(
      "❌ Failed to update current alerts:",
      error
    );

    return;
  }


  // ====================================================
  // SAVE ALERT HISTORY WHEN LEVEL CHANGES
  // ====================================================

  try {

    // --------------------------------------------------
    // TDS LEVEL CHANGED
    // --------------------------------------------------

    if (
      previousAlertLevels.TDS !== null &&
      previousAlertLevels.TDS !== tdsLevel
    ) {

      await push(
        ref(
          rtdb,
          "AquaSmart/AlertHistory"
        ),
        {
          Parameter: "TDS",
          Value: tds,
          Level: tdsLevel,
          Message:
            `TDS level changed from ${previousAlertLevels.TDS} to ${tdsLevel}`,
          Date: date,
          Time: time,
          Year: year,
          Timestamp: now.getTime(),
          Status:
            tdsLevel === "HIGH"
              ? "Active"
              : "Resolved"
        }
      );

      console.log(
        "📝 TDS alert history saved"
      );
    }


    // --------------------------------------------------
    // TURBIDITY LEVEL CHANGED
    // --------------------------------------------------

    if (
      previousAlertLevels.Turbidity !== null &&
      previousAlertLevels.Turbidity !== turbidityLevel
    ) {

      await push(
        ref(
          rtdb,
          "AquaSmart/AlertHistory"
        ),
        {
          Parameter: "Turbidity",
          Value: turbidity,
          Level: turbidityLevel,
          Message:
            `Turbidity level changed from ${previousAlertLevels.Turbidity} to ${turbidityLevel}`,
          Date: date,
          Time: time,
          Year: year,
          Timestamp: now.getTime(),
          Status:
            turbidityLevel === "HIGH"
              ? "Active"
              : "Resolved"
        }
      );

      console.log(
        "📝 Turbidity alert history saved"
      );
    }


    // --------------------------------------------------
    // TEMPERATURE LEVEL CHANGED
    // --------------------------------------------------

    if (
      previousAlertLevels.Temperature !== null &&
      previousAlertLevels.Temperature !== temperatureLevel
    ) {

      await push(
        ref(
          rtdb,
          "AquaSmart/AlertHistory"
        ),
        {
          Parameter: "Temperature",
          Value: temperature,
          Level: temperatureLevel,
          Message:
            `Temperature level changed from ${previousAlertLevels.Temperature} to ${temperatureLevel}`,
          Date: date,
          Time: time,
          Year: year,
          Timestamp: now.getTime(),
          Status:
            temperatureLevel === "HIGH"
              ? "Active"
              : "Resolved"
        }
      );

      console.log(
        "📝 Temperature alert history saved"
      );
    }


    // --------------------------------------------------
    // UPDATE PREVIOUS LEVELS
    // --------------------------------------------------

    previousAlertLevels = {

      TDS: tdsLevel,

      Turbidity:
        turbidityLevel,

      Temperature:
        temperatureLevel

    };


  } catch (error) {

    console.error(
      "❌ Alert history error:",
      error
    );

  }


  // ====================================================
  // UPDATE ACTIVE ALERTS PAGE
  // ====================================================

  updateAlertPage(
    temperature,
    tds,
    turbidity,
    temperatureLevel,
    tdsLevel,
    turbidityLevel
  );
}
// ======================================================
// REAL-TIME ALERT HISTORY LISTENER
// ======================================================

const alertHistoryRef =
  ref(
    rtdb,
    "AquaSmart/AlertHistory"
  );


onValue(
  alertHistoryRef,
  (snapshot) => {

    const alertHistoryBody =
      document.getElementById(
        "alertHistoryBody"
      );

    if (!alertHistoryBody) {
      return;
    }


    const data =
      snapshot.val();


    if (!data) {

      alertHistoryBody.innerHTML = `
        <tr>
          <td colspan="3">
            No alert history available.
          </td>
        </tr>
      `;

      return;
    }


    const history =
      Object.values(data);


    // Newest first
    history.sort(
      (a, b) =>
        Number(b.Timestamp || 0) -
        Number(a.Timestamp || 0)
    );


    alertHistoryBody.innerHTML =
      history.map(
        (item) => {

          let statusClass =
            item.Status === "Active"
              ? "high"
              : "resolved";


          return `
            <tr>

              <td>
                ${item.Parameter}
                - ${item.Level}
              </td>

              <td>
                <span class="${statusClass}">
                  ${item.Status}
                </span>
              </td>

              <td>
                ${item.Date},
                ${item.Time},
                ${item.Year}
              </td>

            </tr>
          `;

        }
      ).join("");

  },

  (error) => {

    console.error(
      "❌ Alert history listener error:",
      error
    );

  }
);


// ======================================================
// DISPLAY ACTIVE ALERTS
// ======================================================

function updateAlertPage(
  temperature,
  tds,
  turbidity,
  temperatureLevel,
  tdsLevel,
  turbidityLevel
) {

  const activeAlerts =
    document.getElementById(
      "activeAlerts"
    );

  if (!activeAlerts) {
    return;
  }


  // ----------------------------------------------------
  // CREATE ALERT CARD
  // ----------------------------------------------------

  function createAlertCard(
    parameter,
    value,
    level,
    message,
    unit
  ) {

    let cssClass = "success";

    if (level === "HIGH") {
      cssClass = "high";
    }
    else if (level === "MEDIUM") {
      cssClass = "medium";
    }


    return `
      <div class="alert ${cssClass}">

        <div>

          <b>
            ${parameter}: ${level}
          </b>

          <p>
            ${message}
          </p>

          <small>
            Current Value: ${value} ${unit}
          </small>

        </div>

        <time>
          ${new Date().toLocaleTimeString()}<br>
          ${new Date().toLocaleDateString()}
        </time>

      </div>
    `;
  }


  // ----------------------------------------------------
  // DISPLAY ALL CURRENT LEVELS
  // ----------------------------------------------------

  activeAlerts.innerHTML =

    createAlertCard(
      "TDS",
      tds,
      tdsLevel,
      tdsLevel === "HIGH"
        ? "TDS level is high."
        : tdsLevel === "MEDIUM"
          ? "TDS level is in medium range."
          : "TDS level is low.",
      "ppm"
    )

    +

    createAlertCard(
      "Turbidity",
      turbidity,
      turbidityLevel,
      turbidityLevel === "HIGH"
        ? "Water is highly turbid."
        : turbidityLevel === "MEDIUM"
          ? "Water turbidity is in medium range."
          : "Water turbidity is low.",
      "NTU"
    )

    +

    createAlertCard(
      "Temperature",
      temperature,
      temperatureLevel,
      temperatureLevel === "HIGH"
        ? "Temperature is high."
        : "Temperature is normal.",
      "°C"
    );


  // ====================================================
  // UPDATE ALERT BADGE
  // ====================================================

  let highAlertCount = 0;


  if (tdsLevel === "HIGH") {
    highAlertCount++;
  }


  if (turbidityLevel === "HIGH") {
    highAlertCount++;
  }


  if (temperatureLevel === "HIGH") {
    highAlertCount++;
  }


  const alertBadge =
    document.getElementById(
      "alertBadge"
    );


  if (alertBadge) {

    if (highAlertCount > 0) {

      alertBadge.textContent =
        highAlertCount;

      alertBadge.style.display =
        "inline-flex";

    } else {

      alertBadge.style.display =
        "none";
    }

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
  // WATER QUALITY SCORE
  // Based on REAL-TIME TDS + TURBIDITY
  // ======================================================

  function calculateWaterQualityScore(tds, turbidity) {

    // Convert Firebase values to numbers
    tds = Number(tds);
    turbidity = Number(turbidity);


    // Check for invalid sensor values
    if (
      !Number.isFinite(tds) ||
      !Number.isFinite(turbidity)
    ) {
      return 0;
    }


    // ====================================================
    // TDS SCORE
    // Maximum reference value = 500 ppm
    // ====================================================

    const tdsScore =
      Math.max(
        0,
        Math.min(
          100,
          (1 - (tds / 500)) * 100
        )
      );


    // ====================================================
    // TURBIDITY SCORE
    // Maximum reference value = 50 NTU
    // ====================================================

    const turbidityScore =
      Math.max(
        0,
        Math.min(
          100,
          (1 - (turbidity / 50)) * 100
        )
      );


    // ====================================================
    // FINAL WATER QUALITY SCORE
    // TDS = 50%
    // TURBIDITY = 50%
    // ====================================================

    const finalScore =
      (tdsScore * 0.5) +
      (turbidityScore * 0.5);


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

 function getRiskLevel(score) {
  score = Number(score);

  if (score >= 70) {
    return "LOW";
  }

  if (score >= 40) {
    return "MEDIUM";
  }

  return "HIGH";
}


// ======================================================
// ANALYTICS - REAL-TIME DATA FROM FIREBASE RTDB
// ======================================================

const analyticsSensorRef =
  ref(
    rtdb,
    "AquaSmart/SensorData"
  );


// ------------------------------------------------------
// ARRAYS TO STORE ANALYTICS DATA
// ------------------------------------------------------

const analyticsLabels = [];
const analyticsTemperatureData = [];
const analyticsTdsData = [];
const analyticsTurbidityData = [];


// ------------------------------------------------------
// CHART VARIABLES
// ------------------------------------------------------

let analyticsTemperatureChart = null;
let analyticsTdsChart = null;
let analyticsTurbidityChart = null;


// ======================================================
// UPDATE ANALYTICS CHARTS
// ======================================================

function renderAnalyticsCharts(
  labels,
  temperatureData,
  tdsData,
  turbidityData
) {

  // ----------------------------------------------------
  // TEMPERATURE CHART
  // ----------------------------------------------------

  const temperatureChartElement =
    document.getElementById(
      "tempChart"
    );


  if (
    temperatureChartElement &&
    typeof Chart !== "undefined"
  ) {

    if (analyticsTemperatureChart) {
      analyticsTemperatureChart.destroy();
    }


    analyticsTemperatureChart =
      new Chart(
        temperatureChartElement,
        {
          type: "line",

          data: {

            labels:
              labels,

            datasets: [

              {
                label:
                  "Temperature (°C)",

                data:
                  temperatureData,

                tension:
                  0.3,

                fill:
                  false
              }

            ]
          },

          options: {

            responsive:
              true,

            maintainAspectRatio:
              false,

            scales: {

              y: {
                beginAtZero:
                  false
              }

            }

          }

        }
      );

  }


  // ----------------------------------------------------
  // TDS CHART
  // ----------------------------------------------------

  const tdsChartElement =
    document.getElementById(
      "tdsChart"
    );


  if (
    tdsChartElement &&
    typeof Chart !== "undefined"
  ) {

    if (analyticsTdsChart) {
      analyticsTdsChart.destroy();
    }


    analyticsTdsChart =
      new Chart(
        tdsChartElement,
        {
          type: "line",

          data: {

            labels:
              labels,

            datasets: [

              {
                label:
                  "TDS (ppm)",

                data:
                  tdsData,

                tension:
                  0.3,

                fill:
                  false
              }

            ]
          },

          options: {

            responsive:
              true,

            maintainAspectRatio:
              false,

            scales: {

              y: {
                beginAtZero:
                  false
              }

            }

          }

        }
      );

  }


  // ----------------------------------------------------
  // TURBIDITY CHART
  // ----------------------------------------------------

  const turbidityChartElement =
    document.getElementById(
      "turbidityChart"
    );


  if (
    turbidityChartElement &&
    typeof Chart !== "undefined"
  ) {

    if (analyticsTurbidityChart) {
      analyticsTurbidityChart.destroy();
    }


    analyticsTurbidityChart =
      new Chart(
        turbidityChartElement,
        {
          type: "line",

          data: {

            labels:
              labels,

            datasets: [

              {
                label:
                  "Turbidity (NTU)",

                data:
                  turbidityData,

                tension:
                  0.3,

                fill:
                  false
              }

            ]
          },

          options: {

            responsive:
              true,

            maintainAspectRatio:
              false,

            scales: {

              y: {
                beginAtZero:
                  true
              }

            }

          }

        }
      );

  }

}

/// ======================================================
// LISTEN TO FIREBASE RTDB SENSOR HISTORY
// ======================================================

const analyticsHistoryRef =
  ref(
    rtdb,
    "AquaSmart/SensorHistory"
  );

onValue(

  analyticsHistoryRef,

  (snapshot) => {

    const data =
      snapshot.val();


    // --------------------------------------------------
    // NO HISTORY DATA
    // --------------------------------------------------

    if (!data) {

      console.log(
        "❌ No sensor history data found."
      );

      return;
    }


    // --------------------------------------------------
    // ARRAYS FOR CHARTS
    // --------------------------------------------------

   const labels = [];

const temperatureData = [];

const tdsData = [];

const turbidityData = [];


    // --------------------------------------------------
    // CONVERT FIREBASE HISTORY TO ARRAY
    // --------------------------------------------------

    const history =
      Object.values(data);


    // --------------------------------------------------
    // SORT HISTORY BY TIMESTAMP
    // --------------------------------------------------

    history.sort(
      (a, b) =>
        Number(a.Timestamp || 0) -
        Number(b.Timestamp || 0)
    );


    // --------------------------------------------------
    // READ ALL HISTORY READINGS
    // --------------------------------------------------

    history.forEach(
      (reading) => {

        const temperature =
          Number(
            reading.Temperature
          );

        const tds =
          Number(
            reading.TDS
          );

        const turbidity =
          Number(
            reading.Turbidity
          );


        // ----------------------------------------------
        // VALIDATE READING
        // ----------------------------------------------

        if (
          !Number.isFinite(temperature) ||
          !Number.isFinite(tds) ||
          !Number.isFinite(turbidity)
        ) {

          return;
        }


        // ----------------------------------------------
        // TIME
        // ----------------------------------------------

        const timestamp =
          Number(
            reading.Timestamp || 0
          );

        const time =
          timestamp
            ? new Date(
                timestamp
              ).toLocaleTimeString()
            : "--";


        // ----------------------------------------------
        // ADD DATA TO CHART ARRAYS
        // ----------------------------------------------

        labels.push(
          time
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

      }
    );


    // --------------------------------------------------
    // UPDATE CHARTS
    // --------------------------------------------------

    if (
      labels.length > 0
    ) {

      renderAnalyticsCharts(
        labels,
        temperatureData,
        tdsData,
        turbidityData
      );

    }


    // ==================================================
    // UPDATE RECENT HISTORY TABLE
    // ==================================================

   const historyTableBody =
  document.getElementById(
    "historyBody"
  );


    if (historyTableBody) {

      historyTableBody.innerHTML = "";


      // ----------------------------------------------
      // SHOW MOST RECENT READINGS FIRST
      // ----------------------------------------------

      const recentHistory =
        [...history]
          .reverse()
          .slice(0, 10);


      recentHistory.forEach(
        (reading) => {

          const temperature =
            Number(
              reading.Temperature
            );

          const tds =
            Number(
              reading.TDS
            );

          const turbidity =
            Number(
              reading.Turbidity
            );

          const timestamp =
            Number(
              reading.Timestamp || 0
            );


          if (
            !Number.isFinite(temperature) ||
            !Number.isFinite(tds) ||
            !Number.isFinite(turbidity)
          ) {

            return;
          }


          const dateTime =
            timestamp
              ? new Date(
                  timestamp
                ).toLocaleString()
              : "--";


          const row =
            document.createElement(
              "tr"
            );


          row.innerHTML = `
            <td>${dateTime}</td>
            <td>${temperature} °C</td>
            <td>${tds} ppm</td>
            <td>${turbidity} NTU</td>
          `;


          historyTableBody.appendChild(
            row
          );

        }
      );

    }


    // --------------------------------------------------
    // CONSOLE
    // --------------------------------------------------

    console.log(
      "📊 Analytics updated from SensorHistory"
    );

    console.log(
      "Total history readings:",
      labels.length
    );

    console.log(
      "📋 Recent History table updated"
    );

  },

  (error) => {

    console.error(
      "❌ Sensor history RTDB error:",
      error
    );

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
// LOAD THRESHOLDS FROM FIRESTORE
// ======================================================

function loadThresholdSettings() {

  const thresholdRef =
    doc(db, "settings", "thresholds");

  onSnapshot(
    thresholdRef,
    (snapshot) => {

      if (!snapshot.exists()) {

        console.log(
          "⚠️ Threshold document does not exist."
        );

        return;
      }

      const data = snapshot.data();

      console.log(
        "🔥 Thresholds received from Firestore:",
        data
      );


      // Update the actual threshold values

      if (
        Number.isFinite(
          Number(data.maxTemperature)
        )
      ) {

        alertThresholds.maxTemperature =
          Number(data.maxTemperature);

      }


      if (
        Number.isFinite(
          Number(data.maxTDS)
        )
      ) {

        alertThresholds.maxTds =
          Number(data.maxTDS);

      }


      if (
        Number.isFinite(
          Number(data.maxTurbidity)
        )
      ) {

        alertThresholds.maxTurbidity =
          Number(data.maxTurbidity);

      }


      // Update the Settings page fields

      const temperatureInput =
        document.getElementById(
          "maxTemperature"
        );

      const tdsInput =
        document.getElementById(
          "maxTds"
        );

      const turbidityInput =
        document.getElementById(
          "maxTurbidity"
        );


      if (temperatureInput) {

        temperatureInput.value =
          alertThresholds.maxTemperature;

      }


      if (tdsInput) {

        tdsInput.value =
          alertThresholds.maxTds;

      }


      if (turbidityInput) {

        turbidityInput.value =
          alertThresholds.maxTurbidity;

      }


      console.log(
        "✅ Active thresholds:",
        alertThresholds
      );

    },

    (error) => {

      console.error(
        "❌ Failed to read thresholds:",
        error
      );

    }
  );

}


// ======================================================
// SAVE THRESHOLDS TO FIRESTORE
// ======================================================

const saveThresholdsButton =
  document.getElementById(
    "saveThresholds"
  );


if (saveThresholdsButton) {

  saveThresholdsButton.addEventListener(
    "click",
    async () => {

      try {

        // Read values from webpage

        const maxTemperature =
          Number(
            document.getElementById(
              "maxTemperature"
            ).value
          );


        const maxTds =
          Number(
            document.getElementById(
              "maxTds"
            ).value
          );


        const maxTurbidity =
          Number(
            document.getElementById(
              "maxTurbidity"
            ).value
          );


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
          !Number.isFinite(maxTemperature) ||
          !Number.isFinite(maxTds) ||
          !Number.isFinite(maxTurbidity)
        ) {

          alert(
            "Please enter valid threshold values."
          );

          return;
        }


        if (
          maxTemperature < 0 ||
          maxTds < 0 ||
          maxTurbidity < 0
        ) {

          alert(
            "Threshold values cannot be negative."
          );

          return;
        }


        // ==================================================
        // UPDATE LOCAL ACTIVE THRESHOLDS
        // ==================================================

        alertThresholds.maxTemperature =
          maxTemperature;

        alertThresholds.maxTds =
          maxTds;

        alertThresholds.maxTurbidity =
          maxTurbidity;


        // ==================================================
        // SAVE TO FIRESTORE
        // ==================================================

        await setDoc(

          doc(
            db,
            "settings",
            "thresholds"
          ),

          {
            maxTemperature:
              maxTemperature,

            maxTDS:
              maxTds,

            maxTurbidity:
              maxTurbidity,

            updatedAt:
              serverTimestamp()
          },

          {
            merge: true
          }

        );


        console.log(
          "✅ Thresholds saved to Firestore"
        );


        console.log(
          "Max Temperature:",
          maxTemperature
        );

        console.log(
          "Max TDS:",
          maxTds
        );

        console.log(
          "Max Turbidity:",
          maxTurbidity
        );


        alert(
          "✅ Threshold settings saved successfully!"
        );

      }

      catch (error) {

        console.error(
          "❌ Failed to save thresholds:",
          error
        );


        alert(
          "❌ Failed to save threshold settings."
        );

      }

    }
  );

}


  // ======================================================
  // COOLER SCHEDULE
  // ======================================================

  



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
  // ======================================================
// AQUASENSE PREDICTION SYSTEM
// ======================================================

let predictionChart = null;

let sensorHistoryForPrediction = [];


// ======================================================
// LOAD SENSOR HISTORY
// ======================================================

function loadPredictionHistory() {

  const historyRef =
    ref(
      rtdb,
      "AquaSmart/SensorHistory"
    );


  onValue(
    historyRef,
    (snapshot) => {

      const data = snapshot.val();


      if (!data) {

        console.log(
          "⚠️ No SensorHistory data available."
        );

        return;

      }


      const history = [];


      Object.keys(data).forEach(
        (key) => {

          const item = data[key];


          if (!item) {
            return;
          }


          const tds =
            Number(item.TDS);


          const temperature =
            Number(item.Temperature);


          const turbidity =
            Number(item.Turbidity);


          const timestamp =
            Number(item.Timestamp);


          if (
            !Number.isFinite(tds) ||
            !Number.isFinite(temperature) ||
            !Number.isFinite(turbidity) ||
            !Number.isFinite(timestamp)
          ) {

            return;

          }


          history.push({

            id: key,

            timestamp: timestamp,

            tds: tds,

            temperature: temperature,

            turbidity: turbidity

          });

        }
      );


      // Sort oldest → newest

      history.sort(
        (a, b) =>
          a.timestamp - b.timestamp
      );


      // Use the latest 20 readings

      sensorHistoryForPrediction =
        history.slice(-20);


      console.log(
        "📊 Sensor history used for prediction:",
        sensorHistoryForPrediction
      );


      if (
        sensorHistoryForPrediction.length < 5
      ) {

        console.log(
          "⚠️ Need at least 5 sensor history readings for prediction."
        );

        return;

      }


      generatePrediction();

    },

    (error) => {

      console.error(
        "❌ SensorHistory prediction error:",
        error
      );

    }
  );

}


// ======================================================
// TREND PREDICTION
// ======================================================

function calculateTrendPrediction(
  history,
  valueKey,
  hoursAhead
) {

  if (
    !history ||
    history.length < 2
  ) {

    return null;

  }


  const points =
    history.slice(-20);


  const firstTimestamp =
    points[0].timestamp;


  const x =
    points.map(
      (item) =>
        (
          item.timestamp -
          firstTimestamp
        ) /
        (1000 * 60 * 60)
    );


  const y =
    points.map(
      (item) =>
        Number(item[valueKey])
    );


  const n = x.length;


  const sumX =
    x.reduce(
      (sum, value) =>
        sum + value,
      0
    );


  const sumY =
    y.reduce(
      (sum, value) =>
        sum + value,
      0
    );


  const sumXY =
    x.reduce(
      (sum, value, index) =>
        sum +
        value *
        y[index],
      0
    );


  const sumXX =
    x.reduce(
      (sum, value) =>
        sum +
        value * value,
      0
    );


  const denominator =
    (
      n * sumXX
    ) -
    (
      sumX * sumX
    );


  if (
    denominator === 0
  ) {

    return y[y.length - 1];

  }


  const slope =
    (
      (n * sumXY) -
      (sumX * sumY)
    ) /
    denominator;


  const intercept =
    (
      sumY -
      slope * sumX
    ) /
    n;


  const latestX =
    x[x.length - 1];


  const futureX =
    latestX +
    hoursAhead;


  const prediction =
    intercept +
    slope * futureX;


  return prediction;

}


// ======================================================
// GENERATE PREDICTION
// ======================================================

function generatePrediction() {

  const history =
    sensorHistoryForPrediction;


  if (
    history.length < 5
  ) {

    return;

  }


  const latest =
    history[
      history.length - 1
    ];


  // ====================================================
  // +24 HOUR PREDICTIONS
  // ====================================================

  let predictedTemperature =
    calculateTrendPrediction(
      history,
      "temperature",
      24
    );


  let predictedTds =
    calculateTrendPrediction(
      history,
      "tds",
      24
    );


  let predictedTurbidity =
    calculateTrendPrediction(
      history,
      "turbidity",
      24
    );


  // ====================================================
  // PREVENT NEGATIVE SENSOR VALUES
  // ====================================================

  predictedTemperature =
    Math.max(
      0,
      predictedTemperature
    );


  predictedTds =
    Math.max(
      0,
      predictedTds
    );


  predictedTurbidity =
    Math.max(
      0,
      predictedTurbidity
    );


  // ====================================================
  // ROUND VALUES
  // ====================================================

  predictedTemperature =
    Number(
      predictedTemperature.toFixed(1)
    );


  predictedTds =
    Math.round(
      predictedTds
    );


  predictedTurbidity =
    Math.round(
      predictedTurbidity
    );


  // ====================================================
  // UPDATE PREDICTION CARDS
  // ====================================================

  const temperatureElement =
    document.getElementById(
      "predictedTemperature"
    );


  const tdsElement =
    document.getElementById(
      "predictedTds"
    );


  const turbidityElement =
    document.getElementById(
      "predictedTurbidity"
    );


  if (temperatureElement) {

    temperatureElement.textContent =
      predictedTemperature;

  }


  if (tdsElement) {

    tdsElement.textContent =
      predictedTds;

  }


  if (turbidityElement) {

    turbidityElement.textContent =
      predictedTurbidity;

  }


  // ====================================================
  // CALCULATE CHANGE
  // ====================================================

  const temperatureChange =
    predictedTemperature -
    latest.temperature;


  const tdsChange =
    predictedTds -
    latest.tds;


  const turbidityChange =
    predictedTurbidity -
    latest.turbidity;


  const temperatureChangeElement =
    document.getElementById(
      "temperaturePredictionChange"
    );


  const tdsChangeElement =
    document.getElementById(
      "tdsPredictionChange"
    );


  const turbidityChangeElement =
    document.getElementById(
      "turbidityPredictionChange"
    );


  if (temperatureChangeElement) {

    temperatureChangeElement.textContent =
      formatPredictionChange(
        temperatureChange,
        "°C"
      );

  }


  if (tdsChangeElement) {

    tdsChangeElement.textContent =
      formatPredictionChange(
        tdsChange,
        "ppm"
      );

  }


  if (turbidityChangeElement) {

    turbidityChangeElement.textContent =
      formatPredictionChange(
        turbidityChange,
        "NTU"
      );

  }


  // ====================================================
  // RISK CALCULATION
  // SAME AS DASHBOARD
  // ====================================================

  const predictedScore =
    calculateWaterQualityScore(
      predictedTds,
      predictedTurbidity
    );


  const predictedRisk =
    getRiskLevel(
      predictedScore
    );


  const predictedRiskElement =
    document.getElementById(
      "predictedRisk"
    );


  if (predictedRiskElement) {

    predictedRiskElement.textContent =
      predictedRisk;

  }


  // ====================================================
  // COMPARE CURRENT VS PREDICTED RISK
  // ====================================================

  const currentScore =
    calculateWaterQualityScore(
      latest.tds,
      latest.turbidity
    );


  const riskTrendElement =
    document.getElementById(
      "predictionRiskTrend"
    );


  if (riskTrendElement) {

    if (
      predictedScore >
      currentScore
    ) {

      riskTrendElement.textContent =
        "(Improving)";

    }

    else if (
      predictedScore <
      currentScore
    ) {

      riskTrendElement.textContent =
        "(Increasing)";

    }

    else {

      riskTrendElement.textContent =
        "(Stable)";

    }

  }


  // ====================================================
  // CREATE PREDICTION GRAPH
  // ====================================================

  createPredictionChart(
    history
  );

}


// ======================================================
// FORMAT CHANGE
// ======================================================

function formatPredictionChange(
  value,
  unit
) {

  if (value > 0) {

    return (
      "↑ " +
      Math.abs(
        value
      ).toFixed(
        unit === "°C"
          ? 1
          : 0
      ) +
      " " +
      unit
    );

  }


  if (value < 0) {

    return (
      "↓ " +
      Math.abs(
        value
      ).toFixed(
        unit === "°C"
          ? 1
          : 0
      ) +
      " " +
      unit
    );

  }


  return "→ No change";

}


// ======================================================
// PREDICTION GRAPH
// ======================================================

// ======================================================
// PREDICTION GRAPHS
// ======================================================

let temperaturePredictionChart = null;
let tdsPredictionChart = null;
let turbidityPredictionChart = null;


function createPredictionChart(history) {

  if (!history || history.length < 5) {
    console.log("Not enough SensorHistory data.");
    return;
  }


  // ====================================================
  // LAST 5 SENSOR HISTORY VALUES
  // ====================================================

  const recentHistory =
    history.slice(-5);


  const labels = [
    "History 1",
    "History 2",
    "History 3",
    "History 4",
    "Now",
    "+6 Hours",
    "+12 Hours",
    "+18 Hours",
    "+24 Hours"
  ];


  // ====================================================
  // TEMPERATURE
  // ====================================================

  const temperatureHistory =
    recentHistory.map(
      item => Number(item.temperature)
    );


  const temperaturePrediction = [

    temperatureHistory[4],

    calculateTrendPrediction(
      history,
      "temperature",
      6
    ),

    calculateTrendPrediction(
      history,
      "temperature",
      12
    ),

    calculateTrendPrediction(
      history,
      "temperature",
      18
    ),

    calculateTrendPrediction(
      history,
      "temperature",
      24
    )

  ].map(
    value =>
      Number(
        Math.max(0, value).toFixed(1)
      )
  );


  // ====================================================
  // TDS
  // ====================================================

  const tdsHistory =
    recentHistory.map(
      item => Number(item.tds)
    );


  const tdsPrediction = [

    tdsHistory[4],

    calculateTrendPrediction(
      history,
      "tds",
      6
    ),

    calculateTrendPrediction(
      history,
      "tds",
      12
    ),

    calculateTrendPrediction(
      history,
      "tds",
      18
    ),

    calculateTrendPrediction(
      history,
      "tds",
      24
    )

  ].map(
    value =>
      Math.round(
        Math.max(0, value)
      )
  );


  // ====================================================
  // TURBIDITY
  // ====================================================

  const turbidityHistory =
    recentHistory.map(
      item => Number(item.turbidity)
    );


  const turbidityPrediction = [

    turbidityHistory[4],

    calculateTrendPrediction(
      history,
      "turbidity",
      6
    ),

    calculateTrendPrediction(
      history,
      "turbidity",
      12
    ),

    calculateTrendPrediction(
      history,
      "turbidity",
      18
    ),

    calculateTrendPrediction(
      history,
      "turbidity",
      24
    )

  ].map(
    value =>
      Math.round(
        Math.max(0, value)
      )
  );


  // ====================================================
  // TEMPERATURE GRAPH
  // ====================================================

  const temperatureCanvas =
    document.getElementById(
      "temperaturePredictionChart"
    );


  if (temperatureCanvas) {

    if (temperaturePredictionChart) {
      temperaturePredictionChart.destroy();
    }


    temperaturePredictionChart =
      new Chart(
        temperatureCanvas,
        {

          type: "line",

          data: {

            labels: labels,

            datasets: [

              {
                label: "Sensor History",

                data: [

                  temperatureHistory[0],
                  temperatureHistory[1],
                  temperatureHistory[2],
                  temperatureHistory[3],
                  temperatureHistory[4],

                  null,
                  null,
                  null,
                  null

                ],

                tension: 0.3,

                fill: false
              },


              {
                label:
                  "Predicted Temperature (°C)",

                data: [

                  null,
                  null,
                  null,
                  null,

                  temperaturePrediction[0],
                  temperaturePrediction[1],
                  temperaturePrediction[2],
                  temperaturePrediction[3],
                  temperaturePrediction[4]

                ],

                tension: 0.3,

                borderDash: [6, 6],

                fill: false
              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false

          }

        }
      );

  }


  // ====================================================
  // TDS GRAPH
  // ====================================================

  const tdsCanvas =
    document.getElementById(
      "tdsPredictionChart"
    );


  if (tdsCanvas) {

    if (tdsPredictionChart) {
      tdsPredictionChart.destroy();
    }


    tdsPredictionChart =
      new Chart(
        tdsCanvas,
        {

          type: "line",

          data: {

            labels: labels,

            datasets: [

              {
                label: "Sensor History",

                data: [

                  tdsHistory[0],
                  tdsHistory[1],
                  tdsHistory[2],
                  tdsHistory[3],
                  tdsHistory[4],

                  null,
                  null,
                  null,
                  null

                ],

                tension: 0.3,

                fill: false
              },


              {
                label:
                  "Predicted TDS (ppm)",

                data: [

                  null,
                  null,
                  null,
                  null,

                  tdsPrediction[0],
                  tdsPrediction[1],
                  tdsPrediction[2],
                  tdsPrediction[3],
                  tdsPrediction[4]

                ],

                tension: 0.3,

                borderDash: [6, 6],

                fill: false
              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false

          }

        }
      );

  }


  // ====================================================
  // TURBIDITY GRAPH
  // ====================================================

  const turbidityCanvas =
    document.getElementById(
      "turbidityPredictionChart"
    );


  if (turbidityCanvas) {

    if (turbidityPredictionChart) {
      turbidityPredictionChart.destroy();
    }


    turbidityPredictionChart =
      new Chart(
        turbidityCanvas,
        {

          type: "line",

          data: {

            labels: labels,

            datasets: [

              {
                label: "Sensor History",

                data: [

                  turbidityHistory[0],
                  turbidityHistory[1],
                  turbidityHistory[2],
                  turbidityHistory[3],
                  turbidityHistory[4],

                  null,
                  null,
                  null,
                  null

                ],

                tension: 0.3,

                fill: false
              },


              {
                label:
                  "Predicted Turbidity (NTU)",

                data: [

                  null,
                  null,
                  null,
                  null,

                  turbidityPrediction[0],
                  turbidityPrediction[1],
                  turbidityPrediction[2],
                  turbidityPrediction[3],
                  turbidityPrediction[4]

                ],

                tension: 0.3,

                borderDash: [6, 6],

                fill: false
              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false

          }

        }
      );

  }


  console.log(
    "✅ Prediction graphs created from SensorHistory."
  );

}


// ======================================================
// WATER TANK INFO EDIT
// ======================================================

function setupWaterTankInfo() {

  const editButton =
    document.getElementById(
      "editWaterTankBtn"
    );

  const saveButton =
    document.getElementById(
      "saveWaterTankBtn"
    );

  const cancelButton =
    document.getElementById(
      "cancelWaterTankBtn"
    );

  const viewSection =
    document.getElementById(
      "waterTankView"
    );

  const editSection =
    document.getElementById(
      "waterTankEdit"
    );


  const systemNameDisplay =
    document.getElementById(
      "systemNameDisplay"
    );

  const waterTypeDisplay =
    document.getElementById(
      "waterTypeDisplay"
    );

  const monitoringDisplay =
    document.getElementById(
      "monitoringDisplay"
    );


  const systemNameInput =
    document.getElementById(
      "systemNameInput"
    );

  const waterTypeInput =
    document.getElementById(
      "waterTypeInput"
    );

  const monitoringInput =
    document.getElementById(
      "monitoringInput"
    );


  // --------------------------------------------------
  // LOAD SAVED INFORMATION
  // --------------------------------------------------

  const savedSystemName =
    localStorage.getItem(
      "aquaSenseSystemName"
    );

  const savedWaterType =
    localStorage.getItem(
      "aquaSenseWaterType"
    );

  const savedMonitoring =
    localStorage.getItem(
      "aquaSenseMonitoring"
    );


  if (savedSystemName) {

    systemNameDisplay.textContent =
      savedSystemName;

    systemNameInput.value =
      savedSystemName;

  }


  if (savedWaterType) {

    waterTypeDisplay.textContent =
      savedWaterType;

    waterTypeInput.value =
      savedWaterType;

  }


  if (savedMonitoring) {

    monitoringDisplay.textContent =
      savedMonitoring;

    monitoringInput.value =
      savedMonitoring;

  }


  // --------------------------------------------------
  // EDIT BUTTON
  // --------------------------------------------------

  editButton.addEventListener(
    "click",
    () => {

      systemNameInput.value =
        systemNameDisplay.textContent;

      waterTypeInput.value =
        waterTypeDisplay.textContent;

      monitoringInput.value =
        monitoringDisplay.textContent;


      viewSection.style.display =
        "none";

      editSection.style.display =
        "flex";

      editButton.style.display =
        "none";

    }
  );


  // --------------------------------------------------
  // SAVE BUTTON
  // --------------------------------------------------

  saveButton.addEventListener(
    "click",
    () => {

      const systemName =
        systemNameInput.value.trim();

      const waterType =
        waterTypeInput.value.trim();

      const monitoring =
        monitoringInput.value.trim();


      if (!systemName ||
          !waterType ||
          !monitoring) {

        alert(
          "Please fill in all Water Tank Info fields."
        );

        return;
      }


      // Update display

      systemNameDisplay.textContent =
        systemName;

      waterTypeDisplay.textContent =
        waterType;

      monitoringDisplay.textContent =
        monitoring;


      // Save locally

      localStorage.setItem(
        "aquaSenseSystemName",
        systemName
      );

      localStorage.setItem(
        "aquaSenseWaterType",
        waterType
      );

      localStorage.setItem(
        "aquaSenseMonitoring",
        monitoring
      );


      // Return to view mode

      editSection.style.display =
        "none";

      viewSection.style.display =
        "flex";

      editButton.style.display =
        "inline-block";

    }
  );


  // --------------------------------------------------
  // CANCEL BUTTON
  // --------------------------------------------------

  cancelButton.addEventListener(
    "click",
    () => {

      editSection.style.display =
        "none";

      viewSection.style.display =
        "flex";

      editButton.style.display =
        "inline-block";

    }
  );

}


// ======================================================
// START WATER TANK INFO
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupWaterTankInfo();

  }
);


// ======================================================
// START PREDICTION LISTENER
// ======================================================

loadPredictionHistory();


// ======================================================
// WATER TANK INFO EDIT
// ======================================================

const editWaterInfoBtn =
  document.getElementById("editWaterInfoBtn");

const cancelWaterInfoBtn =
  document.getElementById("cancelWaterInfoBtn");

const saveWaterInfoBtn =
  document.getElementById("saveWaterInfoBtn");

const waterInfoView =
  document.getElementById("waterInfoView");

const waterInfoEdit =
  document.getElementById("waterInfoEdit");


// ======================================================
// EDIT WATER INFO
// ======================================================

if (editWaterInfoBtn) {

  editWaterInfoBtn.addEventListener("click", () => {

    // Put current values into input boxes

    document.getElementById(
      "systemNameInput"
    ).value =
      document.getElementById(
        "systemNameDisplay"
      ).textContent.trim();


    document.getElementById(
      "waterTypeInput"
    ).value =
      document.getElementById(
        "waterTypeDisplay"
      ).textContent.trim();


    document.getElementById(
      "monitoringInput"
    ).value =
      document.getElementById(
        "monitoringDisplay"
      ).textContent.trim();


    // Hide normal view

    waterInfoView.style.display = "none";


    // Show edit mode

    waterInfoEdit.style.display = "block";

  });

}


// ======================================================
// CANCEL EDIT
// ======================================================

if (cancelWaterInfoBtn) {

  cancelWaterInfoBtn.addEventListener("click", () => {

    waterInfoEdit.style.display = "none";

    waterInfoView.style.display = "block";

  });

}


// ======================================================
// SAVE WATER INFO
// ======================================================

if (saveWaterInfoBtn) {

  saveWaterInfoBtn.addEventListener("click", () => {

    const systemName =
      document.getElementById(
        "systemNameInput"
      ).value.trim();


    const waterType =
      document.getElementById(
        "waterTypeInput"
      ).value.trim();


    const monitoring =
      document.getElementById(
        "monitoringInput"
      ).value.trim();


    // Check empty fields

    if (
      !systemName ||
      !waterType ||
      !monitoring
    ) {

      alert(
        "Please fill all Water Tank Information fields."
      );

      return;

    }


    // Update displayed values

    document.getElementById(
      "systemNameDisplay"
    ).textContent = systemName;


    document.getElementById(
      "waterTypeDisplay"
    ).textContent = waterType;


    document.getElementById(
      "monitoringDisplay"
    ).textContent = monitoring;


    // Return to view mode

    waterInfoEdit.style.display = "none";

    waterInfoView.style.display = "block";


    console.log(
      "✅ Water Tank Information updated successfully."
    );

  });

}