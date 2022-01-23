const router = require('express').Router();

const userController = require('../controllers/userController');

router.post('/', (req, res) => {
  userController.addUser(req, res);
});

router.get('/:id', (req, res) => {
  userController.findUser(req, res);
});

router.get('/', (req, res) => {
  userController.findAllUsers(req, res);
});

router.put('/:id', (req, res) => {
  userController.updateUser(req, res);
});

router.delete('/:id', (req, res) => {
  userController.deleteUser(req, res);
});

module.exports = router;
