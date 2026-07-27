const db = require('../config/db');

class Product {
    // 1. Tìm sản phẩm theo ID
    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    // 2. Lấy danh sách món ăn kèm tên danh mục (Dùng cho Admin)
    static async getAllWithCategory() {
        const query = `
            SELECT p.id, p.name, p.price, p.image_url, p.status, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    // 3. Lấy danh sách món bán chạy (Bestseller)
    static async getBestSellers() {
        const [rows] = await db.query("SELECT * FROM products WHERE is_bestseller = 1 AND status = 1");
        return rows;
    }

    // 4. Lấy món ăn theo danh mục và sắp xếp (Trang thực đơn)
    static async getFilteredMenu(categorySlug, sortOption) {
        let productsQuery = `
            SELECT p.* 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.status = 1
        `;
        let queryParams = [];

        if (categorySlug) {
            productsQuery += " AND c.slug = ?";
            queryParams.push(categorySlug);
        }

        if (sortOption === 'price_asc') {
            productsQuery += " ORDER BY p.price ASC"; 
        } else if (sortOption === 'price_desc') {
            productsQuery += " ORDER BY p.price DESC"; 
        } else {
            productsQuery += " ORDER BY p.id DESC"; 
        }

        const [rows] = await db.query(productsQuery, queryParams);
        return rows;
    }

    // 5. Tìm kiếm món ăn theo từ khóa
    static async searchByName(keyword) {
        const searchQuery = "SELECT * FROM products WHERE name LIKE ? AND status = 1";
        const [rows] = await db.query(searchQuery, [`%${keyword}%`]);
        return rows;
    }

    // 6. Thêm món ăn mới
    static async create(productData) {
        const { name, price, category_id, status, is_bestseller, image_url } = productData;
        const query = `
            INSERT INTO products (name, price, category_id, status, is_bestseller, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return await db.execute(query, [name, price, category_id, status, is_bestseller, image_url]);
    }

    // 7. Cập nhật món ăn
    static async update(id, productData) {
        const { name, price, category_id, status, is_bestseller, image_url } = productData;
        if (image_url) {
            const query = `
                UPDATE products 
                SET name = ?, price = ?, category_id = ?, status = ?, is_bestseller = ?, image_url = ? 
                WHERE id = ?
            `;
            return await db.execute(query, [name, price, category_id, status, is_bestseller, image_url, id]);
        } else {
            const query = `
                UPDATE products 
                SET name = ?, price = ?, category_id = ?, status = ?, is_bestseller = ? 
                WHERE id = ?
            `;
            return await db.execute(query, [name, price, category_id, status, is_bestseller, id]);
        }
    }

    // 8. Xóa món ăn
    static async delete(id) {
        return await db.execute('DELETE FROM products WHERE id = ?', [id]);
    }
}

module.exports = Product;