# AquaSense Web Dashboard

This project is a frontend implementation based on the uploaded AquaSense design/reference.

## Included pages
- Dashboard
- Analytics
- Controls
- Prediction
- Alerts
- Settings
- Profile

## Firebase connection
1. Create a Firebase project.
2. Register a Web App.
3. Create a Firestore Database.
4. Open `firebase-config.js`.
5. Replace the `YOUR_...` placeholders with the Firebase Web App configuration.
6. Create/use these Firestore collections/documents:
   - `sensorReadings` — latest sensor document can contain `temperature`, `ph`, `turbidity`, `waterLevel`, `qualityScore`, `timestamp`
   - `controls/pump` — `{ state: true/false, updatedAt: timestamp }`
   - `controls/light` — `{ state: true/false, updatedAt: timestamp }`
   - `feedingEvents` — web feeding commands
7. Use proper Firestore Security Rules before real deployment.

## Run
Use VS Code + Live Server, or any local web server. Do not rely on opening `index.html` directly because ES modules are used.

The UI works in demo mode even before Firebase is configured. After adding Firebase credentials, the sensor cards update from Firestore in real time and control commands are written to Firestore.
