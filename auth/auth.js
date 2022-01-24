const bcrypt = require('bcryptjs');

const Users = require('../models/index').Users;

const verifyUser = async (req, res, next) => {
  try {
    const user = await Users.findOne({ where: { email: req.body.email } });
    if (!user) {
      res.status(404).send('The provided sign-in credentials are invalid.');
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.status(400).send('The provided sign-in credentials are invalid.');
    }
    req.session.loggedIn = true;
    req.session.email = req.body.email;
    console.log('req.session:', req.session);
    console.log('sessionID:', req.sessionID);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = verifyUser;
