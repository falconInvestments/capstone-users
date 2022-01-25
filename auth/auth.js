const bcrypt = require('bcryptjs');

const Users = require('../models/index').Users;

const verifyUser = async (req, res, next) => {
  if (req.session.loggedIn) {
    // Could check if the logged-in user matches the user being modified
    next();
  } else {
    try {
      const user = await Users.findOne({ where: { email: req.body.email } });
      if (!user) {
        res.status(404).send('The provided sign-in credentials are invalid.');
      } else if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.status(400).send('The provided sign-in credentials are invalid.');
      } else {
        req.session.loggedIn = true;
        req.session.user = {
          id: user.id,
          email: user.email,
        };
        req.session.save();
        next();
      }
    } catch (error) {
      res.status(500).json({
        message: 'There was an error signing in.',
        reqSessionObj: req.session,
      });
    }
  }
};

module.exports = verifyUser;
