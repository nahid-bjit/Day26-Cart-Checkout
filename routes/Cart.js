const express = require("express");
const routes = express();
const CartController = require("../controller/CartController");



routes.post("/add-to-cart", CartController.addToCart);
routes.patch("/remove-from-cart", CartController.removeFromCart);
routes.post('/checkout/:cartId', CartController.checkout);

module.exports = routes;
