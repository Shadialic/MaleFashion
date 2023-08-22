const referralCodes = require("referral-codes");
const User = require('../models/userModels');

const reffrelcodeGen = () => {
  return referralCodes.generate({ 
    length: 8,
    count: 1,
    charset: referralCodes.charset(referralCodes.Charset.ALPHABETIC),

  });
}

module.exports = { reffrelcodeGen };
