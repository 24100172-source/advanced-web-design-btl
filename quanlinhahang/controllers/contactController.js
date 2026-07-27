const db = require('../config/db');

// 1. Hàm hiển thị trang liên hệ cho khách (GET)
exports.getContactPage = async (req, res) => {
    try {
        // Lấy 6 đánh giá mới nhất từ Database để hiển thị ra phần "Khách Hàng Nói Gì"
        const query = 'SELECT * FROM contacts ORDER BY created_at DESC LIMIT 6';
        const [reviews] = await db.execute(query);

        // Truyền biến reviews ra ngoài file lien-he.ejs
        res.render('lien-he', { 
            reviews: reviews 
        });
    } catch (error) {
        console.error("Lỗi khi tải trang liên hệ:", error);
        res.status(500).send("Đã xảy ra lỗi trên server!");
    }
};

// 2. Hàm xử lý khi khách bấm nút "Gửi Tin Nhắn" (POST)
exports.postContact = async (req, res) => {
    try {
        const { name, phone, subject, message } = req.body;

        // Lưu tin nhắn vào bảng contacts với trạng thái mặc định là 'unread' (chưa đọc)
        const query = `
            INSERT INTO contacts (name, phone, subject, message, status) 
            VALUES (?, ?, ?, ?, 'unread')
        `;
        
        await db.execute(query, [name, phone, subject, message]);

        // Gửi thành công thì load lại trang liên hệ
        res.redirect('/lien-he');
    } catch (error) {
        console.error("Lỗi khi khách gửi liên hệ:", error);
        res.status(500).send("Lỗi server! Không thể gửi tin nhắn.");
    }
};

// 3. Hàm lấy danh sách liên hệ cho trang ADMIN (Giữ nguyên phần trước)
exports.getAdminContacts = async (req, res) => {
    try {
        const query = 'SELECT * FROM contacts ORDER BY id DESC';
        const [contacts] = await db.execute(query);

        res.render('admin/contacts', {
            contacts: contacts
        });
    } catch (error) {
        console.error("Lỗi khi tải trang quản lý liên hệ:", error);
        res.status(500).send("Đã xảy ra lỗi trên server!");
    }
};

// Hàm xử lý phản hồi tin nhắn từ Admin
exports.replyContact = async (req, res) => {
    try {
        const { contactId, replyMessage } = req.body;
        
        // Cập nhật câu trả lời và tự động chuyển trạng thái thành 'read' (đã đọc/phản hồi)
        await db.execute(
            'UPDATE contacts SET admin_reply = ?, status = "read" WHERE id = ?', 
            [replyMessage, contactId]
        );
        
        res.redirect('/admin/contacts'); // Load lại trang Admin
    } catch (error) {
        console.error("Lỗi khi gửi phản hồi:", error);
        res.status(500).send("Lỗi server khi phản hồi tin nhắn!");
    }
};

// Hàm: Đánh dấu tin nhắn là đã đọc / chưa đọc
exports.updateStatus = async (req, res) => {
    try {
        const contactId = req.params.id;
        const status = req.body.status; // lấy chữ 'read' từ form ẩn
        
        await db.execute('UPDATE contacts SET status = ? WHERE id = ?', [status, contactId]);
        
        // Chuyển hướng lại trang danh sách sau khi cập nhật thành công
        res.redirect('/admin/contacts');
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        res.status(500).send("Lỗi server!");
    }
};

// Hàm: Xóa tin nhắn
exports.deleteContact = async (req, res) => {
    try {
        const contactId = req.params.id;
        
        await db.execute('DELETE FROM contacts WHERE id = ?', [contactId]);
        
        // Chuyển hướng lại trang danh sách sau khi xóa thành công
        res.redirect('/admin/contacts');
    } catch (error) {
        console.error("Lỗi khi xóa tin nhắn:", error);
        res.status(500).send("Lỗi server!");
    }
};
