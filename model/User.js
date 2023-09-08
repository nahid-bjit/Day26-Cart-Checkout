const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxLength: 30,
        },
        email: {
            type: String,
            required: true,
        },
        role: {
            type: Number, // 1 = admin, 2 = regular
            required: false,
            default: 2,
        },
        phone: {
            type: String,
            required: false,
        },
        address: {
            house: String,
            road: String,
            area: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
        },
        verified: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
