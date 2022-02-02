const bcrypt = require('bcryptjs');

const Users = require('../models/index').Users;

const isLoggedIn = (req, res, next) => {
  if (req.session.loggedIn && req.params.id === req.session.userId.toString()) {
    next();
  } else {
    res.status(400).send('This request must come from the specified user.');
  }
};

const signUserIn = async (req, res, next) => {
  try {
    const user = await Users.findOne({ where: { email: req.body.email } });
    if (!user) {
      req.session.loggedIn = false;
      res.status(404).send('The provided sign-in credentials are invalid.');
    } else if (!bcrypt.compareSync(req.body.password, user.password)) {
      req.session.loggedIn = false;
      res.status(400).send('The provided sign-in credentials are invalid.');
    } else {
      req.session.loggedIn = true;
      req.session.userId = user.id;
      next();
    }
  } catch (error) {
    res.status(500).send('There was an error signing in.');
  }
};

const signUserOut = (req, res, next) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        console.error('There was an error signing out:', error);
        res.status(500).send('There was an error signing out.');
      } else {
        res.clearCookie('falcon.sid');
        next();
      }
    });
  } else {
    // next(error);
    res.status(400).send('No user is logged in.');
  }
};

module.exports = {
  isLoggedIn,
  signUserIn,
  signUserOut,
};
