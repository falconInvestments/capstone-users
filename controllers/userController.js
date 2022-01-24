// Consider using req.body.id instead of req.params.id

const bcrypt = require('bcryptjs');

const Users = require('../models/index').Users;

// Create
const addUser = async (req, res) => {
  try {
    const foundUser = await Users.findOne({ where: { email: req.body.email } });
    if (foundUser) {
      res
        .status(400)
        .send('The specified user details cannot be used for registration.');
    } else {
      const hash = bcrypt.hashSync(req.body.password, 10); // Use async instead?
      const newUser = await Users.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
      });
      res.status(200).send(newUser);
    }
  } catch (error) {
    console.error('Error communicating with the Users RDS:', error);
    res.status(500).send('There was an error communicating with the database.');
  }
};

// Read (one)
const findUser = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { id: req.params.id } });
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send('The specified user could not be found.');
    }
  } catch (error) {
    console.error('Error communicating with the Users RDS:', error);
    res.status(500).send('There was an error communicating with the database.');
  }
};

// Read (all)
const findAllUsers = async (req, res) => {
  try {
    const users = await Users.findAll({});
    res.status(200).send(users);
  } catch (error) {
    console.error('Error communicating with the Users RDS:', error);
    res.status(500).send('There was an error communicating with the database.');
  }
};

// Update
const updateUser = async (req, res) => {
  try {
    // Re-work this as a PATCH-type request; avoid unnecessary hashing
    const hash = bcrypt.hashSync(req.body.password, 10);
    /* const user = */ await Users.update(
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
      },
      { where: { id: req.params.id } }
    );
    res.status(200).send('The specified user has been updated.');
  } catch (error) {
    console.error('Error communicating with the Users RDS:', error);
    res.status(500).send('There was an error communicating with the database.');
  }
};

// Delete
const deleteUser = async (req, res) => {
  try {
    /* const user = */ await Users.destroy({ where: { id: req.params.id } });
    res.status(200).send('The specified user has been deleted.');
  } catch (error) {
    console.error('Error communicating with the Users RDS:', error);
    res.status(500).send('There was an error communicating with the database.');
  }
};

module.exports = {
  addUser,
  findUser,
  findAllUsers,
  updateUser,
  deleteUser,
};
