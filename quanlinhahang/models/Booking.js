const db = require('../config/db');

class Booking {
    // 1. Tạo đơn đặt bàn mới (Dùng cho cả Khách hàng & MainController)
    static async create(bookingData) {
        const { name, phone, email, date, time, guests, notes } = bookingData;
        const query = `
            INSERT INTO bookings (fullname, phone, email, booking_date, booking_time, guests_count, status, note, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
        `;
        return await db.query(query, [name, phone, email || null, date, time, guests, notes || null]);
    }

    // 2. Lấy danh sách đặt bàn 
    static async getAll(filterDate = null) {
        let sql = 'SELECT * FROM bookings';
        let params = [];

        if (filterDate) {
            sql += ' WHERE booking_date = ?';
            params.push(filterDate);
        }
        sql += ' ORDER BY created_at DESC';

        const [rows] = await db.query(sql, params);
        return rows;
    }

    // 3. Cập nhật trạng thái đặt bàn (Dùng cho Admin)
    static async updateStatus(id, status) {
        return await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    }

    // 4. Xóa lịch đặt bàn (Dùng cho Admin)
    static async delete(id) {
        return await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    }
}

module.exports = Booking;