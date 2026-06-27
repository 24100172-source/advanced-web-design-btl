const express = require('express');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

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
            currentPage: 1, // Bạn có thể mở rộng logic phân trang sau
            totalPages: 1
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu thực đơn: ", error);
        res.status(500).send("Không thể tải thực đơn!");
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
