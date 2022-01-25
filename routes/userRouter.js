const router = require('express').Router();

const userController = require('../controllers/userController');
const verifyUser = require('../auth/auth');

router.post('/', (req, res) => {
  userController.addUser(req, res);
});

router.get('/:id', (req, res) => {
  userController.findUser(req, res);
});

router.get('/', (req, res) => {
  userController.findAllUsers(req, res);
});

router.put('/:id', verifyUser, (req, res) => {
  userController.updateUser(req, res);
});

router.delete('/:id', verifyUser, (req, res) => {
  userController.deleteUser(req, res);
});

module.exports = router;
