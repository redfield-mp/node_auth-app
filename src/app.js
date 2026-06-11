'use strict';

const express = require('express');
const cors = require('cors');
const { authRouter } = require('./api/auth.router.js');
const { usersRouter } = require('./api/users.router.js');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', usersRouter);

module.exports = { app };
