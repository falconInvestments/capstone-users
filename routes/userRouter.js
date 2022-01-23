const router = require('express').Router();

const userController = require('../controllers/userController');

router.post('/', (req, res) => {
  userController.addUser();
});

router.get('/:id', (req, res) => {
  userController.findUser();
});

router.get('/', (req, res) => {
  userController.findAllUsers();
});

router.put('/:id', (req, res) => {
  userController.updateUser();
});

router.delete('/:id', (req, res) => {
  userController.deleteUser();
});

module.exports = router;
