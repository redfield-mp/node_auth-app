'use strict';

const { randomBytes } = require('crypto');
const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository.js');
const { mailer } = require('../utils/mailer.js');

const SALT_ROUNDS = 10;
const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

function validateEmail(email) {
  if (!email) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `At least ${MIN_PASSWORD_LENGTH} characters`;
  }
}

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some(Boolean)) {
    res.status(400).json({ errors, message: 'Validation error' });

    return;
  }

  const [existingUser, hashedPassword] = await Promise.all([
    usersRepository.getByEmail(email),
    bcrypt.hash(password, SALT_ROUNDS),
  ]);

  if (existingUser) {
    res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });

    return;
  }

  const activationToken = randomBytes(32).toString('hex');

  const {
    password: _,
    activationToken: __,
    ...user
  } = await usersRepository.create(email, hashedPassword, activationToken);

  await mailer.sendActivationLink(email, activationToken);

  res.json({ user });
};

const activate = async (req, res) => {
  const { email, token } = req.params;

  const user = await usersRepository.getByEmail(email);

  if (!user || user.activationToken !== token) {
    res.sendStatus(404);

    return;
  }

  const {
    password: _,
    activationToken: __,
    ...activatedUser
  } = await usersRepository.activate(email);

  res.json({ user: activatedUser });
};

const authController = {
  register,
  activate,
};

module.exports = { authController };
