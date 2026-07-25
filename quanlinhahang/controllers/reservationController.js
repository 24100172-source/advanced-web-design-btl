const db = require('../config/db'); 

// 1. Xem danh sách đặt bàn (Admin) - Đổi từ reservations sang bookings
exports.getAdminReservations = async (req, res) => {
  try {
    const filterDate = req.query.date;
    let sql = 'SELECT * FROM bookings';
    let params = [];

    if (filterDate) {
      sql += ' WHERE booking_date = ?';
      params.push(filterDate);
    }
    sql += ' ORDER BY created_at DESC';

    const [reservations] = await db.query(sql, params); 
    
    // Đổi tên các trường dữ liệu để khớp với file EJS đang hiển thị (item.id, item.name, item.date, item.time, item.guests, item.notes)
    const formattedReservations = reservations.map(item => ({
      id: item.id,
      name: item.fullname,      // Bảng bookings dùng fullname
      phone: item.phone,
      date: item.booking_date,  // Bảng bookings dùng booking_date
      time: item.booking_time,  // Bảng bookings dùng booking_time
      guests: item.guests_count,// Bảng bookings dùng guests_count
      notes: item.note,         // Bảng bookings dùng note
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
    
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
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
    await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    res.redirect('/admin/reservations');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/reservations');
  }
};

// 4. Lưu thông tin khách đặt bàn từ form giao diện chính (Khách hàng)
exports.storeReservation = async (req, res) => {
  try {
    // Nhận dữ liệu từ form của khách hàng
    const { name, phone, email, date, time, guests, notes } = req.body;

    // Câu lệnh SQL INSERT vào đúng bảng bookings theo cấu trúc database của bạn
    const sql = `INSERT INTO bookings (fullname, phone, email, booking_date, booking_time, guests_count, status, note, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW())`;

    await db.query(sql, [name, phone, email || null, date, time, guests, notes || null]);

    res.redirect('/'); 
  } catch (err) {
    console.error("Lỗi khi lưu đặt bàn:", err);
    res.status(500).send("Có lỗi xảy ra khi đặt bàn.");
  }
};
