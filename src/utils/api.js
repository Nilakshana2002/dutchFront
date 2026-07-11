const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helpers
const authHeaders = () => {
    const userInfo = localStorage.getItem('userInfo');
    let token = null;
    if (userInfo) {
        try {
            token = JSON.parse(userInfo).token;
        } catch (e) {}
    }
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
};

// Auth
export async function registerUser(payload) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function loginUser(payload) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function googleSignIn(payload) {
    const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function getUserProfile() {
    const res = await fetch(`${API_URL}/auth/profile`, {
        headers: authHeaders()
    });
    return handleResponse(res);
}

export async function updateUserProfile(payload) {
    const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function forgotPassword(payload) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function verifyOTP(payload) {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function resetPassword(payload) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

// Admin: Dashboard
export async function fetchDashboardStats() {
    const res = await fetch(`${API_URL}/admin/stats`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchMonthlyRevenue(year) {
    const res = await fetch(`${API_URL}/admin/revenue/monthly?year=${year || new Date().getFullYear()}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchAiSummary() {
    const res = await fetch(`${API_URL}/ai/summary`, { headers: authHeaders() });
    return handleResponse(res);
}

// Admin: Users
export async function fetchUsers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/users?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchUserById(id) {
    const res = await fetch(`${API_URL}/admin/users/${id}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createUser(payload) {
    const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateUser(id, payload) {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteUser(id) {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// Admin: Rooms 
export async function fetchRooms(params = {}) {
    try {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`${API_URL}/admin/rooms?${qs}`, { headers: authHeaders() });
        return await handleResponse(res);
    } catch (error) {
        console.error("Fetch Rooms API Error:", error);
        throw error;
    }
}

export async function createRoom(payload) {
    try {
        const res = await fetch(`${API_URL}/admin/rooms`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error("Create Room API Error:", error);
        throw error;
    }
}

export async function updateRoom(id, payload) {
    try {
        const res = await fetch(`${API_URL}/admin/rooms/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error("Update Room API Error:", error);
        throw error;
    }
}

export async function updateRoomStatusByNumber(roomNumber, status) {
    try {
        const res = await fetch(`${API_URL}/admin/rooms/number/${roomNumber}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status }),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error("Update Room Status API Error:", error);
        throw error;
    }
}

export async function deleteRoom(id) {
    try {
        const res = await fetch(`${API_URL}/admin/rooms/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error("Delete Room API Error:", error);
        throw error;
    }
}

export async function fetchRoomsByCategory(category, packageType, checkIn, checkOut) {
    let url = `${API_URL}/rooms/category/${category}?`;
    if (packageType) url += `package=${packageType}&`;
    if (checkIn) url += `checkIn=${checkIn}&`;
    if (checkOut) url += `checkOut=${checkOut}&`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch rooms');
    return data;
}

export async function checkRoomAvailability(roomId, checkIn, checkOut) {
    const response = await fetch(`${API_URL}/rooms/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, checkIn, checkOut }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to check availability');
    return data;
}

export async function fetchGalleryRooms() {
    const res = await fetch(`${API_URL}/rooms`);
    return handleResponse(res);
}

// Room Features
export async function fetchRoomFeatures() {
    try {
        const res = await fetch(`${API_URL}/room-features`, { headers: authHeaders() });
        return await handleResponse(res);
    } catch (error) {
        console.error("Fetch Room Features API Error:", error);
        throw error;
    }
}

export async function createRoomFeature(payload) {
    try {
        const res = await fetch(`${API_URL}/room-features`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error("Create Room Feature API Error:", error);
        throw error;
    }
}

// Packages
export async function fetchPackagesByType(type) {
    const res = await fetch(`${API_URL}/packages?type=${type}`);
    return handleResponse(res);
}

export async function fetchAdminPackages(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/packages?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createPackage(payload) {
    const res = await fetch(`${API_URL}/admin/packages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updatePackage(id, payload) {
    const res = await fetch(`${API_URL}/admin/packages/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deletePackage(id) {
    const res = await fetch(`${API_URL}/admin/packages/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// Admin: Bookings
export async function fetchBookings(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/bookings?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function updateBookingStatus(id, status) {
    const res = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(res);
}

// Public: Bookings 
export async function createBooking(payload) {
    const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function confirmBookingPayment(bookingId, transactionId) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
    });
    return handleResponse(res);
}

// Fetch PayHere parameters for a pending booking
export async function fetchPayHereParams(bookingId) {
    const res = await fetch(`${API_URL}/event-bookings/${bookingId}/payhere-params`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
}




// Admin: Staff
export async function fetchStaff(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/staff?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createStaff(payload) {
    const res = await fetch(`${API_URL}/admin/staff`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateStaff(id, payload) {
    const res = await fetch(`${API_URL}/admin/staff/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteStaff(id) {
    const res = await fetch(`${API_URL}/admin/staff/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

export async function getEmployeeQR(id) {
    const res = await fetch(`${API_URL}/admin/staff/${id}/qr`, { headers: authHeaders() });
    return handleResponse(res);
}

// Admin: Attendance
export async function scanAttendance(token) {
    const res = await fetch(`${API_URL}/admin/attendance/scan`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ token }),
    });
    return handleResponse(res);
}

export async function fetchAttendance(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/attendance?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchTodayAttendance() {
    const res = await fetch(`${API_URL}/admin/attendance/today`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchAttendanceReport(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/attendance/report?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function updateAttendance(id, payload) {
    const res = await fetch(`${API_URL}/admin/attendance/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

// Admin: Payroll
export async function fetchPayroll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/payroll?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

// Admin: Reports
export async function fetchReportSummary(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/reports/summary?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchMonthlyReport(year) {
    const res = await fetch(`${API_URL}/admin/reports/monthly?year=${year}`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
}

export async function fetchBookingReport({ from, to }) {
    const res = await fetch(`${API_URL}/admin/reports/bookings?from=${from || ''}&to=${to || ''}`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// Admin: Notifications
export async function fetchNotifications() {
    const res = await fetch(`${API_URL}/admin/notifications`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function markNotificationRead(id) {
    const res = await fetch(`${API_URL}/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: authHeaders()
    });
    return handleResponse(res);
}

export async function markAllNotificationsRead() {
    const res = await fetch(`${API_URL}/admin/notifications/read-all`, {
        method: 'PUT',
        headers: authHeaders()
    });
    return handleResponse(res);
}

export async function deleteNotification(id) {
    const res = await fetch(`${API_URL}/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(res);
}

export async function deleteReadNotifications() {
    const res = await fetch(`${API_URL}/admin/notifications/delete-read`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(res);
}

// Admin: Feedbacks/Contacts
export async function fetchFeedbacks(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/contacts?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function updateFeedbackStatus(id, status) {
    const res = await fetch(`${API_URL}/admin/contacts/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
}

export async function deleteFeedback(id) {
    const res = await fetch(`${API_URL}/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(res);
}

// Orders
export async function createOrder(payload) {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

// Admin: Orders
export async function fetchAdminOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/orders?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function updateAdminOrderStatus(id, payload) {
    const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function fetchOrderReport(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/orders/report?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function confirmOrderPayment(id) {
    const res = await fetch(`${API_URL}/orders/${id}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
}

// Staff Self Management
export async function fetchMyProfile() {
    const res = await fetch(`${API_URL}/staff/profile`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function updateMyProfile(payload) {
    const res = await fetch(`${API_URL}/staff/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(res);
}

export async function fetchMyAttendance(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/staff/attendance?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchMyLastPayroll() {
    const res = await fetch(`${API_URL}/staff/payroll/last`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchMyQRToken() {
    const res = await fetch(`${API_URL}/staff/my-qr-token`, { headers: authHeaders() });
    return handleResponse(res);
}

// Foods
export async function fetchFoods() {
    const res = await fetch(`${API_URL}/foods`);
    return handleResponse(res);
}

export async function createFood(payload) {
    const res = await fetch(`${API_URL}/foods`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateFood(id, payload) {
    const res = await fetch(`${API_URL}/foods/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteFood(id) {
    const res = await fetch(`${API_URL}/foods/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// Admin: Event Bookings
export async function fetchAdminEventBookings(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/events?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function updateEventBookingStatus(id, status) {
    const res = await fetch(`${API_URL}/admin/events/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(res);
}

export async function updateEventPaymentStatus(id, paymentStatus) {
    const res = await fetch(`${API_URL}/admin/events/${id}/payment`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ paymentStatus }),
    });
    return handleResponse(res);
}

export async function fetchMyEventBookings() {
    const res = await fetch(`${API_URL}/event-bookings/my-bookings`, { headers: authHeaders() });
    return handleResponse(res);
}

// Event Features (Decoration, Food, Addons)
export async function fetchEventFeatures(category) {
    const qs = category && category !== 'all' ? `?category=${category}` : '';
    const res = await fetch(`${API_URL}/event-features${qs}`);
    return handleResponse(res);
}

export async function fetchAdminEventFeatures(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/event-features?${qs}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createEventFeature(payload) {
    const res = await fetch(`${API_URL}/admin/event-features`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateEventFeature(id, payload) {
    const res = await fetch(`${API_URL}/admin/event-features/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteEventFeature(id) {
    const res = await fetch(`${API_URL}/admin/event-features/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// Inventory
export async function fetchInventory() {
    const res = await fetch(`${API_URL}/inventory`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createInventoryItem(payload) {
    const res = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateInventoryItem(id, payload) {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteInventoryItem(id) {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

export async function adjustStock(id, payload) {
    const res = await fetch(`${API_URL}/inventory/${id}/adjust`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function fetchStockLogs(id) {
    const res = await fetch(`${API_URL}/inventory/${id}/logs`, { headers: authHeaders() });
    return handleResponse(res);
}

// Suppliers
export async function fetchSuppliers() {
    const res = await fetch(`${API_URL}/inventory/suppliers`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createSupplier(payload) {
    const res = await fetch(`${API_URL}/inventory/suppliers`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updateSupplier(id, payload) {
    const res = await fetch(`${API_URL}/inventory/suppliers/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteSupplier(id) {
    const res = await fetch(`${API_URL}/inventory/suppliers/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

export async function fetchAllStockLogs() {
    const res = await fetch(`${API_URL}/inventory/logs/all`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ─── Payroll ────────────────────────────────────────────────────────────────

export async function fetchPayrollDashboard() {
    const res = await fetch(`${API_URL}/payroll/dashboard`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchPayrollSettings() {
    const res = await fetch(`${API_URL}/payroll/settings`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function updatePayrollSettings(data) {
    const res = await fetch(`${API_URL}/payroll/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function fetchPayrolls(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/payroll${q ? `?${q}` : ''}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function previewPayrollAPI(data) {
    const res = await fetch(`${API_URL}/payroll/preview`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function generatePayrollAPI(data) {
    const res = await fetch(`${API_URL}/payroll/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function fetchPayrollById(id) {
    const res = await fetch(`${API_URL}/payroll/${id}`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function updatePayrollStatusAPI(id, status, notes) {
    const res = await fetch(`${API_URL}/payroll/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status, notes }),
    });
    return handleResponse(res);
}

// Offers
export async function fetchOffers() {
    const res = await fetch(`${API_URL}/offers`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function fetchActiveOffers() {
    const res = await fetch(`${API_URL}/offers/active`);
    return handleResponse(res);
}

export async function createOffer(payload) {
    const res = await fetch(`${API_URL}/offers`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function updatePayrollRecord(id, data) {
    const res = await fetch(`${API_URL}/payroll/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

export async function updateOffer(id, payload) {
    const res = await fetch(`${API_URL}/offers/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deletePayrollRecord(id) {
    const res = await fetch(`${API_URL}/payroll/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

export async function deleteOffer(id) {
    const res = await fetch(`${API_URL}/offers/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

export async function fetchEmployeePayrollHistory(employeeId) {
    const res = await fetch(`${API_URL}/payroll/employee/${employeeId}`, { headers: authHeaders() });
    return handleResponse(res);
}
