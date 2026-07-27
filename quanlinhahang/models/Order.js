const db = require('../config/db');

class Order {
    // 1. Tạo đơn hàng mới kèm danh sách món ăn chi tiết (Dùng cho Checkout / Khách đặt hàng)
    static async create(orderData, cartItems) {
        const { fullname, phone, payment_method, totalAmount, note } = orderData;
        
        // Thêm đơn hàng vào bảng orders
        const [orderResult] = await db.query(
            "INSERT INTO orders (fullname, phone, payment_method, total_amount, note) VALUES (?, ?, ?, ?, ?)",
            [fullname, phone, payment_method, totalAmount, note || null]
        );
        
        const orderId = orderResult.insertId;

        // Thêm từng sản phẩm vào bảng order_details
        for (const item of cartItems) {
            await db.query(
                "INSERT INTO order_details (order_id, product_id, price, quantity) VALUES (?, ?, ?, ?)",
                [orderId, item.id, item.price, item.quantity]
            );
        }

        return orderId;
    }

    // 2. Lấy danh sách đơn hàng có hỗ trợ lọc theo ngày (Dùng cho Admin)
    static async getAll(filterDate = null) {
        let query = 'SELECT * FROM orders';
        let queryParams = [];

        if (filterDate) {
            query += ' WHERE DATE(created_at) = ?';
            queryParams.push(filterDate);
        }

        query += ' ORDER BY id DESC';

        const [rows] = await db.execute(query, queryParams);
        return rows;
    }

    // 3. Cập nhật trạng thái đơn hàng (Dùng cho Admin)
    static async updateStatus(id, newStatus) {
        const query = 'UPDATE orders SET status = ? WHERE id = ?';
        return await db.execute(query, [newStatus, id]);
    }

    // 4. Xóa vĩnh viễn đơn hàng (Dùng cho Admin)
    static async delete(id) {
        const query = 'DELETE FROM orders WHERE id = ?';
        return await db.execute(query, [id]);
    }
}

module.exports = Order;