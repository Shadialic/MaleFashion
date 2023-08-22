const otpGenerator = require('otp-generator');

const otpGen = () => {
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    });
};

module.exports = { otpGen };