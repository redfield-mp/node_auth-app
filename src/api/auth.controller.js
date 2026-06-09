'use strict';

const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository.js');

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
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
