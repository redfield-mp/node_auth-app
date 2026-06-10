'use strict';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

function normalize({ id, email }) {
  return { id, email };
}

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

const userService = {
  normalize,
  validateEmail,
  validatePassword,
};

module.exports = { userService };
