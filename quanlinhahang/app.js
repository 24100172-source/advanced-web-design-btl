const express = require('express');
const path = require('path');
const session = require('express-session'); 
const db = require('./config/db');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({
    secret: 'grill_house_premium_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.use((req, res, next) => {
    let totalItems = 0;
    if (req.session && req.session.cart) {
        totalItems = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    res.locals.globalCartCount = totalItems; 
    next();
});

function calculateCartTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}



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

app.get('/lien-he', async (req, res) => {
    try {
        const [reviews] = await db.query("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 6");
        
        res.render('lien-he', { reviews: reviews }); 
    } catch (error) {
        console.error("Lỗi lấy danh sách đánh giá: ", error);
        res.render('lien-he', { reviews: [] }); 
    }
});

app.post('/lien-he', async (req, res) => {
    try {
        const { name, phone, subject, message } = req.body;
        console.log('----- CÓ TIN NHẮN LIÊN HỆ -----');
        console.log(`Từ: ${name} (${phone}) | Tiêu đề: ${subject || 'Không có'} | Nội dung: ${message}`);

        res.send(`
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <style>
                body { background-color: #111; }
            </style>
            <script>
                window.onload = function() {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã gửi tin nhắn!',
                        text: 'Cảm ơn bạn, Grill House sẽ phản hồi sớm nhất!',
                        background: '#181310',
                        color: '#fff',
                        confirmButtonColor: '#ffc107'
                    }).then(() => {
                        window.location.href = '/lien-he';
                    });
                };
            </script>
        `);
    } catch (error) {
        res.send(`
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <style>
                body { background-color: #111; }
            </style>
            <script>
                window.onload = function() {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi gửi tin',
                        text: 'Có lỗi xảy ra, vui lòng thử lại sau!',
                        background: '#181310',
                        color: '#fff',
                        confirmButtonColor: '#ffc107'
                    }).then(() => {
                        window.location.href = '/lien-he';
                    });
                };
            </script>
        `);
    }
});

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



app.get('/gio-hang', (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    
    res.render('giohang', { 
        title: 'Giỏ hàng của bạn',
        cartItems: req.session.cart, 
        totalAmount: calculateCartTotal(req.session.cart),
        hideSearch: true
    });
});

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


app.get('/thanh-toan', (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
        return res.redirect('/thuc-don');
    }
    
    res.render('checkout', {
        cartItems: cart,
        totalAmount: calculateCartTotal(cart),
        hideSearch: true
    });
});

app.post('/thanh-toan', async (req, res) => {
    try {
        const { fullname, phone, address, payment_method, note } = req.body;
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            return res.status(400).json({ success: false, message: "Giỏ hàng trống rỗng!" });
        }

        const totalAmount = calculateCartTotal(cart);

        const [orderResult] = await db.query(
            "INSERT INTO orders (fullname, phone, address, payment_method, total_amount, note) VALUES (?, ?, ?, ?, ?, ?)",
            [fullname, phone, address, payment_method, totalAmount, note || null]
        );

        const orderId = orderResult.insertId;

        for (const item of cart) {
            await db.query(
                "INSERT INTO order_details (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)",
                [orderId, item.id, item.name, item.price, item.quantity]
            );
        }

        req.session.cart = [];

        res.json({ success: true, message: "Đặt hàng thành công!" });
    } catch (error) {
        console.error("Lỗi khi xử lý đặt đơn hàng: ", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống, không thể đặt hàng." });
    }
});

app.get('/admin/orders', async (req, res) => {
    try {
        const [orders] = await db.query("SELECT * FROM orders ORDER BY created_at DESC");
        
        const [orderDetails] = await db.query("SELECT * FROM order_details");

        const fullOrders = orders.map(order => {
            return {
                ...order,
                items: orderDetails.filter(detail => detail.order_id === order.id)
            };
        });

        res.render('admin/orders', { 
            orders: fullOrders,
            title: 'Quản Lý Đơn Hàng' 
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng: ", error);
        res.status(500).send("Lỗi hệ thống: Không thể tải danh sách đơn hàng!");
    }
});

app.post('/admin/orders/update-status', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
        res.json({ success: true });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái đơn hàng: ", error);
        res.status(500).json({ success: false, message: "Cập nhật thất bại!" });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});