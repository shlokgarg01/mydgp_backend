const BookingRequest = require("../models/BookingRequestsModel")
const catchAsyncErrors = require("../middleware/CatchAsyncErrors");

// get all booking requests
exports.getAllBookingRequests = catchAsyncErrors(async (req, res, next) => {
  let bookingRequests = await BookingRequest.find()

  res.status(201).json({
    success: true,
    bookingRequests
  });
})