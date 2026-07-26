const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// Routes chính
router.get('/', mainController.getHome);
router.get('/thuc-don', mainController.getMenu);
router.get('/tim-kiem', mainController.getSearch);

// Routes tin tức
router.get('/tin-tuc', mainController.getNews);
router.get('/tin-tuc/:id', mainController.getNewsDetail);

// Routes đặt bàn & liên hệ
router.get('/dat-ban', mainController.getDatBan);
router.post('/dat-ban', mainController.postDatBan);
router.get('/lien-he', mainController.getLienHe);
router.post('/lien-he', mainController.postLienHe);

// Routes thông tin cố định
router.get('/dieu-khoan', mainController.getTerms);
router.get('/chinh-sach-thanh-vien', mainController.getPolicy);
router.get('/bao-mat', mainController.getPrivacy);
router.get('/gioi-thieu', mainController.getAbout);

// Route quản lý liên hệ (Admin)
router.get('/admin/contacts', mainController.getAdminContacts);

module.exports = router;
