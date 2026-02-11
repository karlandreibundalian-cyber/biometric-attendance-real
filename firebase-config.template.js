// Firebase Configuration Template
// Replace the values below with your actual Firebase project credentials
// You can find these in the Firebase Console:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project
// 3. Click on the gear icon (Settings) > Project settings
// 4. Scroll down to "Your apps" section
// 5. Click on the web app icon (</>) or "Add app" if you haven't created one
// 6. Copy the configuration object

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();
