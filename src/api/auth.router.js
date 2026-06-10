'use strict';

const { Router } = require('express');
const { authController } = require('./auth.controller.js');

const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:email/:token', authController.activate);
authRouter.post('/login', authController.login);

module.exports = { authRouter };
