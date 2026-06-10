'use strict';

const { db } = require('../utils/db.js');

function getByEmail(email) {
  return db.user.findUnique({
    where: { email },
  });
}

function create(email, password) {
  return db.user.create({
    data: { email, password },
  });
}

const usersRepository = {
  getByEmail,
  create,
};

module.exports = { usersRepository };
