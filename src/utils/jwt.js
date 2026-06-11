'use strict';

const jsonwebtoken = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, SECRET, { expiresIn: '10m' });
}

function validateAccessToken(token) {
  try {
    return jsonwebtoken.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

const jwt = {
  generateAccessToken,
  validateAccessToken,
};

module.exports = { jwt };
