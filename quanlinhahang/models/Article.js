const db = require('../config/db');

class Article {
    // Lấy danh sách bài viết tin tức mới nhất
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM articles ORDER BY created_at DESC");
        return rows;
    }

    // Lấy chi tiết một bài viết theo ID
    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM articles WHERE id = ?", [id]);
        return rows.length > 0 ? rows[0] : null;
    }
}

module.exports = Article;