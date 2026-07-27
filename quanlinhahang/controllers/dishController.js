const Product = require('../models/Product');   
const Category = require('../models/Category'); 

// Hiển thị danh sách món ăn trang Admin
exports.getAdminDishes = async (req, res) => {
    try {
        // Gọi Model lấy danh sách món ăn kèm tên danh mục
        const dishes = await Product.getAllWithCategory();

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
        // Gọi Model lấy danh sách danh mục đổ vào Dropdown
        const categories = await Category.getAll();
        
        res.render('admin/addDish', { 
            categories: categories 
        });
    } catch (error) {
        console.error("Lỗi khi tải trang form thêm món:", error);
        res.status(500).send("Đã xảy ra lỗi trên server!");
    }
};

// 2. Hàm xử lý lưu dữ liệu món ăn mới
exports.postAddDish = async (req, res) => {
    try {
        const { name, price, category_id, status, is_bestseller } = req.body;
        
        const product_status = status ? parseInt(status) : 1; 
        const bestseller = is_bestseller === 'on' ? 1 : 0; 

        let image_url = 'images/default-food.jpg';
        if (req.file) {
            image_url = 'images/' + req.file.filename; 
        }

        // Gọi Model để lưu món ăn mới
        await Product.create({
            name,
            price,
            category_id,
            status: product_status,
            is_bestseller: bestseller,
            image_url
        });

        res.redirect('/admin/dishes');
    } catch (error) {
        console.error("Lỗi khi thêm món mới:", error);
        res.status(500).send("Lỗi server khi thêm món mới");
    }
};

// 3. Xóa món ăn
exports.deleteDish = async (req, res) => {
    try {
        const dishId = req.params.id;
        
        // Gọi Model xóa món ăn theo ID
        await Product.delete(dishId);
        
        res.redirect('/admin/dishes');
    } catch (error) {
        console.error("Lỗi khi xóa món ăn:", error);
        res.status(500).send("Lỗi server khi xóa món ăn");
    }
};

// 4. Hiển thị form Sửa món ăn
exports.getEditDish = async (req, res) => {
    try {
        const dishId = req.params.id;
        
        // Gọi các Model lấy thông tin món ăn và danh sách danh mục
        const dish = await Product.findById(dishId);
        if (!dish) {
            return res.status(404).send("Không tìm thấy món ăn này!");
        }

        const categories = await Category.getAll();
        
        res.render('admin/editDish', { 
            dish: dish, 
            categories: categories 
        });
    } catch (error) {
        console.error("Lỗi khi tải trang sửa món ăn:", error);
        res.status(500).send("Đã xảy ra lỗi server!");
    }
};

// 5. Xử lý lưu thông tin món ăn vừa sửa
exports.postEditDish = async (req, res) => {
    try {
        const dishId = req.params.id;
        const { name, price, category_id, status, is_bestseller } = req.body;
        
        const product_status = status ? parseInt(status) : 1; 
        const bestseller = is_bestseller === 'on' ? 1 : 0; 

        const updateData = {
            name,
            price,
            category_id,
            status: product_status,
            is_bestseller: bestseller
        };

        if (req.file) {
            updateData.image_url = 'images/' + req.file.filename;
        }

        // Gọi Model cập nhật dữ liệu
        await Product.update(dishId, updateData);

        res.redirect('/admin/dishes');
    } catch (error) {
        console.error("Lỗi khi cập nhật món ăn:", error);
        res.status(500).send("Lỗi server khi cập nhật món ăn");
    }
};