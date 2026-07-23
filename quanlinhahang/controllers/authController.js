const db = require('../config/db');
const bcrypt = require('bcrypt'); // Thư viện mã hóa mật khẩu

// 1. HIỂN THỊ TRANG ĐĂNG NHẬP
exports.getLogin = (req, res) => {
    res.render('auth/login', { hideSearch: true, error: null }); 
};

// 2. XỬ LÝ ĐĂNG NHẬP (Sử dụng Số điện thoại)
exports.postLogin = async (req, res) => {
    try {
        // Nhận dữ liệu phone (hoặc username nếu form cũ của bạn để name="username")
        const phone = req.body.phone || req.body.username; 
        const password = req.body.password;

        // B1: Tìm user trong Database dựa vào số điện thoại
        const [users] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);

        if (users.length === 0) {
            return res.render('auth/login', { hideSearch: true, error: 'Số điện thoại chưa được đăng ký!' });
        }

        const user = users[0];

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

        // Kiểm tra mật khẩu xác nhận
        if (password !== confirm_password) {
            return res.render('auth/register', { hideSearch: true, error: 'Mật khẩu xác nhận không khớp!' });
        }

        // Kiểm tra xem số điện thoại đã tồn tại chưa
        const [existingUser] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);

        if (existingUser.length > 0) {
            return res.render('auth/register', { hideSearch: true, error: 'Số điện thoại này đã được đăng ký!' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào Database (Bỏ cột username)
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

// 5. XỬ LÝ ĐĂNG XUẤT
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if(err) console.log(err);
        res.redirect('/');
    });
};