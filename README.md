# Biometric Attendance System

A modern, real-time biometric attendance management system built for R307 fingerprint sensors with ESP32 and Firebase integration.

## Features

✨ **Real-time Dashboard** - Live attendance monitoring with instant updates
📊 **Analytics & Reports** - Generate custom reports with date ranges and filters
👥 **User Management** - Easy CRUD operations for managing registered users
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
🌙 **Modern UI** - Dark mode with glassmorphism effects and smooth animations
📥 **Export Functionality** - Export attendance records to CSV

## Quick Start

### Option 1: Demo Mode (Instant Preview)

The application comes pre-configured with demo data. Simply open `index.html` in your web browser:

1. Navigate to the project folder
2. Double-click `index.html` or open it in any web browser
3. Explore the interface with sample data

### Option 2: Connect to Your Firebase Database

1. **Create a Firebase Project** (if you haven't already)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Realtime Database in the Firebase console

2. **Get Your Firebase Configuration**
   - In Firebase Console, go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to add a web app or view existing config
   - Copy the `firebaseConfig` object

3. **Update Configuration**
   - Open `firebase-config.js` in a text editor
   - Replace the demo configuration with your actual Firebase credentials
   - Save the file

4. **Database Structure**

   Your Firebase Realtime Database should follow this structure:

   ```
   {
     "attendance": {
       "user001": {
         "1234567890000": {
           "userId": "user001",
           "name": "John Doe",
           "timestamp": 1234567890000,
           "status": "check-in",
           "department": "Engineering"
         }
       }
     },
     "users": {
       "user001": {
         "name": "John Doe",
         "fingerprintId": "101",
         "department": "Engineering",
         "email": "john@example.com"
       }
     }
   }
   ```

5. **ESP32 Integration**

   Configure your ESP32 to send data to Firebase when a fingerprint is detected:

   ```cpp
   // Example structure for ESP32 to send
   {
     "userId": "user001",
     "name": "John Doe",
     "timestamp": millis(),
     "status": "check-in",  // or "check-out"
     "department": "Engineering"
   }
   ```

   Send to path: `/attendance/{userId}/{timestamp}`

## Usage Guide

### Dashboard
- View real-time statistics (present today, weekly/monthly totals)
- Monitor recent attendance activity
- Auto-refreshing data when connected to Firebase

### Attendance Records
- Search by name or user ID
- Filter by status (check-in/check-out)
- Export records to CSV
- View detailed timestamp information

### User Management
- Add new users with fingerprint IDs
- Edit existing user information
- Delete users
- Search and filter users by department

### Reports
- Generate custom reports with date ranges
- Filter by department
- Export report data to CSV
- View summary statistics

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Firebase Realtime Database
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Inline SVG icons
- **Fonts**: Google Fonts (Inter)

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ Mobile browsers

## File Structure

```
biometrics-attendance/
├── index.html                          # Main application file
├── styles.css                          # All styling and animations
├── app.js                              # Application logic and Firebase integration
├── firebase-config.js                  # Firebase configuration (active)
├── firebase-config.template.js         # Template for Firebase setup
└── README.md                           # This file
```

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary: hsl(260, 85%, 62%);
    --secondary: hsl(195, 85%, 55%);
    /* ... more colors */
}
```

### Database Structure
Modify the data loading functions in `app.js` to match your specific database schema.

## Security Notes

⚠️ **Important**: 
- Never commit your actual `firebase-config.js` with real credentials to public repositories
- Set up Firebase Security Rules to protect your data
- Consider implementing authentication for production use

Example Firebase Security Rules:
```json
{
  "rules": {
    "attendance": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Troubleshooting

### "Config Error" Status
- Check that Firebase SDK is loaded correctly
- Verify your Firebase configuration in `firebase-config.js`
- Ensure Firebase project exists and Realtime Database is enabled

### No Data Showing
- Check Firebase console for database structure
- Verify database rules allow read access
- Check browser console for errors

### Real-time Updates Not Working
- Ensure Firebase connection is established (green dot in navbar)
- Check that database rules allow `.read` permission
- Verify ESP32 is sending data to correct database path

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please check the Firebase documentation or create an issue in your project repository.

---

Built with ❤️ for efficient attendance tracking
