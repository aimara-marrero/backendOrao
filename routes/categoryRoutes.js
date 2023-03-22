const express = require('express')
const router = express.Router()
const {getCategories,newCategory, deleteCategory, saveAttr} = require("../controllers/categoryController")
const { verifyIsLoggedIn, verifyIsAdmin } = require("../middleware/verifyAuthToken")

router.get("/", getCategories)


router.use(verifyIsLoggedIn) // regular user is login 
router.use(verifyIsAdmin) // Check the user is or not admin
router.post("/", newCategory)
router.post("/attr", saveAttr)
router.delete("/:category", deleteCategory)

module.exports = router
