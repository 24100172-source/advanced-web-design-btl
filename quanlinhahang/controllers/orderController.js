const Order = require('../models/Order'); 
// 1. Hiển thị danh sách và Lọc theo ngày
exports.getAdminOrders = async (req, res) => {
    try {
        const filterDate = req.query.date; 
        // Gọi Model lấy danh sách đơn hàng
        const orders = await Order.getAll(filterDate);

        res.render('admin/orders', {
            orders: orders,
            filterDate: filterDate 
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

        // Gọi Model cập nhật trạng thái đơn hàng
        await Order.updateStatus(orderId, newStatus);

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
        
        // Gọi Model xóa đơn hàng
        await Order.delete(orderId);
        
        res.redirect('/admin/orders');
    } catch (error) {
        console.error("Lỗi khi xóa đơn hàng:", error);
        res.status(500).send("Lỗi server khi xóa đơn hàng");
    }
};