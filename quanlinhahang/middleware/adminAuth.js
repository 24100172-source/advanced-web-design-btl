module.exports = (req, res, next) => {
  if (req.session && req.session.admin && req.session.admin.role === 'admin') {
    return next(); 
  }
  res.redirect('/admin/login');
};