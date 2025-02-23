const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register =  async (req, res, next) => {
    try{
        const user = new User({email: req.body.email, username: req.body.username});
        const registerdUser = await User.register(user, req.body.password);
        req.login(registerdUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        });
    } catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'おかえりなさい！！');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = async (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'ログアウトしました');
        res.redirect('/campgrounds');
      });
}