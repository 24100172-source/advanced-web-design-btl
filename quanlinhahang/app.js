const express = require('express');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/new', (req, res) => {
    res.render('news');
});

app.get('/lien-he', (req, res) => {
    res.render('dat-ban'); 
});

app.get('/dat-ban', (req, res) => {
    res.render('dat-ban');
});

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

app.get('/dat-ban', (req, res) => {
    res.render('dat-ban');
});

app.post('/dat-ban', async (req, res) => {
    try {
        const { name, phone, date, time, guests, notes } = req.body;

        console.log('----- CÓ KHÁCH ĐẶT BÀN -----');
        console.log(`Tên: ${name} | SĐT: ${phone}`);
        console.log(`Lúc: ${time} ngày ${date} | Số người: ${guests}`);
        console.log(`Ghi chú: ${notes || 'Không có'}`);

        res.send(`
            <div style="text-align: center; margin-top: 100px; font-family: sans-serif;">
                <h2 style="color: #28a745;">🎉 Đặt bàn thành công!</h2>
                <p style="color: #555;">Cảm ơn <b>${name}</b>. Chúng tôi sẽ gọi lại vào số <b>${phone}</b> để xác nhận.</p>
                <br>
                <a href="/" style="padding: 12px 24px; background-color: #ffc107; color: #000; text-decoration: none; border-radius: 30px; font-weight: bold;">Trở về trang chủ</a>
            </div>
        `);

    } catch (error) {
        console.error("Lỗi khi xử lý đặt bàn: ", error);
        res.status(500).send("Lỗi Server: Không thể xử lý đơn đặt bàn lúc này!");
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
