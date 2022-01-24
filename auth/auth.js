const bcrypt = require('bcryptjs');

const Users = require('../models/index').Users;

const verifyUser = async (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  }
  try {
    const user = await Users.findOne({ where: { email: req.body.email } });
    if (!user) {
      res.status(404).send('The provided sign-in credentials are invalid.');
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.status(400).send('The provided sign-in credentials are invalid.');
    }
    req.session.loggedIn = true;
    req.session.user = {
      id: user.id,
      email: user.email,
    };
    next();
  } catch (error) {
    res.status(500).send('There was an error signing in.');
  }
};

module.exports = verifyUser;
