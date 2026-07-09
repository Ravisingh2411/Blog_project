const { verifyToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const token = req.cookies[cookieName];

    if (!token) {
      return next();
    }

    try {
      const userPayload = verifyToken(token);
      req.user = userPayload;
    } catch (err) {
      console.log(err.message);
    }

    next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};