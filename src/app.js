'use strict';

const express = require('express');
const cors = require('cors');
const { authRouter } = require('./api/auth.router.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

module.exports = { app };
