const bcrypt = require("bcryptjs")

// Salt son datos aleatorios para la criptación de contraseña 
const salt = bcrypt.genSaltSync(10)

const hashPassword = password => bcrypt.hashSync(password, salt)
const comparePasswords = (inputPassword, hashedPassword) => bcrypt.compareSync(inputPassword, hashedPassword)

module.exports = { hashPassword, comparePasswords }
