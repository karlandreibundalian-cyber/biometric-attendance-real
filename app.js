// Main Application Logic

// Global state
let currentView = 'dashboard';
let attendanceData = [];
let usersData = [];
let realtimeListeners = [];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initFirebase();
    initModals();
    initFilters();
    initReports();
    initEmailJS();
    initSettings();
    loadDemoUsers(); // Load demo users for immediate demo
});

// ===== Navigation =====
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);

            // Update active state
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchView(view) {
    currentView = view;

    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Show selected view
    const viewElement = document.getElementById(`${view}View`);
    if (viewElement) {
        viewElement.classList.add('active');
    }
}

// ===== Firebase Integration =====
function initFirebase() {
    const statusElement = document.getElementById('connectionStatus');
    const statusDot = statusElement.querySelector('.status-dot');
    const statusText = statusElement.querySelector('.status-text');

    try {
        // Check if Firebase is properly configured
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }

        // Check if database is configured
        const dbRef = database.ref('.info/connected');
        dbRef.on('value', (snapshot) => {
            if (snapshot.val() === true) {
                statusDot.classList.add('connected');
                statusText.textContent = 'Connected';

                // Load initial data
                loadAttendanceData();
                loadUsersData();
                setupRealtimeListeners();
            } else {
                statusDot.classList.remove('connected');
                statusText.textContent = 'Disconnected';
            }
        });

    } catch (error) {
        console.error('Firebase initialization error:', error);
        statusText.textContent = 'Config Error';

        // Show demo data if Firebase is not configured
        loadDemoData();
    }
}

function setupRealtimeListeners() {
    // Listen for new attendance records
    const attendanceRef = database.ref('attendance');

    const listener = attendanceRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Update UI with new record
            updateDashboardStats();
            addActivityItem(data);
        }
    });

    realtimeListeners.push({ ref: attendanceRef, event: 'child_added', listener });
}

// ===== Data Loading =====
async function loadAttendanceData() {
    try {
        const snapshot = await database.ref('attendance').once('value');
        attendanceData = [];

        snapshot.forEach((childSnapshot) => {
            const userId = childSnapshot.key;
            const userRecords = childSnapshot.val();

            Object.keys(userRecords).forEach(timestamp => {
                const record = userRecords[timestamp];
                attendanceData.push({
                    id: `${userId}_${timestamp}`,
                    userId: record.userId || userId,
                    name: record.name || 'Unknown',
                    status: record.status || 'check-in',
                    timestamp: parseInt(timestamp),
                    department: record.department || 'N/A'
                });
            });
        });

        // Sort by timestamp (newest first)
        attendanceData.sort((a, b) => b.timestamp - a.timestamp);

        updateDashboardStats();
        renderAttendanceTable();
        renderRecentActivity();

    } catch (error) {
        console.error('Error loading attendance data:', error);
        loadDemoData();
    }
}

async function loadUsersData() {
    try {
        const snapshot = await database.ref('users').once('value');
        usersData = [];

        snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            usersData.push({
                id: childSnapshot.key,
                ...userData
            });
        });

        renderUsersGrid();
        updateDepartmentFilter();

    } catch (error) {
        console.error('Error loading users data:', error);
        loadDemoUsers();
    }
}

// ===== Demo Data =====
function loadDemoData() {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);

    attendanceData = [
        { id: '1', userId: 'user001', name: 'John Doe', status: 'check-in', timestamp: now - 3600000, department: 'Engineering' },
        { id: '2', userId: 'user002', name: 'Jane Smith', status: 'check-in', timestamp: now - 7200000, department: 'Marketing' },
        { id: '3', userId: 'user003', name: 'Mike Johnson', status: 'check-out', timestamp: now - 10800000, department: 'Sales' },
        { id: '4', userId: 'user004', name: 'Sarah Williams', status: 'check-in', timestamp: today + 28800000, department: 'Engineering' },
        { id: '5', userId: 'user005', name: 'David Brown', status: 'check-in', timestamp: today + 30600000, department: 'HR' },
    ];

    updateDashboardStats();
    renderAttendanceTable();
    renderRecentActivity();
}

function loadDemoUsers() {
    usersData = [
        { id: 'user001', name: 'John Doe', fingerprintId: '101', department: 'Engineering', email: 'john@example.com' },
        { id: 'user002', name: 'Jane Smith', fingerprintId: '102', department: 'Marketing', email: 'jane@example.com' },
        { id: 'user003', name: 'Mike Johnson', fingerprintId: '103', department: 'Sales', email: 'mike@example.com' },
        { id: 'user004', name: 'Sarah Williams', fingerprintId: '104', department: 'Engineering', email: 'sarah@example.com' },
        { id: 'user005', name: 'David Brown', fingerprintId: '105', department: 'HR', email: 'david@example.com' },
    ];

    renderUsersGrid();
}

