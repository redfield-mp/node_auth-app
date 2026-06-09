'use strict';

const { db } = require('../utils/db.js');

function create(email, password) {
  return db.user.create({
    data: { email, password },
  });
}

const usersRepository = {
  create,
};

module.exports = { usersRepository };
