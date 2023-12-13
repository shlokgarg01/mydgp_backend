const express = require("express");
const Enums = require('../utils/Enums')
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/Auth");
const { getAllBookingRequests } = require("../controllers/BookingRequestsController");
const router = express.Router();

router.route("/bookingrequests").get(isAuthenticatedUser, authorizeRoles(Enums.USER_ROLES.SERVICE_PROVIDER), getAllBookingRequests);

module.exports = router;
