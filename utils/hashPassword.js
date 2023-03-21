const bcrypt = require("bcryptjs")

// Salt son datos aleatorios para la criptación de contraseña 
const salt = bcrypt.genSaltSync(10)

const hashPassword = password => bcrypt.hashSync(password, salt)
module.exports = { hashPassword }
