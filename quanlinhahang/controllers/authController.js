const bcrypt = require('bcrypt'); // Thư viện mã hóa mật khẩu
const User = require('../models/User');   
const Admin = require('../models/Admin'); 

// 1. HIỂN THỊ TRANG ĐĂNG NHẬP
exports.getLogin = (req, res) => {
    res.render('auth/login', { hideSearch: true, error: null }); 
};

// 2. XỬ LÝ ĐĂNG NHẬP 
exports.postLogin = async (req, res) => {
    try {
        const phone = req.body.phone || req.body.username; 
        const password = req.body.password;

        // B1: Gọi Model tìm user trong Database
        const user = await User.findByPhone(phone);

        if (!user) {
            return res.render('auth/login', { hideSearch: true, error: 'Số điện thoại chưa được đăng ký!' });
        }

        // B2: So sánh mật khẩu
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('auth/login', { hideSearch: true, error: 'Sai mật khẩu!' });
        }

        // B3: Lưu session
        req.session.user = {
            id: user.id,
            fullname: user.fullname,
            phone: user.phone,
            role: user.role
        };

        res.redirect('/');
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.render('auth/login', { hideSearch: true, error: 'Lỗi máy chủ!' });
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

        // Gọi Model kiểm tra số điện thoại tồn tại
        const existingUser = await User.findByPhone(phone);

        if (existingUser) {
            return res.render('auth/register', { hideSearch: true, error: 'Số điện thoại này đã được đăng ký!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Gọi Model lưu user mới
        await User.create({ fullname, phone, email, hashedPassword });

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

// 5. XỬ LÝ ĐĂNG XUẤT
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if(err) console.log(err);
        res.redirect('/');
    });
};

// ================= PHẦN DÀNH CHO ADMIN  =================

// 6. Hiển thị trang đăng nhập riêng cho Admin
exports.getAdminLogin = (req, res) => {
    if (req.session && req.session.admin) {
        return res.redirect('/admin/reservations');
    }
    res.render('admin/login', { error: null });
};

// 7. Xử lý đăng nhập Admin 
exports.postAdminLogin = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Gọi Model truy vấn từ bảng admins
        const user = await Admin.findByPhone(phone);

        if (!user) {
            return res.render('admin/login', { error: 'Số điện thoại hoặc mật khẩu không chính xác!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('admin/login', { error: 'Số điện thoại hoặc mật khẩu không chính xác!' });
        }

        if (user.role !== 'admin') {
            return res.render('admin/login', { error: 'Bạn không có quyền truy cập trang quản trị!' });
        }

        req.session.admin = {
            id: user.id,
            fullname: user.fullname,
            phone: user.phone,
            role: user.role
        };

        req.session.save((err) => {
            if (err) console.error(err);
            res.redirect('/admin/reservations');
        });

    } catch (err) {
        console.error("Lỗi đăng nhập admin:", err);
        res.render('admin/login', { error: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
    }
};

// 8. Đăng xuất Admin
exports.adminLogout = (req, res) => {
    delete req.session.admin;
    req.session.save((err) => {
        if (err) console.error("Lỗi khi đăng xuất:", err);
        res.redirect('/admin/login');
    });
};