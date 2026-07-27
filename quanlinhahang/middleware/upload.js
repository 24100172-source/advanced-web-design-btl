const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ảnh sẽ được lưu vào thư mục public/images
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        // Tạo tên file độc nhất để không bị trùng (vd: 1691234567-ten-anh.jpg)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Khởi tạo multer với cấu hình trên
const upload = multer({ storage: storage });

module.exports = upload;