// ===== Dashboard Stats =====
function updateDashboardStats() {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Count today's unique check-ins
    const todayRecords = attendanceData.filter(r => r.timestamp >= today);
    const presentToday = new Set(todayRecords.filter(r => r.status === 'check-in').map(r => r.userId)).size;

    // Count this week's records
    const weekRecords = attendanceData.filter(r => r.timestamp >= weekAgo).length;

    // Count this month's records
    const monthRecords = attendanceData.filter(r => r.timestamp >= monthAgo).length;

    // Update UI
    document.getElementById('statPresentToday').textContent = presentToday;
    document.getElementById('statThisWeek').textContent = weekRecords;
    document.getElementById('statThisMonth').textContent = monthRecords;
    document.getElementById('statTotalUsers').textContent = usersData.length;
}

// ===== Recent Activity =====
function renderRecentActivity() {
    const container = document.getElementById('recentActivityList');
    const recentRecords = attendanceData.slice(0, 10);

    if (recentRecords.length === 0) {
        container.innerHTML = '<div class="loading-state"><p>No recent activity</p></div>';
        return;
    }

    container.innerHTML = recentRecords.map(record => `
        <div class="activity-item">
            <div class="activity-icon">${getInitials(record.name)}</div>
            <div class="activity-details">
                <div class="activity-name">${record.name}</div>
                <div class="activity-meta">
                    <span class="status-badge ${record.status}">${formatStatus(record.status)}</span>
                </div>
            </div>
            <div class="activity-time">${formatTimeAgo(record.timestamp)}</div>
        </div>
    `).join('');
}

