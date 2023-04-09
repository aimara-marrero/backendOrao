const bcrypt = require("bcryptjs")
const ObjectId = require("mongodb").ObjectId;

const users = [
      {
    name: 'admin',
    lastName: 'admin',
    email: 'admin@admin.com',
    password: bcrypt.hashSync('admin@admin.com', 10),
    isAdmin: true,
  },
  {
    name: 'test',
    lastName: 'test',
    email: 'test1@test.com',
    password: bcrypt.hashSync('test1@test', 10),
    isAdmin: false,
  },
  {
    _id: new ObjectId("642bdc27d2ba11980d90b5e7"),
    name: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    password: bcrypt.hashSync('john@doe.com', 10),
  },
]

module.exports = users
