const Product = require('../models/Product'); 
const Order = require('../models/Order');     

function calculateCartTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

exports.getCart = (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    res.render('giohang', { 
        title: 'Giỏ hàng của bạn',
        cartItems: req.session.cart, 
        totalAmount: calculateCartTotal(req.session.cart),
        hideSearch: true 
    });
};

exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!req.session.cart) req.session.cart = [];
        let item = req.session.cart.find(i => i.id == productId);

        if (item) {
            item.quantity += 1;
        } else {
            // Gọi Model lấy thông tin món ăn theo ID
            const product = await Product.findById(productId);
            
            if (product) {
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
};

exports.updateCart = (req, res) => {
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
};

exports.removeCart = (req, res) => {
    const { productId } = req.body;
    let cart = req.session.cart || [];
    cart = cart.filter(i => i.id != productId);
    req.session.cart = cart;
    res.json({
        success: true,
        newCartTotal: calculateCartTotal(cart),
        cartCount: cart.reduce((sum, i) => sum + i.quantity, 0)
    });
};

exports.getCheckout = (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/thuc-don');
    res.render('checkout', {
        cartItems: cart,
        totalAmount: calculateCartTotal(cart),
        hideSearch: true
    });
};

exports.postCheckout = async (req, res) => {
    try {
        const { fullname, phone, payment_method, note } = req.body; 
        const cart = req.session.cart || [];
        
        if (cart.length === 0) return res.status(400).json({ success: false, message: "Giỏ hàng trống!" });

        const totalAmount = calculateCartTotal(cart);
        
        // Gọi Model lưu đơn hàng và các mặt hàng vào database
        await Order.create(
            { fullname, phone, payment_method, totalAmount, note },
            cart
        );
        
        req.session.cart = []; // Xóa giỏ hàng sau khi đặt thành công
        res.json({ success: true, message: "Đặt hàng thành công!" });
    } catch (error) {
        console.error("Lỗi đặt hàng: ", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống." });
    }
};