require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const prisma = require("./prisma/client");

const app = express();
const httpServer = createServer(app);

// CORS config
app.use(
  cors()
);

// Security headers to prevent caching of authenticated responses
app.use((req, res, next) => {
  // Prevent caching of API responses
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// Middleware
app.use(express.json());

// Make prisma accessible to routes
app.set("prisma", prisma);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/budget", require("./routes/budgetRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/savings", require("./routes/savingsRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// Test route
app.get("/", (req, res) => res.send("API is running..."));

// Socket.IO setup
// const io = new Server(httpServer);

// // Socket.IO connection handling
// io.on("connection", (socket) => {
//   console.log("Client connected");

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// // Make io accessible to routes
// app.set("io", io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
