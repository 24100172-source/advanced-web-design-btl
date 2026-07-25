const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authController = require('../controllers/authController'); // Controller đăng nhập vừa viết
const adminAuth = require('../middleware/adminAuth'); // Middleware bảo vệ

// Route Đăng nhập Admin
router.get('/admin/login', authController.getAdminLogin);
router.post('/admin/login', authController.postAdminLogin);

// Route Đăng xuất Admin
router.get('/admin/logout', authController.adminLogout);

// --- CÁC ROUTE QUẢN LÝ (BẮT BUỘC PHẢI ĐĂNG NHẬP ADMIN MỚI VÀO ĐƯỢC) ---
router.get('/admin/reservations', adminAuth, reservationController.getAdminReservations);
router.post('/admin/reservations/update/:id', adminAuth, reservationController.updateReservationStatus);
router.get('/admin/reservations/delete/:id', adminAuth, reservationController.deleteReservation);

module.exports = router;
