const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Khởi tạo multer với cấu hình trên
const upload = multer({ storage: storage });

module.exports = upload;