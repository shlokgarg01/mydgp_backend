const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/CatchAsyncErrors");
const User = require("../models/UserModel");
const sendToken = require("../utils/JwtToken");
const Enums = require("../utils/Enums")

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

// send OTP for registration
exports.sendOTPForRegistration = catchAsyncErrors(async (req, res, next) => {
  const { contactNumber } = req.body;
  const user = await User.findOne({ contactNumber });
  if (user) {
    return next(
      new ErrorHandler(
        "User with this Contact Number already exists. Please login.",
        400
      )
    );
  }

  res.status(200).json({
    success: true,
    message: "OTP can be sent.",
  });
});

// register user via OTP
exports.registerUserViaOTP = catchAsyncErrors(async (req, res, next) => {
  const { name, email, contactNumber, service } = req.body;
  let role = req.body.role || Enums.USER_ROLES.USER // in case of service provider, we send role from front_end
  
  const user = await User.create({
    name,
    email,
    contactNumber,
    role,
    service
  });
  sendToken(user, 201, res);
});

// send OTP for Login
exports.sendOTPForLogin = catchAsyncErrors(async (req, res, next) => {
  const { contactNumber } = req.body;
  const user = await User.findOne({ contactNumber });
  if (!user) {
    return next(
      new ErrorHandler(
        "User with this Contact Number does not exist. Please Register.",
        400
      )
    );
  }

  res.status(200).json({
    success: true,
    message: "User Present. OTP can be sent",
  });
});

// autheticate the OTP for Login
exports.authenticateUserViaOTPForLogin = catchAsyncErrors(async (req, res, next) => {
  const { contactNumber } = req.body;
  const user = await User.findOne({ contactNumber });
  if(!user) {
    return next(new ErrorHandler("No user found for the given Contact Number."))
  }

  sendToken(user, 201, res);
});

// get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});