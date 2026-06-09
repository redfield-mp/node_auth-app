'use strict';

const { usersRepository } = require('../entity/users.repository.js');

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepository.create(email, password);

  res.json({ user });
};

const authController = {
  register,
};

module.exports = { authController };
