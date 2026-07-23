const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// 1. CẤU HÌNH SERVER
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. CẤU HÌNH SESSION
app.use(session({
    secret: 'grill_house_premium_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// 3. MIDDLEWARE TOÀN CỤC (Biến giỏ hàng & User cho Navbar)
app.use((req, res, next) => {
    // Xử lý giỏ hàng
    let totalItems = 0;
    if (req.session && req.session.cart) {
        totalItems = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    res.locals.globalCartCount = totalItems;

    // XỬ LÝ LƯU THÔNG TIN USER (DÒNG BẠN CÒN THIẾU)
    res.locals.user = req.session.user || null; 

    next();
});

// 4. KHAI BÁO CÁC ROUTES
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');

app.use('/', indexRoutes);
app.use('/auth', authRoutes); // Tự động thêm tiền tố /auth vào các đường dẫn auth
app.use('/', cartRoutes);

// 5. CHẠY SERVER
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});