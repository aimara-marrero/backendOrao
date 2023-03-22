const jwt = require("jsonwebtoken")
const verifyIsLoggedIn = (req, res, next) => {
    try {
        const token = req.cookies.access_token
        if (!token) {
            return res.status(403).send("A token is required for authentication")
        }

        try {

            //Guardamos los datos del user en decoded
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
            req.user = decoded
            next()
        } catch (err) {
            return res.status(401).send("Unauthorized. Invalid Token")
        }

    } catch (err) {
        next(err)
    }
}


const verifyIsAdmin = (req, res, next) => {

    if (req.user && req.user.isAdmin) {
        next()
    } else {
        return res.status(401).send("No tienes autorización de administrador. Invalido Token")

    }

}

module.exports = { verifyIsLoggedIn, verifyIsAdmin }
