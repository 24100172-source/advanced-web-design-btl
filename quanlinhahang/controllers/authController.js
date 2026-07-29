const db = require('../config/db');
const bcrypt = require('bcrypt'); // Thư viện mã hóa mật khẩu

// 1. HIỂN THỊ TRANG ĐĂNG NHẬP CHUNG
exports.getLogin = (req, res) => {
    // Nếu đã đăng nhập admin rồi thì chuyển thẳng vào trang quản trị
    if (req.session && req.session.admin) {
        return res.redirect('/admin/reservations');
    }
    // Nếu khách đã đăng nhập rồi thì về trang chủ
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login', { hideSearch: true, error: null }); 
};

// 2. XỬ LÝ ĐĂNG NHẬP CHUNG (Cho cả Khách hàng và Admin)
exports.postLogin = async (req, res) => {
    try {
        const phone = req.body.username || req.body.phone; 
        const password = req.body.password;

        if (!phone || !password) {
            return res.render('auth/login', { hideSearch: true, error: 'Vui lòng nhập đầy đủ thông tin!' });
        }

        // BƯỚC 1: Kiểm tra xem có phải tài khoản trong bảng 'admins' trước không
        const [admins] = await db.query("SELECT * FROM admins WHERE phone = ?", [phone]);

        if (admins.length > 0) {
            const admin = admins[0];
            const matchAdmin = await bcrypt.compare(password, admin.password);
            
            if (matchAdmin) {
                if (admin.role !== 'admin') {
                    return res.render('auth/login', { hideSearch: true, error: 'Bạn không có quyền truy cập trang quản trị!' });
                }

                // Lưu session cho Admin
                req.session.admin = {
                    id: admin.id,
                    fullname: admin.fullname,
                    phone: admin.phone,
                    role: admin.role
                };

                return req.session.save((err) => {
                    if (err) console.error(err);
                    res.redirect('/admin/reservations');
                });
            }
        }

        // BƯỚC 2: Nếu không phải Admin, kiểm tra tiếp bảng 'users' (Khách hàng)
        const [users] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);

        if (users.length > 0) {
            const user = users[0];
            const matchUser = await bcrypt.compare(password, user.password);

            if (matchUser) {
                // Lưu session cho User thường
                req.session.user = {
                    id: user.id,
                    fullname: user.fullname,
                    phone: user.phone,
                    role: user.role
                };

                return req.session.save((err) => {
                    if (err) console.error(err);
                    res.redirect('/');
                });
            }
        }

        // Nếu không tìm thấy hoặc sai mật khẩu ở cả 2 bảng
        return res.render('auth/login', { hideSearch: true, error: 'Số điện thoại hoặc mật khẩu không chính xác!' });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.render('auth/login', { hideSearch: true, error: 'Lỗi máy chủ, vui lòng thử lại sau!' });
    }
};

// 3. HIỂN THỊ TRANG ĐĂNG KÝ
exports.getRegister = (req, res) => {
    res.render('auth/register', { hideSearch: true, error: null }); 
};

// 4. XỬ LÝ ĐĂNG KÝ
exports.postRegister = async (req, res) => {
    try {
        const { fullname, phone, email, password, confirm_password } = req.body;

        if (password !== confirm_password) {
            return res.render('auth/register', { hideSearch: true, error: 'Mật khẩu xác nhận không khớp!' });
        }

        const [existingUser] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);

        if (existingUser.length > 0) {
            return res.render('auth/register', { hideSearch: true, error: 'Số điện thoại này đã được đăng ký!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            "INSERT INTO users (fullname, phone, email, password) VALUES (?, ?, ?, ?)",
            [fullname, phone, email || null, hashedPassword]
        );

        res.send(`
            <script>
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                window.location.href = '/auth/login';
            </script>
        `);
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.render('auth/register', { hideSearch: true, error: 'Lỗi hệ thống!' });
    }
};

// 5. XỬ LÝ ĐĂNG XUẤT CHUNG (Cho cả User và Admin)
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if(err) console.log(err);
        res.redirect('/auth/login');
    });
};

// ROUTE DỰ PHÒNG CHO ADMIN
exports.getAdminLogin = exports.getLogin;
exports.postAdminLogin = exports.postLogin;
exports.adminLogout = exports.logout;
