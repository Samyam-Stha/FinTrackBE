const jwt = require("jsonwebtoken"); // ✅ Add this line at the top
const { isTokenBlacklisted } = require("../controllers/authController");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];

  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: "Token has been invalidated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ set it as full decoded object (with id, email, name)
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
