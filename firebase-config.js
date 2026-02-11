// Firebase Configuration
// Copy this file to 'firebase-config.js' and replace with your actual Firebase credentials

const firebaseConfig = {
    apiKey: "DEMO_MODE",
    authDomain: "demo.firebaseapp.com",
    databaseURL: "https://demo-default-rtdb.firebaseio.com",
    projectId: "demo",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "000000000000",
    appId: "demo:app:id"
};

// Initialize Firebase (this will fail in demo mode, which is expected)
try {
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();
} catch (error) {
    console.log('Running in demo mode - Firebase not configured');
    // App will automatically load demo data
}
