const db = require('../config/db');

class Category {
    // Lấy tất cả danh mục
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM categories ORDER BY id ASC");
        return rows;
    }
}

module.exports = Category;