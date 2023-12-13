const Booking = require("../models/BookingModel");
const BookingRequest = require("../models/BookingRequestsModel")
const catchAsyncErrors = require("../middleware/CatchAsyncErrors");
const { getServiceProviders } = require("../helpers/UserHelpers")

// create a booking
exports.createBooking = catchAsyncErrors(async (req, res, next) => {
  const {
    customer,
    address,
    paymentInfo,
    coupon,
    couponDiscount,
    itemsPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  let allServiceProviders = await getServiceProviders()
  let serviceProvider = allServiceProviders[0]._id
  
  // create a booking
  const booking = await Booking.create({
    customer,
    address,
    paymentInfo,
    itemsPrice,
    taxPrice,
    totalPrice,
    coupon,
    couponDiscount,
    paidAt: Date.now()
  });

  // create a request in BookingRequest table
  const bookingRequest = await BookingRequest.create({
    customer,
    booking: booking._id,
    serviceProvider
  })

  res.status(201).json({
    success: true,
    booking
  });
})