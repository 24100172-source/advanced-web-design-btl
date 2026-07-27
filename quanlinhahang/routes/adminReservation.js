const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authController = require('../controllers/authController'); 
const dishController = require('../controllers/dishController'); 
const adminAuth = require('../middleware/adminAuth'); 
const upload = require('../middleware/upload');
const orderController = require('../controllers/orderController');
const contactController = require('../controllers/contactController');

// Route Đăng nhập Admin
router.get('/admin/login', authController.getAdminLogin);
router.post('/admin/login', authController.postAdminLogin);

// Route Đăng xuất Admin
router.get('/admin/logout', authController.adminLogout);

// --- CÁC ROUTE QUẢN LÝ (BẮT BUỘC PHẢI ĐĂNG NHẬP ADMIN MỚI VÀO ĐƯỢC) ---

// Quản lý Đặt bàn
router.get('/admin/reservations', adminAuth, reservationController.getAdminReservations);
router.post('/admin/reservations/update/:id', adminAuth, reservationController.updateReservationStatus);
router.get('/admin/reservations/delete/:id', adminAuth, reservationController.deleteReservation);

// Quản lý Món ăn 
router.get('/admin/dishes', adminAuth, dishController.getAdminDishes);
router.get('/admin/dishes/add', adminAuth, dishController.getAddDish);
router.post('/admin/dishes/add', adminAuth, upload.single('image'), dishController.postAddDish);
router.get('/admin/dishes/delete/:id', adminAuth, dishController.deleteDish);
router.get('/admin/dishes/edit/:id', adminAuth, dishController.getEditDish);
router.post('/admin/dishes/edit/:id', adminAuth, upload.single('image'), dishController.postEditDish);

// Quản lý đơn hàng
router.get('/admin/orders', adminAuth, orderController.getAdminOrders);
router.post('/admin/orders/update/:id', adminAuth, orderController.updateOrderStatus);
router.get('/admin/orders/delete/:id', adminAuth, orderController.deleteOrder);

// Quản lý tin nhắn liên hệ
router.get('/admin/contacts', adminAuth, contactController.getAdminContacts);
router.post('/admin/contacts/reply', contactController.replyContact);
router.post('/admin/contacts/update/:id', contactController.updateStatus);
router.post('/admin/contacts/delete/:id', contactController.deleteContact);

module.exports = router;