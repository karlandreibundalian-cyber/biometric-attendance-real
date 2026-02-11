
// ===== Email Functionality =====
let emailScheduler = null;
let emailSettings = {
    recipient: 'karlandreibundalian@gmail.com',
    enabled: false,
    lastSent: null
};

function initEmailJS() {
    // Initialize EmailJS with public key
    // You can sign up for free at https://www.emailjs.com/
    // For now, we'll use a demo setup message
    emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key

    // Load saved settings from localStorage
    const saved = localStorage.getItem('emailSettings');
    if (saved) {
        emailSettings = JSON.parse(saved);
        document.getElementById('emailRecipient').value = emailSettings.recipient;
        document.getElementById('enableEmailReports').checked = emailSettings.enabled;

        if (emailSettings.enabled) {
            startEmailScheduler();
        }
    }
}

function initSettings() {
    // Save email settings
    document.getElementById('saveEmailSettings')?.addEventListener('click', saveEmailSettings);

    // Test email
    document.getElementById('testEmail')?.addEventListener('click', sendTestEmail);

    // Enable/disable email reports
    document.getElementById('enableEmailReports')?.addEventListener('change', (e) => {
        if (e.target.checked) {
            if (!validateEmailSetup()) return;
            emailSettings.enabled = true;
            startEmailScheduler();
        } else {
            emailSettings.enabled = false;
            stopEmailScheduler();
        }
        updateEmailStatus();
    });

    // Show enrollment code modal
    document.getElementById('showEnrollmentCode')?.addEventListener('click', showEnrollmentCode);
}

function validateEmailSetup() {
    const apiKey = 'YOUR_PUBLIC_KEY'; // This should be replaced with actual key
    if (apiKey === 'YOUR_PUBLIC_KEY') {
        alert('EmailJS is not configured yet!\n\n' +
            'To enable email reports:\n' +
            '1. Sign up at https://www.emailjs.com/\n' +
            '2. Create an email service and template\n' +
            '3. Replace YOUR_PUBLIC_KEY in app.js with your public key\n' +
            '4. Update the service and template IDs in sendEmail() function');
        document.getElementById('enableEmailReports').checked = false;
        return false;
    }
    return true;
}

function saveEmailSettings() {
    const recipient = document.getElementById('emailRecipient').value.trim();

    if (!recipient || !recipient.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    emailSettings.recipient = recipient;
    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));

    alert('Email settings saved successfully!');
    updateEmailStatus();
}

function sendTestEmail() {
    const recipient = document.getElementById('emailRecipient').value.trim();

    if (!recipient || !recipient.includes('@')) {
        alert('Please enter a valid email address first');
        return;
    }

    sendEmail(true);
}

async function sendEmail(isTest = false) {
    const recipient = emailSettings.recipient;

    // Generate report data
    const today = new Date();
    const reportData = {
        date: today.toLocaleDateString(),
        time: today.toLocaleTimeString(),
        presentToday: document.getElementById('statPresentToday')?.textContent || '0',
        weekTotal: document.getElementById('statThisWeek')?.textContent || '0',
        monthTotal: document.getElementById('statThisMonth')?.textContent || '0',
        totalUsers: document.getElementById('statTotalUsers')?.textContent || '0',
        recentRecords: attendanceData.slice(0, 10).map(r =>
            `${r.name} - ${formatStatus(r.status)} - ${formatDateTime(r.timestamp)}`
        ).join('\n')
    };

    const emailParams = {
        to_email: recipient,
        subject: isTest ? 'Test: Attendance Report' : 'Automated Attendance Report',
        report_date: reportData.date,
        report_time: reportData.time,
        present_today: reportData.presentToday,
        week_total: reportData.weekTotal,
        month_total: reportData.monthTotal,
        total_users: reportData.totalUsers,
        recent_records: reportData.recentRecords
    };

    try {
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your EmailJS IDs
        await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailParams);

        emailSettings.lastSent = new Date().toISOString();
        localStorage.setItem('emailSettings', JSON.stringify(emailSettings));

        if (isTest) {
            alert('Test email sent successfully to ' + recipient);
        }

        updateEmailStatus();
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Failed to send email:', error);

        if (isTest) {
            alert('Failed to send email. Please check:\n' +
                '1. EmailJS is properly configured\n' +
                '2. Service ID and Template ID are correct\n' +
                '3. Email template is set up correctly\n\n' +
                'Error: ' + error.text);
        }
    }
}

function startEmailScheduler() {
    // Stop existing scheduler if any
    stopEmailScheduler();

    // Send report every 15 minutes (900000 milliseconds)
    emailScheduler = setInterval(() => {
        sendEmail(false);
    }, 15 * 60 * 1000); // 15 minutes

    updateEmailStatus();
    console.log('Email scheduler started - reports will be sent every 15 minutes');
}

function stopEmailScheduler() {
    if (emailScheduler) {
        clearInterval(emailScheduler);
        emailScheduler = null;
    }
    updateEmailStatus();
    console.log('Email scheduler stopped');
}

function updateEmailStatus() {
    const statusDiv = document.getElementById('emailStatus');
    const statusText = document.getElementById('emailStatusText');
    const lastSentText = document.getElementById('emailLastSent');

    if (!statusDiv) return;

    statusDiv.style.display = 'block';

    if (emailSettings.enabled) {
        statusText.textContent = '🟢 Active - Reports sending every 15 minutes';
        statusText.style.color = 'var(--success)';
    } else {
        statusText.textContent = '🔴 Inactive';
        statusText.style.color = 'var(--text-muted)';
    }

    if (emailSettings.lastSent) {
        const lastSent = new Date(emailSettings.lastSent);
        lastSentText.textContent = `Last sent: ${lastSent.toLocaleString()}`;
    } else {
        lastSentText.textContent = 'No reports sent yet';
    }
}

function showEnrollmentCode() {
    const codeContent = `// ESP32 R307 Fingerprint Enrollment Code
#include <Adafruit_Fingerprint.h>

SoftwareSerial mySerial(16, 17); // RX, TX
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void setup() {
  Serial.begin(115200);
  mySerial.begin(57600);
  
  if (finger.verifyPassword()) {
    Serial.println("Fingerprint sensor found!");
  }
}

void loop() {
  Serial.println("Enter ID # (1-127):");
  int id = readNumber();
  enrollFingerprint(id);
}

// Full code available in: esp32-enrollment.ino`;

    const modal = `
        <div class="modal active" id="codeModal" style="z-index: 2000;">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>ESP32 Enrollment Code</h3>
                    <button class="modal-close" onclick="document.getElementById('codeModal').remove()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                        This is a preview of the enrollment code. The full file is located at:
                        <code>esp32-enrollment.ino</code>
                    </p>
                    <pre style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; max-height: 400px;"><code>${codeContent}</code></pre>
                    <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                        <strong>Instructions:</strong><br>
                        1. Install Adafruit Fingerprint library in Arduino IDE<br>
                        2. Upload this code to your ESP32<br>
                        3. Open Serial Monitor<br>
                        4. Enter the fingerprint ID when prompted<br>
                        5. Follow on-screen instructions to scan finger twice
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="document.getElementById('codeModal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);

    // Close modal when clicking outside
    document.getElementById('codeModal').addEventListener('click', (e) => {
        if (e.target.id === 'codeModal') {
            e.target.remove();
        }
    });
}
