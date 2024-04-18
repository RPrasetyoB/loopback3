const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_SECRET;
module.exports = {
  getToken: function(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, jwtKey);
      return decoded;
    } catch (error) {
      return null;
    }
  },
  loggedUser: function(decodedToken) {
    return {
      userId: decodedToken.userId,
    };
  },
};
