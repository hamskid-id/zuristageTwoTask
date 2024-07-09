const { getAllOrganisationsOfUser, getAnOrganisation, createNewOrganisation, AddUserToOrganisation } = require("../controllers/organisationController");
const express = require('express');
const router = express.Router();

router.route('/organisations')
    .get(getAllOrganisationsOfUser)
    .post(createNewOrganisation)

router.route('/organisations/:orgId')
    .get(getAnOrganisation)
    
router.route('/organisations/:orgId/:userId')
    .post(AddUserToOrganisation)

module.exports = router;