function addActivityItem(record) {
    // Add new activity to the top of the list
    const container = document.getElementById('recentActivityList');
    const activityHTML = `
        <div class="activity-item" style="animation: slideIn 0.3s ease;">
            <div class="activity-icon">${getInitials(record.name)}</div>
            <div class="activity-details">
                <div class="activity-name">${record.name}</div>
                <div class="activity-meta">
                    <span class="status-badge ${record.status}">${formatStatus(record.status)}</span>
                </div>
            </div>
            <div class="activity-time">Just now</div>
        </div>
    `;

    container.insertAdjacentHTML('afterbegin', activityHTML);

    // Keep only 10 most recent
    const items = container.querySelectorAll('.activity-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

// Refresh activity button
document.getElementById('refreshActivity')?.addEventListener('click', () => {
    renderRecentActivity();
});

// ===== Attendance Table =====
function renderAttendanceTable(filteredData = null) {
    const tbody = document.getElementById('attendanceTableBody');
    const data = filteredData || attendanceData;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No attendance records found</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(record => `
        <tr>
            <td>${record.name}</td>
            <td>${record.userId}</td>
            <td><span class="status-badge ${record.status}">${formatStatus(record.status)}</span></td>
            <td>${formatDateTime(record.timestamp)}</td>
            <td>${record.department}</td>
        </tr>
    `).join('');
}

// ===== Users Grid =====
function renderUsersGrid(filteredUsers = null) {
    const container = document.getElementById('usersGrid');
    const data = filteredUsers || usersData;

    if (data.length === 0) {
        container.innerHTML = '<div class="loading-state"><p>No users found</p></div>';
        return;
    }

    container.innerHTML = data.map(user => `
        <div class="user-card">
            <div class="user-avatar">${getInitials(user.name)}</div>
            <div class="user-name">${user.name}</div>
            <div class="user-info">ID: ${user.fingerprintId}</div>
            <div class="user-info">${user.department || 'N/A'}</div>
            <div class="user-info">${user.email || 'No email'}</div>
            <div class="user-actions">
                <button class="btn btn-secondary btn-sm" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="deleteUser('${user.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// ===== Modals =====
function initModals() {
    const addUserBtn = document.getElementById('addUserBtn');
    const modal = document.getElementById('addUserModal');
    const closeBtn = document.getElementById('closeAddUserModal');
    const cancelBtn = document.getElementById('cancelAddUser');
    const saveBtn = document.getElementById('saveAddUser');

    addUserBtn?.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
        clearUserForm();
    });

    cancelBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
        clearUserForm();
    });

    saveBtn?.addEventListener('click', () => {
        saveNewUser();
    });

    // Close modal when clicking outside
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            clearUserForm();
        }
    });
}

async function saveNewUser() {
    const name = document.getElementById('userName').value.trim();
    const fingerprintId = document.getElementById('userFingerprint').value.trim();
    const department = document.getElementById('userDepartment').value.trim();
    const email = document.getElementById('userEmail').value.trim();

    if (!name || !fingerprintId) {
        alert('Please fill in all required fields');
        return;
    }

    const userId = 'user' + Date.now();
    const userData = {
        name,
        fingerprintId,
        department: department || 'N/A',
        email: email || ''
    };

    try {
        // Try to save to Firebase
        await database.ref(`users/${userId}`).set(userData);

        // Reload users data
        await loadUsersData();

        // Close modal
        document.getElementById('addUserModal').classList.remove('active');
        clearUserForm();

        alert('User added successfully!');

    } catch (error) {
        console.error('Error saving user:', error);

        // If Firebase is not configured, add to local array
        usersData.push({ id: userId, ...userData });
        renderUsersGrid();

        document.getElementById('addUserModal').classList.remove('active');
        clearUserForm();

        alert('User added successfully (demo mode)!');
    }
}

function clearUserForm() {
    document.getElementById('userName').value = '';
    document.getElementById('userFingerprint').value = '';
    document.getElementById('userDepartment').value = '';
    document.getElementById('userEmail').value = '';
}

function editUser(userId) {
    alert(`Edit user: ${userId}\n(Feature to be implemented)`);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            database.ref(`users/${userId}`).remove();
            usersData = usersData.filter(u => u.id !== userId);
            renderUsersGrid();
        } catch (error) {
            usersData = usersData.filter(u => u.id !== userId);
            renderUsersGrid();
        }
    }
}

// ===== Filters & Search =====
function initFilters() {
    // Attendance search
    const searchAttendance = document.getElementById('searchAttendance');
    searchAttendance?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = attendanceData.filter(record =>
            record.name.toLowerCase().includes(query) ||
            record.userId.toLowerCase().includes(query)
        );
        renderAttendanceTable(filtered);
    });

    // Attendance status filter
    const filterStatus = document.getElementById('filterStatus');
    filterStatus?.addEventListener('change', (e) => {
        const status = e.target.value;
        if (status === 'all') {
            renderAttendanceTable();
        } else {
            const filtered = attendanceData.filter(record => record.status === status);
            renderAttendanceTable(filtered);
        }
    });

    // Users search
    const searchUsers = document.getElementById('searchUsers');
    searchUsers?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = usersData.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.department.toLowerCase().includes(query)
        );
        renderUsersGrid(filtered);
    });

    // Export attendance
    const exportBtn = document.getElementById('exportAttendance');
    exportBtn?.addEventListener('click', () => {
        exportToCSV(attendanceData, 'attendance_records.csv');
    });
}

// ===== Reports =====
function initReports() {
    const generateBtn = document.getElementById('generateReport');

    generateBtn?.addEventListener('click', () => {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        const department = document.getElementById('reportDepartment').value;

        if (!startDate || !endDate) {
            alert('Please select start and end dates');
            return;
        }

        generateReport(startDate, endDate, department);
    });

    const exportReportBtn = document.getElementById('exportReport');
    exportReportBtn?.addEventListener('click', () => {
        const reportData = attendanceData; // Use filtered data from report
        exportToCSV(reportData, 'report.csv');
    });
}

function updateDepartmentFilter() {
    const select = document.getElementById('reportDepartment');
    if (!select) return;

    const departments = [...new Set(usersData.map(u => u.department).filter(d => d))];

    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        select.appendChild(option);
    });
}

function generateReport(startDate, endDate, department) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    let filtered = attendanceData.filter(r =>
        r.timestamp >= start && r.timestamp <= end
    );

    if (department !== 'all') {
        filtered = filtered.filter(r => r.department === department);
    }

    const resultsCard = document.getElementById('reportResults');
    const resultsContent = document.getElementById('reportContent');

    resultsCard.style.display = 'block';

    resultsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-content">
                    <div class="stat-label">Total Records</div>
                    <div class="stat-value">${filtered.length}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-content">
                    <div class="stat-label">Unique Users</div>
                    <div class="stat-value">${new Set(filtered.map(r => r.userId)).size}</div>
                </div>
            </div>
        </div>
        <div class="table-container" style="margin-top: 1rem;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Date & Time</th>
                        <th>Department</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(r => `
                        <tr>
                            <td>${r.name}</td>
                            <td><span class="status-badge ${r.status}">${formatStatus(r.status)}</span></td>
                            <td>${formatDateTime(r.timestamp)}</td>
                            <td>${r.department}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ===== Utility Functions =====
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function formatStatus(status) {
    return status.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
}

function exportToCSV(data, filename) {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['Name', 'User ID', 'Status', 'Date & Time', 'Department'];
    const rows = data.map(record => [
        record.name,
        record.userId,
        record.status,
        formatDateTime(record.timestamp),
        record.department
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
