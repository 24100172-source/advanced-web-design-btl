const db = require('../config/db');

class User {
    // Tìm người dùng theo số điện thoại
    static async findByPhone(phone) {
        const [rows] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);
        return rows.length > 0 ? rows[0] : null; // Trả về user đầu tiên hoặc null nếu không thấy
    }

    // Thêm người dùng mới vào Database
    static async create(userData) {
        const { fullname, phone, email, hashedPassword } = userData;
        return await db.query(
            "INSERT INTO users (fullname, phone, email, password) VALUES (?, ?, ?, ?)",
            [fullname, phone, email || null, hashedPassword]
        );
    }
}

module.exports = User;