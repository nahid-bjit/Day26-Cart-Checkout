const express = require("express");
const cors = require("cors");
const app = express();
const UserRouter = require("./routes/User");
const ProductRouter = require("./routes/Product");
const TransactionRouter = require("./routes/Transaction");
const AuthRouter = require("./routes/Auth");
const CartRouter = require("./routes/Cart");
const dotenv = require("dotenv");
const databaseConnection = require("./config/database");

dotenv.config();

app.use(cors({ origin: "*" }));
app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: true })); // Parses data as urlencoded

app.use("/products", ProductRouter);
app.use("/transactions", TransactionRouter);
app.use("/users", UserRouter);
app.use("/auth", AuthRouter);
app.use("/cart", CartRouter);


databaseConnection(() => {
    app.listen(8000, () => {
        console.log("Server is running on port 8000");
    });
});
