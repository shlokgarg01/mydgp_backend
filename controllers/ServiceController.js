const Service = require('../models/ServiceModel')
const catchAsyncErrors = require("../middleware/CatchAsyncErrors");
const ErrorHandler = require('../utils/errorHandler');

// create a service
exports.createService = catchAsyncErrors(async (req, res, next) => {
  const { name, charges } = req.body;
  const service = await Service.create({
    name,
    charges
  });

  res.status(200).json({
    success: true,
    service
  })
})

// edit a service
exports.updateService = catchAsyncErrors(async (req, res, next) => {
  let service = await Service.findById(req.params.id)
  if (!service) {
    return next(new ErrorHandler("Service Not Found", 404))
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
    service
  })
})

// delete a service
exports.deleteService = catchAsyncErrors(async (req, res, next) => {
  const service = await Service.findById(req.params.id)
  if (!service) {
    return next(new ErrorHandler("Service Not Found", 404))
  }

  await Service.deleteOne()
  res.status(200).json({
    success: true,
    message: "Service Deleted SUccessfully"
  })
})

// get a service by Id
exports.getServiceDetails = catchAsyncErrors(async (req, res, next) => {
  const service = await Service.findById(req.params.id)
  if (!service) {
    return next(new ErrorHandler("Service Not Found", 404))
  }

  res.status(200).json({
    success: true,
    service
  })
})

// get all services
exports.getAllServices = catchAsyncErrors(async (req, res, next) => {
  const services = await Service.find().select("name")
  console.log("=======================", services)
  for (let i=0;i<services.length;++i) {
    services[i]['value'] = services[i].name
  }
  console.log("---------------------------", services)

  res.status(200).json({
    success: true,
    services
  })
})