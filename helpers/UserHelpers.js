const User = require("../models/UserModel")
const Enums = require("../utils/Enums")

const getServiceProviders = async () => {
  const service_providers = await User.find({ role: Enums.USER_ROLES.SERVICE_PROVIDER })
  return service_providers || []
}

module.exports = {
  getServiceProviders
}