'use strict';

const { db } = require('../utils/db.js');

function getByEmail(email) {
  return db.user.findUnique({
    where: { email },
  });
}

function create(email, password, activationToken) {
  return db.user.create({
    data: { email, password, activationToken },
  });
}

function activate(email) {
  return db.user.update({
    where: { email },
    data: { activationToken: null },
  });
}

const usersRepository = {
  getByEmail,
  create,
  activate,
};

module.exports = { usersRepository };
