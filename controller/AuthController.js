const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const { failure, success } = require("../util/common");
const bcrypt = require("bcrypt");
const Auth = require("../model/Auth");
const User = require("../model/User");
const jsonwebtoken = require("jsonwebtoken");

class AuthController {
    async login(req, res) {
        const { email, password } = req.body;
        const auth = await Auth.findOne({ email: email })
            .populate("user", "-createdAt -updatedAt")
            .select("-createdAt -updatedAt");
        // console.log({ ...auth });
        if (!auth) {
            return res.status(HTTP_STATUS.OK).send(failure("User is not registered"));
        }
        const checkPassword = await bcrypt.compare(password, auth.password);

        if (!checkPassword) {
            return res.status(HTTP_STATUS.OK).send(failure("Invalid credentials"));
        }
        const responseAuth = auth.toObject();
        delete responseAuth.password;

        const jwt = jsonwebtoken.sign(responseAuth, process.env.SECRET_KEY, { expiresIn: "1h" });

        responseAuth.token = jwt;
        return res.status(HTTP_STATUS.OK).send(success("Successfully logged in", responseAuth));
    }
    async signup(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res.status(HTTP_STATUS.OK).send(failure("Failed to add the user", validation));
            }
            const { name, email, password, phone, address, role } = req.body;
            const auth = await Auth.findOne({ email: email });
            if (auth) {
                return res.status(HTTP_STATUS.OK).send(failure("Email is already registered"));
            }

            const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
                return hash;
            });
            const user = await User.create({
                name: name,
                email: email,
                phone: phone,
                address: address,
            });
            const result = await Auth.create({
                email: email,
                password: hashedPassword,
                user: user._id,
                verified: false,
                role: role,
            });
            if (!result) {
                return res.status(HTTP_STATUS.OK).send(failure("Failed to add the user"));
            }

            return res.status(HTTP_STATUS.OK).send(success("Successfully signed up", user));
        } catch (error) {
            console.log(error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
        }
    }
}

module.exports = new AuthController();
