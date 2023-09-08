const Cart = require('../model/Cart'); // Import the Cart model
const Product = require('../model/Product'); // Import the Product model
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

console.log("entered");

const CartController = {


    addToCart: async (req, res) => {
        try {
            const { userId, products } = req.body;
            console.log("Request body:", userId, products);

            // positive integer or not
            for (const product of products) {
                const { productId, quantity } = product;
                if (!Number.isInteger(quantity) || quantity <= 0) {
                    return res.status(400).json({ error: 'Quantity must be a positive integer' });
                }
            }

            // find or create new cart
            let cart = await Cart.findOne({ user: userId });

            if (!cart) {
                cart = new Cart({ user: userId, products: [], total: 0 });
            }

            // prices and stock from the database
            for (const product of products) {
                const { productId, quantity } = product;
                const productInfo = await Product.findById(productId);

                if (!productInfo) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                // stock check
                const totalQuantityInCart = cart.products.reduce((total, item) => {
                    return item.product.toString() === productId ? total + item.quantity : total;
                }, 0);

                if (totalQuantityInCart + quantity > productInfo.stock) {
                    return res.status(400).json({ error: 'Insufficient stock for product ' + productId });
                }
            }

            //  update the cart
            for (const product of products) {
                const { productId, quantity } = product;
                const existingProductIndex = cart.products.findIndex(
                    (item) => item.product.toString() === productId
                );

                if (existingProductIndex !== -1) {
                    cart.products[existingProductIndex].quantity += quantity;
                } else {
                    cart.products.push({ product: productId, quantity });
                }

                // Calculate the new total price
                const productInfo = await Product.findById(productId);
                cart.total += quantity * productInfo.price;
            }

            await cart.save();

            res.status(200).json({ message: 'Products added to cart successfully', cart });
        } catch (error) {
            console.error(error);

            if (error.name === 'CastError' && error.kind === 'ObjectId') {
                return res.status(400).json({ error: 'Invalid ObjectId format' });
            }

            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const { userId, products } = req.body;
            console.log("Request body:", userId, products);

            // Find the user's cart
            let cart = await Cart.findOne({ user: userId });

            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            if (cart.products.length === 0) {
                return res.status(400).json({ error: 'Cart is already empty' });
            }

            for (const productInfo of products) {
                const { productId, quantity } = productInfo;

                // Validate that the quantity is a positive integer
                if (!Number.isInteger(quantity) || quantity <= 0) {
                    return res.status(400).json({ error: 'Quantity must be a positive integer' });
                }

                // Check if the product exists in the cart
                const existingProductIndex = cart.products.findIndex(
                    (item) => item.product.toString() === productId
                );

                if (existingProductIndex === -1) {
                    return res.status(404).json({ error: `Product with ID ${productId} not found in the cart` });
                }

                // Decrement the quantity of the product in the cart
                const existingProduct = cart.products[existingProductIndex];
                if (existingProduct.quantity > quantity) {
                    existingProduct.quantity -= quantity;
                } else {
                    cart.products.splice(existingProductIndex, 1);
                }

                const product = await Product.findById(productId);
                if (!product) {
                    return res.status(404).json({ error: `Product with ID ${productId} not found` });
                }
                cart.total -= quantity * product.price;
            }

            await cart.save();

            res.status(200).json({ message: 'Products removed from cart successfully', cart });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    checkout: async (req, res) => {
        try {
            const { cartId } = req.params;

            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            const cartData = cart.products;

            const productsOutOfStock = [];

            for (const cartItem of cartData) {
                const { product, quantity } = cartItem;
                const productId = product._id;

                // Find the corresponding product in the database
                const existingProduct = await Product.findById(productId);

                if (!existingProduct) {
                    return res.status(400).json({ error: `Product ${productId} not found` });
                }

                // Check if the product has sufficient stock
                if (existingProduct.stock < quantity) {
                    productsOutOfStock.push({ productId, productName: existingProduct.name });
                } else {
                    existingProduct.stock -= quantity;
                    await existingProduct.save();
                }
            }


            if (productsOutOfStock.length > 0) {
                return res.status(400).json({
                    error: 'Some products are out of stock',
                    productsOutOfStock,
                    cart
                });
            }

            // console.log("cart: ", cart)

            // Clear or remove the cart after a successful checkout
            await Cart.deleteOne({
                _id: cart.cartId
            })

            res.status(200).json({ message: 'Checkout successful' });
        } catch (error) {
            console.error('Error during checkout:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },



};

module.exports = CartController;
