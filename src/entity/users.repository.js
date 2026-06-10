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

const usersRepository = {
  getByEmail,
  create,
};

module.exports = { usersRepository };
