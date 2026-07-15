const express = require('express');
const path = require('path');
const session = require('express-session'); // <-- SỬA LỖI 1: Đã khai báo thư viện Session ở đây!
const db = require('./config/db');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// CẤU HÌNH SESSION & MIDDLEWARE GIỎ HÀNG (Đưa lên trước các Route)
// ==========================================

// Khởi tạo cấu hình Session
app.use(session({
    secret: 'grill_house_premium_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Hết hạn sau 1 ngày
}));

// Middleware tính số lượng món cho Navbar toàn cục (Chạy trước mọi Route)
app.use((req, res, next) => {
    let totalItems = 0;
    if (req.session && req.session.cart) {
        totalItems = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    res.locals.globalCartCount = totalItems; // Tạo biến dùng trực tiếp trong mọi file EJS
    next();
});

// Hàm trợ giúp tính tổng tiền
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ==========================================
// CÁC ROUTE CHÍNH
// ==========================================

// 1. TRANG CHỦ
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

// 2. TRANG THỰC ĐƠN
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

// 3. TRANG DANH SÁCH TIN TỨC (Đã dọn dẹp phần trùng lặp)
app.get('/tin-tuc', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM articles ORDER BY created_at DESC");
        res.render('news', { articles: rows }); 
    } catch (error) {
        console.error("Lỗi lấy dữ liệu tin tức: ", error);
        res.status(500).send("Lỗi Server: Không thể tải dữ liệu tin tức!");
    }
});

// 4. TRANG CHI TIẾT TIN TỨC
app.get('/tin-tuc/:id', async (req, res) => {
    try {
        const articleId = req.params.id;
        const [rows] = await db.query("SELECT * FROM articles WHERE id = ?", [articleId]);

        if (rows.length === 0) {
            return res.status(404).send("Không tìm thấy bài viết!");
        }

        res.render('news-detail', { post: rows[0] });
    } catch (error) {
        console.error("Lỗi lấy chi tiết tin tức: ", error);
        res.status(500).send("Lỗi Server: Không thể tải chi tiết tin tức!");
    }
});

// 5. CÁC TRANG CHÍNH SÁCH VÀ THÔNG TIN KHÁC
app.get('/dieu-khoan', (req, res) => {
    res.render('dieu-khoan');
});

app.get('/chinh-sach-thanh-vien', (req, res) => {
    res.render('chinh-sach-thanh-vien');
});

app.get('/bao-mat', (req, res) => {
    res.render('bao-mat');
});

app.get('/gioi-thieu', (req, res) => {
    res.render('gthieu');
});

// 6. XỬ LÝ ĐẶT BÀN (Đã dọn dẹp phần trùng lặp)
app.get('/dat-ban', (req, res) => {
    res.render('dat-ban');
});

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

// 7. XỬ LÝ LIÊN HỆ
app.get('/lien-he', (req, res) => {
    res.render('lien-he'); 
});

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

// 8. ĐĂNG NHẬP / ĐĂNG KÝ (AUTH)
app.get('/auth/login', (req, res) => {
    res.render('auth/login', { hideSearch: true }); 
});

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Ai đó đang cố đăng nhập - User: ${username}, Pass: ${password}`);
    res.send('<h2>Đăng nhập thành công! (Demo)</h2><a href="/">Về trang chủ</a>');
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register', { hideSearch: true }); 
});

app.post('/auth/register', (req, res) => {
    const { fullname, phone, email, password, confirm_password } = req.body;
    if (password !== confirm_password) {
        return res.send('<h2>Mật khẩu xác nhận không khớp!</h2><a href="javascript:history.back()">Quay lại</a>');
    }
    console.log('--- CÓ KHÁCH ĐĂNG KÝ MỚI ---');
    res.send('<h2>Đăng ký thành công! Hãy đăng nhập. (Demo)</h2><a href="/auth/login">Tới trang Đăng nhập</a>');
});

// ==========================================
// CÁC ROUTE XỬ LÝ GIỎ HÀNG
// ==========================================

// [GET] Trang giao diện chi tiết giỏ hàng
app.get('/gio-hang', (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    
    res.render('giohang', { 
        title: 'Giỏ hàng của bạn',
        cartItems: req.session.cart, 
        totalAmount: calculateCartTotal(req.session.cart),
        hideSearch: true //báo ẩn tìm kiếm 
    });
});

// [POST] Thêm món ăn vào giỏ hàng
app.post('/cart/add', async (req, res) => {
    try {
        const { productId } = req.body;
        if (!req.session.cart) req.session.cart = [];

        let item = req.session.cart.find(i => i.id == productId);

        if (item) {
            item.quantity += 1;
        } else {
            const [products] = await db.query("SELECT * FROM products WHERE id = ?", [productId]);
            
            if (products.length > 0) {
                const product = products[0];
                req.session.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image_url || product.image || 'images/default-food.jpg',
                    quantity: 1
                });
            } else {
                return res.status(404).json({ success: false, message: "Không tìm thấy món ăn" });
            }
        }

        const cartCount = req.session.cart.reduce((sum, i) => sum + i.quantity, 0);
        res.json({ success: true, cartCount: cartCount });

    } catch (error) {
        console.error("Lỗi thêm món vào giỏ:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
});

// [POST] Cập nhật số lượng (+/-) trực tiếp tại trang giỏ hàng
app.post('/cart/update', (req, res) => {
    const { productId, change } = req.body;
    let cart = req.session.cart || [];

    let item = cart.find(i => i.id == productId);

    if (item) {
        item.quantity += parseInt(change);

        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id != productId);
            req.session.cart = cart;
            return res.json({ 
                success: true, 
                newQuantity: 0, 
                newCartTotal: calculateCartTotal(cart),
                cartCount: cart.reduce((sum, i) => sum + i.quantity, 0)
            });
        }

        req.session.cart = cart;
        return res.json({
            success: true,
            newQuantity: item.quantity,
            newItemTotal: item.price * item.quantity,
            newCartTotal: calculateCartTotal(cart),
            cartCount: cart.reduce((sum, i) => sum + i.quantity, 0)
        });
    }
    res.status(404).json({ success: false, message: "Không tìm thấy món ăn" });
});

// [POST] Xóa hẳn một món ăn khỏi giỏ hàng
app.post('/cart/remove', (req, res) => {
    const { productId } = req.body;
    let cart = req.session.cart || [];

    cart = cart.filter(i => i.id != productId);
    req.session.cart = cart;

    res.json({
        success: true,
        newCartTotal: calculateCartTotal(cart),
        cartCount: cart.reduce((sum, i) => sum + i.quantity, 0)
    });
});

// Khởi chạy ứng dụng
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});