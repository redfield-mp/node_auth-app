'use strict';

const { Router } = require('express');
const { authController } = require('./auth.controller.js');

const authRouter = Router();

authRouter.post('/registration', authController.register);

module.exports = { authRouter };
