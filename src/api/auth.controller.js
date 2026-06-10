'use strict';

const { randomBytes } = require('crypto');
const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository.js');
const { mailer } = require('../utils/mailer.js');
const { userService } = require('../services/user.service.js');

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
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

  const user = await usersRepository.create(
    email,
    hashedPassword,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.json({ user: userService.normalize(user) });
};

const activate = async (req, res) => {
  const { email, token } = req.params;

  const user = await usersRepository.getByEmail(email);

  if (!user || user.activationToken !== token) {
    res.sendStatus(404);

    return;
  }

  const activatedUser = await usersRepository.activate(email);

  res.json({ user: userService.normalize(activatedUser) });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid || user.activationToken !== null) {
    res.status(401).json({ message: 'Invalid credentials' });

    return;
  }

  res.json({ user: userService.normalize(user) });
};

const authController = {
  register,
  activate,
  login,
};

module.exports = { authController };
