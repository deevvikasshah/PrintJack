const http = require("http");
const { Server } = require("socket.io");
const { app } = require("./app");
const { runCleanupOnInterval } = require("./jobs/cleanupUploads");

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://printjack.in",
  "https://www.printjack.in",
  "https://print-jack.vercel.app",
  "https://client-navy-ten-73.vercel.app",
  "https://client-idsp7wpad-markivs.vercel.app",
  "https://client-lyv6xipft-markivs.vercel.app",
  "https://printjack.vercel.app",
  "https://printjack-h532n5ohs-markivs.vercel.app",
]
  .filter(Boolean)
  .map((o) => o.replace(/\/+$/, ""));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-design", (designId, userId) => {
    socket.join(`design-${designId}`);
    socket.to(`design-${designId}`).emit("user-joined", { userId, socketId: socket.id });
  });

  socket.on("design-update", (designId, data) => {
    socket.to(`design-${designId}`).emit("design-changed", {
      ...data,
      userId: socket.handshake.auth.userId,
      socketId: socket.id,
    });
  });

  socket.on("cursor-update", (designId, data) => {
    socket.to(`design-${designId}`).emit("cursor-moved", {
      ...data,
      userId: socket.handshake.auth.userId,
      socketId: socket.id,
    });
  });

  socket.on("leave-design", (designId) => {
    socket.leave(`design-${designId}`);
    socket.to(`design-${designId}`).emit("user-left", { socketId: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `PrintJack server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

// In-process daily cleanup for always-on deployments (Render/local).
runCleanupOnInterval();

module.exports = { app, io };