const express = require('express');
const router = express.Router();
const { createAdministrateurWithUser } = require('../Controllers/AdministrateurController');
const verifyToken = require('../Middlewares/Auth');

router.post('/create-with-user', verifyToken, createAdministrateurWithUser);

module.exports = router;