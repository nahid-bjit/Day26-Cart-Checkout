const express = require("express");
const routes = express();
const { userValidator, productValidator } = require("../middleware/validation");
const ProductController = require("../controller/ProductController");
const { isAuthenticated, isAuthenticateded, isAdmin } = require("../middleware/auth");

routes.get("/all", ProductController.getAll);
routes.post("/create", isAuthenticated, isAdmin, productValidator.add, ProductController.create);

module.exports = routes;
