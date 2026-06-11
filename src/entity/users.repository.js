'use strict';

const { db } = require('../utils/db.js');

function getByEmail(email) {
  return db.user.findUnique({
    where: { email },
  });
}

function create(data) {
  return db.user.create({ data });
}

function activate(email) {
  return db.user.update({
    where: { email },
    data: { activationToken: null },
  });
}

function getAllActive() {
  return db.user.findMany({
    where: { activationToken: null },
  });
}

const usersRepository = {
  getByEmail,
  create,
  activate,
  getAllActive,
};

module.exports = { usersRepository };
