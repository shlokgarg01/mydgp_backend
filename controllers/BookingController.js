const Booking = require("../models/BookingModel");
const BookingRequest = require("../models/BookingRequestsModel");
const User = require("../models/UserModel");
const Redeem = require("../models/RedeemModel");

const catchAsyncErrors = require("../middleware/CatchAsyncErrors");
const { getAvailableServiceProviders } = require("../helpers/UserHelpers");
const Enums = require("../utils/Enums");
const ErrorHandler = require("../utils/errorHandler");

// create a booking
exports.createBooking = catchAsyncErrors(async (req, res, next) => {
  const {
    customer,
    address,
    paymentInfo,
    coupon,
    couponDiscount,
    service,
    hours,
    date,
    itemsPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  // get all available Service Providers
  let allServiceProviders = await getAvailableServiceProviders(date, service);
  if (allServiceProviders.length === 0) {
    return next(
      new ErrorHandler(
        "No service provider is available on the selected date. Please select a new date",
        400
      )
    );
  }
  let serviceProvider = allServiceProviders[0];

  // create a booking
  const booking = await Booking.create({
    customer,
    address,
    paymentInfo,
    itemsPrice,
    taxPrice,
    hours,
    service,
    date,
    totalPrice,
    coupon,
    couponDiscount,
    paidAt: Date.now(),
  });

  // create a request in BookingRequest table
  await BookingRequest.create({
    customer,
    booking: booking._id,
    serviceProvider,
    address,
    service,
  });

  res.status(201).json({
    success: true,
    booking,
  });
});

// update status of booking - to be done by the service_provider
exports.updateBookingStatus = catchAsyncErrors(async (req, res, next) => {
  let booking = await Booking.findOne({
      _id: req.params.id,
      serviceProvider: req.user._id,
    }),
    newStatus = req.body.status;

  if (!booking) {
    return next(new ErrorHandler("No such booking exists!", 404));
  }
  let currentStatus = booking.status;

  // Validations
  if (currentStatus === Enums.BOOKING_STATUS.CLOSED) {
    return next(new ErrorHandler(`Booking Already Closed!`, 400));
  } else if (
    newStatus !== Enums.BOOKING_STATUS.ONGOING &&
    newStatus !== Enums.BOOKING_STATUS.CLOSED
  ) {
    return next(new ErrorHandler("Invalid Status!", 400));
  }

  // Update the booking
  if (
    (currentStatus === Enums.BOOKING_STATUS.ACCEPTED &&
      newStatus === Enums.BOOKING_STATUS.ONGOING) ||
    (currentStatus === Enums.BOOKING_STATUS.ONGOING &&
      newStatus === Enums.BOOKING_STATUS.CLOSED)
  ) {
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true, runValidators: true, useFindAndModify: false }
    );

    if (newStatus === Enums.BOOKING_STATUS.CLOSED) {
      // Updating total Earnings on the User
      let totalEarnings = (req.user.totalEarnings || 0) + booking.totalPrice;
      await User.findByIdAndUpdate(
        req.user._id,
        { totalEarnings },
        { new: true, runValidators: true, useFindAndModify: false }
      );

      // updating the amount in Redeem model
      let redeem = await Redeem.findOneAndUpdate(
        { serviceProvider: req.user._id },
        { $inc: { amountToBeRedeemed: 10 } },
        { new: true }
      ); // TODO - update the logic to add the amount

      console.log("=======================", redeem)
    }
  } else {
    return next(
      new ErrorHandler(
        "Cannot perform this operation for the current status!",
        400
      )
    );
  }

  res.status(200).json({
    success: true,
    message: "Booking Status Updated",
  });
});

// fetch all completed bookings of a user
exports.getCompletedBookingsOfAUser = catchAsyncErrors(
  async (req, res, next) => {
    let bookings = await Booking.find({
      serviceProvider: req.user._id,
      status: Enums.BOOKING_STATUS.CLOSED,
    })
      .sort("date")
      .populate("customer address");

    res.status(200).json({
      success: true,
      bookings,
    });
  }
);

// fetch all current bookings of a user
exports.getCurrentBookingsOfAUser = catchAsyncErrors(async (req, res, next) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 1);

  let bookings = await Booking.find({
    serviceProvider: req.user._id,
    date: {
      $gte: currentDate,
      $lt: nextDay,
    },
    status: { $ne: Enums.BOOKING_STATUS.CLOSED },
  }).populate("customer address");

  res.status(200).json({
    success: true,
    bookings,
  });
});

// fetch all future bookings of a user
exports.getFutureBookingsOfAUser = catchAsyncErrors(async (req, res, next) => {
  const today = new Date();
  let bookings = await Booking.find({
    serviceProvider: req.user._id,
    date: { $gte: today },
    status: { $ne: Enums.BOOKING_STATUS.CLOSED },
  })
    .sort("date")
    .populate("customer address");

  res.status(200).json({
    success: true,
    bookings,
  });
});
