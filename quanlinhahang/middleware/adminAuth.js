module.exports = (req, res, next) => {
  // Kiểm tra xem session có tồn tại và user có phải là admin không
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next(); // Cho phép đi tiếp vào trang admin
  }
  // Nếu chưa đăng nhập hoặc không phải admin thì đá về trang login
  res.redirect('/admin/login');
};
