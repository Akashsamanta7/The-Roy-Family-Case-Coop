import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import roomRoutes from "./routes/roomRoutes.js";
import { Room } from "./models/Room.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());

app.use("/api/rooms", roomRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "The Roy Family Case backend is running.",
    status: "online",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on(
    "room:join",
    async (
      data: {
        roomId: string;
        officerId: string;
      },
      callback
    ) => {
      try {
        const roomId = data.roomId.toUpperCase();

        const room = await Room.findOne({ roomId });

        if (!room) {
          callback?.({
            success: false,
            message: "ROOM NOT FOUND",
          });

          return;
        }

        const officer = room.officers.find(
          (item) => item.officerId === data.officerId
        );

        if (!officer) {
          callback?.({
            success: false,
            message: "OFFICER NOT VERIFIED FOR THIS ROOM",
          });

          return;
        }

        /*
        ========================================
        SAME OFFICER SESSION REPLACEMENT
        ========================================
        */

        if (
          officer.socketId &&
          officer.socketId !== socket.id
        ) {
          io.to(officer.socketId).emit(
            "session:replaced",
            {
              message:
                "Your officer identity has been accessed from another session.",
            }
          );

          const oldSocket =
            io.sockets.sockets.get(officer.socketId);

          if (oldSocket) {
            oldSocket.leave(roomId);
            oldSocket.disconnect(true);
          }
        }

        /*
        ========================================
        JOIN NEW SOCKET TO ROOM
        ========================================
        */

        socket.join(roomId);

        socket.data.roomId = roomId;
        socket.data.officerId = data.officerId;

        officer.isOnline = true;
        officer.socketId = socket.id;
        officer.lastKnownActivity =
          "Reviewing investigation";

        room.lastActivity = new Date();

        await room.save();

        /*
        ========================================
        NOTIFY TEAM
        ========================================
        */

        io.to(roomId).emit("officer:joined", {
          officerId: officer.officerId,
          name: officer.name,
          rank: officer.rank,
          socketId: socket.id,
          isOnline: true,
          lastKnownActivity:
            officer.lastKnownActivity,
        });

        /*
        ========================================
        RETURN UPDATED ROOM STATE
        ========================================
        */

        callback?.({
          success: true,
          room,
        });

        console.log(
          `${officer.name} joined room ${roomId}`
        );
      } catch (error) {
        console.error(
          "Failed to join Socket.IO room:",
          error
        );

        callback?.({
          success: false,
          message: "Failed to join investigation room.",
        });
      }
    }
  );

  /*
  ========================================
  ACTIVITY UPDATE
  ========================================
  */

  socket.on(
    "officer:activity",
    async (
      data: {
        activity: string;
      }
    ) => {
      try {
        const roomId = socket.data.roomId;
        const officerId = socket.data.officerId;

        if (!roomId || !officerId) {
          return;
        }

        const room = await Room.findOne({
          roomId,
        });

        if (!room) {
          return;
        }

        const officer = room.officers.find(
          (item) => item.officerId === officerId
        );

        if (!officer) {
          return;
        }

        officer.lastKnownActivity =
          data.activity;

        room.lastActivity = new Date();

        await room.save();

        socket.to(roomId).emit(
          "officer:activity",
          {
            officerId,
            activity: data.activity,
          }
        );
      } catch (error) {
        console.error(
          "Failed to update officer activity:",
          error
        );
      }
    }
  );

  /*
  ========================================
  OFFICER DISCONNECT
  ========================================
  */

  socket.on("disconnect", async () => {
    console.log(
      `Socket disconnected: ${socket.id}`
    );

    try {
      const roomId = socket.data.roomId;
      const officerId = socket.data.officerId;

      if (!roomId || !officerId) {
        return;
      }

      const room = await Room.findOne({
        roomId,
      });

      if (!room) {
        return;
      }

      const officer = room.officers.find(
        (item) => item.officerId === officerId
      );

      if (!officer) {
        return;
      }

      /*
      Important:
      Only mark offline if this socket is still
      the active socket for this officer.

      This prevents an old replaced session from
      accidentally marking the new session offline.
      */

      if (officer.socketId === socket.id) {
        officer.isOnline = false;
        officer.socketId = undefined;
        officer.lastKnownActivity = "Offline";

        room.lastActivity = new Date();

        await room.save();

        io.to(roomId).emit(
          "officer:disconnected",
          {
            officerId: officer.officerId,
            name: officer.name,
          }
        );
      }
    } catch (error) {
      console.error(
        "Failed to process officer disconnect:",
        error
      );
    }
  });
});

async function startServer() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected successfully.");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
