const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/gio-hang', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/update', cartController.updateCart);
router.post('/cart/remove', cartController.removeCart);
router.get('/thanh-toan', cartController.getCheckout);
router.post('/thanh-toan', cartController.postCheckout);

module.exports = router;