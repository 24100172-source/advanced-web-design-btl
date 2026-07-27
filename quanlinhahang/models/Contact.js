const db = require('../config/db');

class Contact {
    // 1. Lấy danh sách đánh giá/tin nhắn mới nhất (Đã sửa db.query và ORDER BY id)
    static async getLatestReviews(limit = 6) {
        const limitNum = parseInt(limit) || 6;
        const [rows] = await db.query(
            `SELECT * FROM contacts ORDER BY id DESC LIMIT ${limitNum}`
        );
        return rows;
    }

    // 2. Tạo tin nhắn liên hệ mới từ khách hàng
    static async create(contactData) {
        const { name, phone, subject, message } = contactData;
        const query = `
            INSERT INTO contacts (name, phone, subject, message, status) 
            VALUES (?, ?, ?, ?, 'unread')
        `;
        return await db.execute(query, [name, phone, subject, message]);
    }

    // 3. Lấy tất cả tin nhắn cho trang Quản lý của Admin
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM contacts ORDER BY id DESC');
        return rows;
    }

    // 4. Admin phản hồi tin nhắn khách hàng
    static async reply(id, replyMessage) {
        return await db.execute(
            'UPDATE contacts SET admin_reply = ?, status = "read" WHERE id = ?', 
            [replyMessage, id]
        );
    }

    // 5. Cập nhật trạng thái tin nhắn
    static async updateStatus(id, status) {
        return await db.execute(
            'UPDATE contacts SET status = ? WHERE id = ?', 
            [status, id]
        );
    }

    // 6. Xóa tin nhắn
    static async delete(id) {
        return await db.execute(
            'DELETE FROM contacts WHERE id = ?', 
            [id]
        );
    }
}

module.exports = Contact;