const db = require('../config/db'); 

exports.getAdminDishes = async (req, res) => {
    try {
        // Lấy danh sách sản phẩm, nối với bảng categories để lấy tên danh mục
        const query = `
            SELECT p.id, p.name, p.price, p.image_url, p.status, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id DESC
        `;
        
        const [dishes] = await db.execute(query);

        // Render ra giao diện 
        res.render('admin/dishes', { 
            dishes: dishes 
        });

    } catch (error) {
        console.error("Lỗi khi tải trang quản lý món ăn:", error);
        res.status(500).send("Đã xảy ra lỗi trên server!");
    }
};

// 1. Hàm hiển thị form thêm món mới
exports.getAddDish = async (req, res) => {
    try {
        // Lấy danh sách danh mục (categories) từ Database để đưa vào thẻ Dropdown (Chọn danh mục)
        const [categories] = await db.execute('SELECT id, name FROM categories ORDER BY id ASC');
        
        res.render('admin/addDish', { 
            categories: categories 
        });
    } catch (error) {
        console.error("Lỗi khi tải trang form thêm món:", error);
        res.status(500).send("Đã xảy ra lỗi trên server!");
    }
};

// 2. Hàm xử lý lưu dữ liệu vào Database
exports.postAddDish = async (req, res) => {
    try {
        const { name, price, category_id, status, is_bestseller } = req.body;
        
        const product_status = status ? parseInt(status) : 1; 
        const bestseller = is_bestseller === 'on' ? 1 : 0; 

        let image_url = 'images/default-food.jpg';
        if (req.file) {
            // req.file.filename chính là cái tên ảnh độc nhất mà Multer vừa tạo ra
            image_url = 'images/' + req.file.filename; 
        }

        const query = `
            INSERT INTO products (name, price, category_id, status, is_bestseller, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await db.execute(query, [name, price, category_id, product_status, bestseller, image_url]);

        res.redirect('/admin/dishes');
    } catch (error) {
        console.error("Lỗi khi thêm món mới:", error);
        res.status(500).send("Lỗi server khi thêm món mới");
    }
};

// Xóa món ăn
exports.deleteDish = async (req, res) => {
    try {
        const dishId = req.params.id;
        
        // Chạy lệnh xóa món ăn có id tương ứng
        await db.execute('DELETE FROM products WHERE id = ?', [dishId]);
        
        // Xóa xong thì load lại trang danh sách
        res.redirect('/admin/dishes');
    } catch (error) {
        console.error("Lỗi khi xóa món ăn:", error);
        res.status(500).send("Lỗi server khi xóa món ăn");
    }
};

// Hiển thị form Sửa món ăn (Kéo dữ liệu cũ ra để điền vào form)
exports.getEditDish = async (req, res) => {
    try {
        const dishId = req.params.id;
        
        // 1. Lấy thông tin của món ăn đang cần sửa
        const [dishes] = await db.execute('SELECT * FROM products WHERE id = ?', [dishId]);
        if (dishes.length === 0) {
            return res.status(404).send("Không tìm thấy món ăn này!");
        }
        const dish = dishes[0]; // Món ăn hiện tại

        // 2. Lấy danh sách danh mục để đổ vào Dropdown
        const [categories] = await db.execute('SELECT id, name FROM categories ORDER BY id ASC');
        
        // Trả ra giao diện editDish
        res.render('admin/editDish', { 
            dish: dish, 
            categories: categories 
        });
    } catch (error) {
        console.error("Lỗi khi tải trang sửa món ăn:", error);
        res.status(500).send("Đã xảy ra lỗi server!");
    }
};

// Xử lý Lưu thông tin vừa sửa
exports.postEditDish = async (req, res) => {
    try {
        const dishId = req.params.id;
        const { name, price, category_id, status, is_bestseller } = req.body;
        
        const product_status = status ? parseInt(status) : 1; 
        const bestseller = is_bestseller === 'on' ? 1 : 0; 

        // Nếu admin có upload ảnh MỚI thì cập nhật cả ảnh, nếu không thì giữ nguyên ảnh cũ
        if (req.file) {
            const image_url = 'images/' + req.file.filename;
            const query = `
                UPDATE products 
                SET name = ?, price = ?, category_id = ?, status = ?, is_bestseller = ?, image_url = ? 
                WHERE id = ?
            `;
            await db.execute(query, [name, price, category_id, product_status, bestseller, image_url, dishId]);
        } else {
            // Câu lệnh UPDATE không có image_url
            const query = `
                UPDATE products 
                SET name = ?, price = ?, category_id = ?, status = ?, is_bestseller = ? 
                WHERE id = ?
            `;
            await db.execute(query, [name, price, category_id, product_status, bestseller, dishId]);
        }

        res.redirect('/admin/dishes');
    } catch (error) {
        console.error("Lỗi khi cập nhật món ăn:", error);
        res.status(500).send("Lỗi server khi cập nhật món ăn");
    }
};