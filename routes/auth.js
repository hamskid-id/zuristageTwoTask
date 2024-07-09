const express = require('express');
const { handleNewUser, handleLogin, handleRefreshToken, handleLogOut } = require('../controllers/authController');
const router = express.Router();

router.route('/register')
    .post(handleNewUser)

router.route('/login')
    .post(handleLogin)

router.route('/refresh')
    .get(handleRefreshToken)

router.route('/logout')
    .get(handleLogOut)

module.exports = router;