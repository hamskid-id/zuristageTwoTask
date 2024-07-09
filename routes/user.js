const { getAllUsers, getAUser } = require("../controllers/users");
const express = require('express');
const router = express.Router();

router.route('/users')
    .get(getAllUsers)
router.route('/users/:id')
    .get(getAUser)

module.exports = router;