const JWT = require("jsonwebtoken");

const secret = Jprocess.env.JWT_SECRET;

function createTokenForUser(user) {
  const payload = {
    fullName: user.fullName,
    _id: user._id,
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role,
  };

  return JWT.sign(payload, secret);
}

function verifyToken(token) {
  return JWT.verify(token, secret);
}

module.exports = {
  createTokenForUser,
  verifyToken,
};