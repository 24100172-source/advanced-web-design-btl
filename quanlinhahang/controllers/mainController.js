const Category = require('../models/Category');
const Product = require('../models/Product');
const Article = require('../models/Article');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

// 1. TRANG CHỦ
exports.getHome = async (req, res) => {
    try {
        const categories = await Category.getAll();
        const bestSellers = await Product.getBestSellers();

        res.render('home', { 
            categories: categories, 
            bestSellers: bestSellers 
        });
    } catch (error) {
        console.error("Lỗi kết nối MySQL: ", error);
        res.status(500).send("Lỗi Server: Không thể tải dữ liệu trang chủ!");
    }
};

// 2. TRANG THỰC ĐƠN
exports.getMenu = async (req, res) => {
    try {
        const categorySlug = req.query.category;
        const sortOption = req.query.sort; 
        
        const categories = await Category.getAll();
        const products = await Product.getFilteredMenu(categorySlug, sortOption);

        res.render('menu', {
            categories,
            products,
            currentCategorySlug: categorySlug || null,
            currentCategoryName: categorySlug ? categories.find(c => c.slug === categorySlug)?.name : 'Tất Cả Món Ăn',
            currentSort: sortOption || null, 
            currentPage: 1,
            totalPages: 1
        });
    } catch (error) {
        console.error("Lỗi trang thực đơn:", error);
        res.status(500).send("Lỗi Server");
    }
};

// 3. TÌM KIẾM MÓN ĂN
exports.getSearch = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        
        if (!keyword || keyword.trim() === '') {
            return res.redirect('/thuc-don');
        }

        const categories = await Category.getAll();
        const products = await Product.searchByName(keyword);

        res.render('menu', { 
            categories, 
            products,
            currentCategorySlug: null,
            currentCategoryName: `Kết quả tìm kiếm cho: "${keyword}"`,
            searchKeyword: keyword,
            currentPage: 1, 
            totalPages: 1
        });
    } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        res.status(500).send("Lỗi Server");
    }
};

// 4. TRANG TIN TỨC
exports.getNews = async (req, res) => {
    try {
        const articles = await Article.getAll();
        res.render('news', { articles: articles, hideSearch: true }); 
    } catch (error) {
        console.error("Lỗi lấy dữ liệu tin tức: ", error);
        res.status(500).send("Lỗi Server: Không thể tải dữ liệu tin tức!");
    }
};

exports.getNewsDetail = async (req, res) => {
    try {
        const articleId = req.params.id;
        const post = await Article.findById(articleId);

        if (!post) {
            return res.status(404).send("Không tìm thấy bài viết!");
        }

        res.render('news-detail', { post: post, hideSearch: true });
    } catch (error) {
        console.error("Lỗi lấy chi tiết tin tức: ", error);
        res.status(500).send("Lỗi Server: Không thể tải chi tiết tin tức!");
    }
};

// 5. CÁC TRANG THÔNG TIN (Chính sách, Giới thiệu...)
exports.getTerms = (req, res) => res.render('dieu-khoan');
exports.getPolicy = (req, res) => res.render('chinh-sach-thanh-vien');
exports.getPrivacy = (req, res) => res.render('bao-mat');
exports.getAbout = (req, res) => res.render('gthieu', { hideSearch: true });

// 6. XỬ LÝ ĐẶT BÀN
exports.getDatBan = (req, res) => {
    res.render('dat-ban', { hideSearch: true });
};

exports.postDatBan = async (req, res) => {
    try {
        const { name, phone, date, time, guests, notes } = req.body;
        
        await Booking.create({ name, phone, date, time, guests, notes });

        res.render('dat-ban', {
            success_msg: `Cảm ơn ${name}. Hệ thống đã ghi nhận lịch hẹn thành công. Chúng tôi sẽ gọi lại vào số ${phone} để xác nhận sớm nhất!`,
            hideSearch: true
        });
    } catch (error) {
        console.error("Lỗi khi xử lý đặt bàn: ", error);
        res.render('dat-ban', {
            error_msg: "Đã có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau!",
            hideSearch: true
        });
    }
};

// 7. XỬ LÝ LIÊN HỆ
exports.getLienHe = async (req, res) => {
    try {
        const reviews = await Contact.getLatestReviews(6);
        res.render('lien-he', { reviews: reviews, hideSearch: true }); 
    } catch (error) {
        console.error("Lỗi lấy danh sách đánh giá: ", error);
        res.render('lien-he', { reviews: [], hideSearch: true }); 
    }
};

exports.postLienHe = (req, res) => {
    try {
        const { name, phone, subject, message } = req.body;
        console.log('----- CÓ TIN NHẮN LIÊN HỆ -----');
        console.log(`Từ: ${name} (${phone}) | Tiêu đề: ${subject || 'Không có'} | Nội dung: ${message}`);

        res.send(`
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <style> body { background-color: #111; } </style>
            <script>
                window.onload = function() {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã gửi tin nhắn!',
                        text: 'Cảm ơn bạn, Grill House sẽ phản hồi sớm nhất!',
                        background: '#181310',
                        color: '#fff',
                        confirmButtonColor: '#ffc107'
                    }).then(() => { window.location.href = '/lien-he'; });
                };
            </script>
        `);
    } catch (error) {
        res.send(`
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <style> body { background-color: #111; } </style>
            <script>
                window.onload = function() {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi gửi tin',
                        text: 'Có lỗi xảy ra, vui lòng thử lại sau!',
                        background: '#181310',
                        color: '#fff',
                        confirmButtonColor: '#ffc107'
                    }).then(() => { window.location.href = '/lien-he'; });
                };
            </script>
        `);
    }
};

// 8. XỬ LÝ QUẢN LÝ LIÊN HỆ (ADMIN)
exports.getAdminContacts = async (req, res) => {
    try {
        const contacts = await Contact.getAll();
        res.render('admin/contacts', { 
            contacts: contacts,
            title: 'Quản Lý Liên Hệ' 
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách liên hệ: ", error);
        res.render('admin/contacts', { 
            contacts: [],
            title: 'Quản Lý Liên Hệ' 
        });
    }
};