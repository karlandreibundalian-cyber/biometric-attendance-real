# Email Setup Guide

This guide explains how to set up automated email reports for your biometric attendance system.

## Overview

The website will automatically send attendance reports to **karlandreibundalian@gmail.com** every 15 minutes when enabled.

## Quick Setup with EmailJS (Free)

### Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Create an Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. For Gmail:
   - Click "Connect Account"
   - Sign in with your Google account
   - Allow EmailJS to send emails on your behalf
5. Give your service a name (e.g., "Attendance Reports")
6. Click "Create Service"
7. **Copy the Service ID** (you'll need this later)

### Step 3: Create an Email Template

1. Go to **Email Templates** in the EmailJS dashboard
2. Click "Create New Template"
3. Use this template content:

```
Subject: {{subject}}

Attendance Report
================

Generated: {{report_date}} at {{report_time}}

STATISTICS
----------
Present Today: {{present_today}}
This Week: {{week_total}}
This Month: {{month_total}}
Total Users: {{total_users}}

RECENT ACTIVITY
---------------
{{recent_records}}

---
This is an automated report from your Biometric Attendance System.
```

4. Set the recipient to: `{{to_email}}`
5. Save the template and **copy the Template ID**

### Step 4: Get Your Public Key

1. In EmailJS dashboard, go to **Account** > **General**
2. Find your **Public Key** and copy it

### Step 5: Update the Code

1. Open `email-functions.js` in a text editor
2. Find line 14: `emailjs.init('YOUR_PUBLIC_KEY');`
3. Replace `YOUR_PUBLIC_KEY` with your actual public key
4. Find line 133: `await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailParams);`
5. Replace `YOUR_SERVICE_ID` with your Service ID
6. Replace `YOUR_TEMPLATE_ID` with your Template ID
7. Save the file

### Step 6: Enable Automated Reports

1. Open the website in your browser
2. Go to **Settings** tab
3. Your email (karlandreibundalian@gmail.com) is already pre-filled
4. Click **Send Test Email** to verify setup
5. If successful, check the box "Enable automated reports every 15 minutes"
6. Click **Save Email Settings**

## Email Report Content

Each email will include:
- **Date and time** of the report
- **Present today**: Number of unique users who checked in
- **This week**: Total attendance records this week
- **This month**: Total attendance records this month  
- **Total users**: Number of registered users
- **Recent activity**: Last 10 attendance records with names, status, and timestamps

## Troubleshooting

### "EmailJS is not configured yet" Error

- Make sure you replaced `YOUR_PUBLIC_KEY`, `YOUR_SERVICE_ID`, and `YOUR_TEMPLATE_ID` in `email-functions.js`
- Refresh the browser page after saving changes

### "Failed to send email" Error

1. **Check Service ID and Template ID**: Make sure they match exactly (case-sensitive)
2. **Verify email template**: The template variables must match the ones in the code
3. **Check EmailJS dashboard**: View the Email Log to see detailed error messages
4. **Monthly limit**: Free EmailJS accounts have 200 emails/month limit

### Emails Not Arriving

1. Check spam/junk folder
2. Verify the email address in Settings is correct
3. Look for EmailJS service restrictions
4. Check browser console (F12) for errors

## Advanced: Custom Email Provider

If you want to use a different email service (SendGrid, Mailgun, etc.):

1. Replace the EmailJS code in `email-functions.js`
2. Implement your own `sendEmail()` function
3. Keep the scheduler logic (`startEmailScheduler()` function)

## Scheduler Details

- **Interval**: 15 minutes (900,000 milliseconds)
- **Starts**: When you check "Enable automated reports"
- **Stops**: When you uncheck the box
- **Persists**: Settings are saved in browser localStorage
- **First email**: Sent after the first 15-minute interval (not immediately)

To change the interval, edit line 170 in `email-functions.js`:
```javascript
}, 15 * 60 * 1000); // Change 15 to desired minutes
```

## Security Note

- Your EmailJS public key is safe to include in client-side code
- EmailJS handles authentication and rate limiting
- Never share your EmailJS private key or password

## Support

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Email Log: View sent/failed emails in your dashboard
- Browser Console: Press F12 to view error messages
