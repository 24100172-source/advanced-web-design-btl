const db = require('../config/db');

// 1. Hiển thị danh sách và Lọc theo ngày
exports.getAdminOrders = async (req, res) => {
    try {
        const filterDate = req.query.date; // Lấy ngày từ URL (nếu admin có chọn lọc)
        let query = 'SELECT * FROM orders';
        let queryParams = [];

        // Nếu có chọn ngày lọc, thêm điều kiện WHERE vào câu SQL
        if (filterDate) {
            query += ' WHERE DATE(created_at) = ?';
            queryParams.push(filterDate);
        }

        query += ' ORDER BY id DESC';

        const [orders] = await db.execute(query, queryParams);

        res.render('admin/orders', {
            orders: orders,
            filterDate: filterDate // Truyền ngày ngược lại view để giữ giá trị ô input
        });
    } catch (error) {
        console.error("Lỗi khi tải trang quản lý đơn hàng:", error);
        res.status(500).send("Đã xảy ra lỗi trên server!");
    }
};

// 2. Cập nhật trạng thái đơn hàng (Hoàn thành / Hủy)
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const newStatus = req.body.status; // Lấy trạng thái gửi từ Form (completed hoặc cancelled)

        const query = 'UPDATE orders SET status = ? WHERE id = ?';
        await db.execute(query, [newStatus, orderId]);

        // Cập nhật xong thì tải lại trang
        res.redirect('/admin/orders');
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        res.status(500).send("Lỗi server khi cập nhật trạng thái");
    }
};

// 3. Xóa vĩnh viễn đơn hàng
exports.deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Chạy lệnh xóa đơn hàng có id tương ứng trong Database
        const query = 'DELETE FROM orders WHERE id = ?';
        await db.execute(query, [orderId]);
        
        // Xóa xong thì tự động load lại trang danh sách đơn hàng
        res.redirect('/admin/orders');
    } catch (error) {
        console.error("Lỗi khi xóa đơn hàng:", error);
        res.status(500).send("Lỗi server khi xóa đơn hàng");
    }
};
