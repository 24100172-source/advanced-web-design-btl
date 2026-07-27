const db = require('../config/db');

class Admin {
    // Tìm admin theo số điện thoại
    static async findByPhone(phone) {
        const [rows] = await db.query('SELECT * FROM admins WHERE phone = ?', [phone]);
        return rows.length > 0 ? rows[0] : null;
    }
}

module.exports = Admin;