const Booking = require('../models/Booking'); 
// 1. Xem danh sách và Lọc đặt bàn (Admin)
exports.getAdminReservations = async (req, res) => {
    try {
        const filterDate = req.query.date;

        // Gọi Model lấy danh sách đặt bàn từ Database
        const reservations = await Booking.getAll(filterDate); 
        
        const formattedReservations = reservations.map(item => ({
            id: item.id,
            name: item.fullname,  
            phone: item.phone,
            date: item.booking_date,  
            time: item.booking_time,  
            guests: item.guests_count,
            notes: item.note,         
            status: item.status
        }));

        res.render('admin/qlidatban', { 
            reservations: formattedReservations, 
            filterDate 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi Server khi lấy dữ liệu đặt bàn");
    }
};

// 2. Cập nhật trạng thái đặt bàn (Xác nhận / Hủy) (Admin)
exports.updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Gọi Model cập nhật trạng thái
        await Booking.updateStatus(id, status);
        
        res.redirect('/admin/reservations');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/reservations');
    }
};

// 3. Xóa lịch đặt bàn (Admin)
exports.deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Gọi Model xóa đặt bàn
        await Booking.delete(id);
        
        res.redirect('/admin/reservations');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/reservations');
    }
};

// 4. Lưu thông tin khách đặt bàn từ form giao diện chính (Khách hàng)
exports.storeReservation = async (req, res) => {
    try {
        const { name, phone, email, date, time, guests, notes } = req.body;

        // Gọi Model lưu thông tin đặt bàn mới
        await Booking.create({ name, phone, email, date, time, guests, notes });

        res.redirect('/'); 
    } catch (err) {
        console.error("Lỗi khi lưu đặt bàn:", err);
        res.status(500).send("Có lỗi xảy ra khi đặt bàn.");
    }
};
