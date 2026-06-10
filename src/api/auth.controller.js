'use strict';

const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository.js');

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

  const { password: _, ...user } = await usersRepository.create(
    email,
    hashedPassword,
  );

  res.json({ user });
};

const authController = {
  register,
};

module.exports = { authController };
