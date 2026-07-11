const express = require('express');
const path = require('path');
const db = require('./config/db'); 

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// 1. TRANG CHỦ & THỰC ĐƠN & GIỚI THIỆU
// ==========================================

// [GET] Trang chủ
app.get('/', async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM categories ORDER BY id ASC");
        const [bestSellers] = await db.query("SELECT * FROM products WHERE is_bestseller = 1 AND status = 1");

        res.render('home', { 
            categories: categories, 
            bestSellers: bestSellers 
        });
    } catch (error) {
        console.error("Lỗi kết nối MySQL: ", error);
        res.status(500).send("Lỗi Server: Không thể tải dữ liệu trang chủ!");
    }
});

// [GET] Trang Thực Đơn
app.get('/thuc-don', async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM categories ORDER BY id ASC");
        const categorySlug = req.query.category;
        let query = "SELECT * FROM products WHERE status = 1";
        let params = [];
        
        if (categorySlug) {
            query += " AND category_id = (SELECT id FROM categories WHERE slug = ?)";
            params.push(categorySlug);
        }
        
        const [products] = await db.query(query, params);
        res.render('menu', { 
            categories: categories, 
            products: products,
            currentCategorySlug: categorySlug,
            currentPage: 1, 
            totalPages: 1
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu thực đơn: ", error);
        res.status(500).send("Không thể tải thực đơn!");
    }
});

// [GET] Trang Giới Thiệu
app.get('/gioi-thieu', (req, res) => {
    res.render('gthieu');
});

// ==========================================
// 2. HỆ THỐNG ĐẶT BÀN (BOOKINGS)
// ==========================================

// [GET] Hiển thị trang đặt bàn
app.get('/dat-ban', (req, res) => {
    res.render('dat-ban');
});

// [POST] Xử lý lưu thông tin đặt bàn 
app.post('/dat-ban', async (req, res) => {
    try {
        const { name, phone, date, time, guests, notes } = req.body;

        const insertBookingQuery = `
            INSERT INTO bookings (fullname, phone, booking_date, booking_time, guests_count, note, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `;
        await db.query(insertBookingQuery, [name, phone, date, time, guests, notes || null]);

        res.render('dat-ban', {
            success_msg: `Cảm ơn ${name}. Hệ thống đã ghi nhận lịch hẹn thành công. Chúng tôi sẽ gọi lại vào số ${phone} để xác nhận sớm nhất!`
        });

    } catch (error) {
        console.error("Lỗi khi xử lý đặt bàn: ", error);
        res.render('dat-ban', {
            error_msg: "Đã có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau!"
        });
    }
});

// ==========================================
// 3. TIN TỨC & LIÊN HỆ
// ==========================================

// [GET] Trang Tin Tức
app.get('/tin-tuc', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM articles ORDER BY created_at DESC");
        res.render('news', { articles: rows }); 
    } catch (error) {
        console.error("Lỗi lấy dữ liệu tin tức: ", error);
        res.status(500).send("Lỗi Server: Không thể tải dữ liệu tin tức!");
    }
});

// [GET] Trang Liên Hệ
app.get('/lien-he', (req, res) => {
    res.render('lien-he'); 
});

// [POST] Xử lý gửi Liên hệ
app.post('/lien-he', async (req, res) => {
    try {
        const { name, phone, subject, message } = req.body;
        console.log('----- CÓ TIN NHẮN LIÊN HỆ -----');
        console.log(`Từ: ${name} (${phone}) | Tiêu đề: ${subject || 'Không có'} | Nội dung: ${message}`);

        res.send(`<script>alert('Gửi tin nhắn thành công!'); window.location.href='/lien-he';</script>`);
    } catch (error) {
        res.send(`<script>alert('Gửi tin nhắn thất bại!'); window.location.href='/lien-he';</script>`);
    }
});

// ==========================================
// 4. ROUTES CHO AUTH (ĐĂNG NHẬP / ĐĂNG KÝ)
// ==========================================

app.get('/auth/login', (req, res) => {
    res.render('auth/login'); 
});

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Ai đó đang cố đăng nhập - User: ${username}, Pass: ${password}`);
    res.send('<h2>Đăng nhập thành công! (Demo)</h2><a href="/">Về trang chủ</a>');
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register'); 
});

app.post('/auth/register', (req, res) => {
    const { fullname, phone, email, password, confirm_password } = req.body;
    if (password !== confirm_password) {
        return res.send('<h2>Mật khẩu xác nhận không khớp!</h2><a href="javascript:history.back()">Quay lại</a>');
    }
    console.log('--- CÓ KHÁCH ĐĂNG KÝ MỚI ---');
    res.send('<h2>Đăng ký thành công! Hãy đăng nhập. (Demo)</h2><a href="/auth/login">Tới trang Đăng nhập</a>');
});

// Khởi chạy ứng dụng
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});