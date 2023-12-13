const express = require("express");
const { isAuthenticatedUser } = require("../middleware/Auth");
const { createBooking } = require("../controllers/BookingController");
const router = express.Router();

router.route("/booking/new").post(isAuthenticatedUser, createBooking);

module.exports = router;
