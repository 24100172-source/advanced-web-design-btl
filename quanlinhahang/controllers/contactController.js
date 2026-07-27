const Contact = require('../models/Contact'); 
// 1. Hàm hiển thị trang liên hệ cho khách (GET)
exports.getContactPage = async (req, res) => {
    try {
        // Gọi Model lấy 6 đánh giá mới nhất
        const reviews = await Contact.getLatestReviews(6);

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

        // Gọi Model lưu tin nhắn vào database
        await Contact.create({ name, phone, subject, message });

        res.redirect('/lien-he');
    } catch (error) {
        console.error("Lỗi khi khách gửi liên hệ:", error);
        res.status(500).send("Lỗi server! Không thể gửi tin nhắn.");
    }
};

// 3. Hàm lấy danh sách liên hệ cho trang ADMIN
exports.getAdminContacts = async (req, res) => {
    try {
        // Gọi Model lấy tất cả tin nhắn
        const contacts = await Contact.getAll();

        res.render('admin/contacts', {
            contacts: contacts
        });
    } catch (error) {
        console.error("Lỗi khi tải trang quản lý liên hệ:", error);
        res.status(500).send("Đã xảy ra lỗi trên server!");
    }
};

// 4. Hàm xử lý phản hồi tin nhắn từ Admin
exports.replyContact = async (req, res) => {
    try {
        const { contactId, replyMessage } = req.body;
        
        // Gọi Model cập nhật câu trả lời và chuyển sang trạng thái đã đọc
        await Contact.reply(contactId, replyMessage);
        
        res.redirect('/admin/contacts');
    } catch (error) {
        console.error("Lỗi khi gửi phản hồi:", error);
        res.status(500).send("Lỗi server khi phản hồi tin nhắn!");
    }
};

// 5. Hàm: Đánh dấu tin nhắn là đã đọc / chưa đọc
exports.updateStatus = async (req, res) => {
    try {
        const contactId = req.params.id;
        const status = req.body.status;
        
        // Gọi Model cập nhật trạng thái
        await Contact.updateStatus(contactId, status);
        
        res.redirect('/admin/contacts');
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        res.status(500).send("Lỗi server!");
    }
};

// 6. Hàm: Xóa tin nhắn
exports.deleteContact = async (req, res) => {
    try {
        const contactId = req.params.id;
        
        // Gọi Model xóa tin nhắn
        await Contact.delete(contactId);
        
        res.redirect('/admin/contacts');
    } catch (error) {
        console.error("Lỗi khi xóa tin nhắn:", error);
        res.status(500).send("Lỗi server!");
    }
};