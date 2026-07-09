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

app.get('/tin-tuc', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM articles ORDER BY created_at DESC");

        res.render('news', { articles: rows }); 
        
    } catch (error) {
        console.error("Lỗi lấy dữ liệu tin tức: ", error);
        res.status(500).send("Lỗi Server: Không thể tải dữ liệu tin tức!");
    }
});

app.get('/dieu-khoan', (req, res) => {
    res.render('dieu-khoan');
});

app.get('/chinh-sach-thanh-vien', (req, res) => {
    res.render('chinh-sach-thanh-vien');
});

app.get('/bao-mat', (req, res) => {
    res.render('bao-mat');
});

app.get('/lien-he', (req, res) => {
    res.render('lien-he'); 
});

app.get('/dat-ban', (req, res) => {
    res.render('dat-ban');
});

app.get('/gioi-thieu', (req, res) => {
    res.render('gthieu');
});

app.post('/dat-ban', async (req, res) => {
    try {
        const { name, phone, date, time, guests, notes } = req.body;

        console.log('----- CÓ KHÁCH ĐẶT BÀN -----');
        console.log(`Tên: ${name} | SĐT: ${phone}`);
        console.log(`Lúc: ${time} ngày ${date} | Số người: ${guests}`);
        console.log(`Ghi chú: ${notes || 'Không có'}`);

        res.render('dat-ban', {
            success_msg: `Cảm ơn ${name}. Hệ thống đã ghi nhận lịch hẹn. Chúng tôi sẽ gọi lại vào số ${phone} để xác nhận sớm nhất!`
        });

    } catch (error) {
        console.error("Lỗi khi xử lý đặt bàn: ", error);
        res.render('dat-ban', {
            error_msg: "Đã có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau!"
        });
    }
});

app.post('/lien-he', async (req, res) => {
    try {
        const { name, phone, subject, message } = req.body;
        
        console.log('----- CÓ TIN NHẮN LIÊN HỆ -----');
        console.log(`Từ: ${name} (${phone})`);
        console.log(`Tiêu đề: ${subject || 'Không có'}`);
        console.log(`Nội dung: ${message}`);

        res.send(`<script>alert('Gửi tin nhắn thành công!'); window.location.href='/lien-he';</script>`);
    } catch (error) {
        res.send(`<script>alert('Gửi tin nhắn thất bại!'); window.location.href='/lien-he';</script>`);
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});