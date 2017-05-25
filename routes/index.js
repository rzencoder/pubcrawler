var express = require('express');
var passport = require('passport');
var router = express.Router();
var path = process.cwd();
var SearchHandler = require(path + '/controllers/searchHandler.server.js');


router.get('/', function(req, res) {
  res.render('index', {
    user: req.user
  });
});

router.get('/register', function(req, res) {
  res.render('register', {});
});

router.post('/register', function(req, res, next) {
  Account.register(new Account({
    username: req.body.username
  }), req.body.password, function(err, account) {
    if (err) {
      return res.render('register', {
        error: err.message
      });
    }
    passport.authenticate('local')(req, res, function() {
      req.session.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
});

router.get('/login', function(req, res) {
  res.render('login', {
    user: req.user,
    message: req.flash('error')
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


var searchHandler = new SearchHandler();

router.route('/going/:id')
  .post(searchHandler.going);

router.route('/search/:place')
  .post(searchHandler.search);

module.exports = router;
