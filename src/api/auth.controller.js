'use strict';

const { randomBytes } = require('crypto');
const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository.js');
const { mailer } = require('../utils/mailer.js');
const { userService } = require('../services/user.service.js');
const { jwt } = require('../utils/jwt.js');

const SALT_ROUNDS = 10;

function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.json({ accessToken, user: userData });
}

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

  sendAuthentication(res, activatedUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid || user.activationToken !== null) {
    res.status(401).json({ message: 'Invalid credentials' });

    return;
  }

  sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  const user = await usersRepository.getByEmail(userData.email);

  if (!user || user.activationToken !== null) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  sendAuthentication(res, user);
};

const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    sameSite: 'none',
    secure: true,
  });

  res.sendStatus(204);
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};

module.exports = { authController };
