const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const TransactionModel = require("../model/Transaction");
const ProductModel = require("../model/Product");
const HTTP_STATUS = require("../constants/statusCodes");

class Transaction {
    async getAll(req, res) {
        try {
            const { detail } = req.query;
            let transactions;
            if (detail && detail != "1") {
                return res
                    .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                    .send(failure("Invalid parameter sent"));
            }

            if (detail === "1") {
                transactions = await TransactionModel.find({})
                    .populate("user", "name email")
                    .populate("products.product", "title description price rating brand")
                    .select("-__v");
            } else {
                transactions = await TransactionModel.find({});
            }
            if (transactions.length > 0) {
                return res.status(HTTP_STATUS.OK).send(
                    success("Successfully received all transactions", {
                        result: transactions,
                        total: transactions.length,
                    })
                );
            }
            return res.status(HTTP_STATUS.OK).send(success("No transactions were found"));
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error"));
        }
    }

    async create(req, res) {
        try {
            const { user, products } = req.body;
            const productsList = products.map((element) => {
                return element.product;
            });

            // Checking if all products in list from body are actually present in database
            const productsInCart = await ProductModel.find({
                _id: {
                    $in: productsList,
                },
            }).select("price");
            let totalPrice = 0;

            // If any of the product id is invalid, this length will fail to match
            if (productsInCart.length !== products.length) {
                return res.status(HTTP_STATUS.OK).send(failure("All the IDs are not valid IDs"));
            }

            // Calculating total price
            totalPrice = productsInCart.reduce((accumulator, current, i) => {
                return accumulator + current.price * products[i].quantity;
            }, 0);

            const newTransaction = await TransactionModel.create({
                user: user,
                products: products,
                total: totalPrice,
            });

            if (newTransaction) {
                return res.status(HTTP_STATUS.OK).send(
                    success("Successfully created new transaction", {
                        result: newTransaction,
                    })
                );
            }
            return res.status(HTTP_STATUS.OK).send(failure("Failed to add transaction"));
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error"));
        }
    }
}

module.exports = new Transaction();
