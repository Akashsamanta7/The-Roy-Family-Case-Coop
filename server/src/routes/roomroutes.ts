import { Router } from "express";
import crypto from "crypto";
import { Room } from "../models/Room.js";
import { GAME_CONFIG } from "../config/game.js";

const router = Router();

/*
================================
VERIFY CASE ACCESS CODE
================================
*/

router.post("/access-code", (req, res) => {
  const { accessCode } = req.body;

  if (accessCode !== GAME_CONFIG.caseAccessCode) {
    return res.status(401).json({
      success: false,
      message: "ACCESS DENIED",
    });
  }

  return res.json({
    success: true,
    message: "ACCESS GRANTED",
  });
});

/*
================================
CREATE A NEW ROOM
================================
*/

function generateRoomId() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const randomPart = (length: number) => {
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(
        0,
        characters.length
      );

      result += characters[randomIndex];
    }

    return result;
  };

  return `ROY-${randomPart(4)}-${randomPart(4)}`;
}

router.post("/", async (_req, res) => {
  try {
    let roomId = generateRoomId();

    while (await Room.exists({ roomId })) {
      roomId = generateRoomId();
    }

    const room = await Room.create({
      roomId,
      caseId: GAME_CONFIG.caseId,
      officers: [],
      reviewedEvidence: [],
      reviewedPeople: [],
      reviewedTimelineEvents: [],
      teamNotes: [],
      personalNotes: [],
      activityLog: [],
      verdict: {
        isSubmitted: false,
        answers: [],
      },
    });

    return res.status(201).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Failed to create room:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create investigation room.",
    });
  }
});

/*
================================
GET EXISTING ROOM
================================
*/

router.get("/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId.toUpperCase();

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "ROOM NOT FOUND",
      });
    }

    return res.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Failed to find room:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve investigation room.",
    });
  }
});

/*
================================
VERIFY OFFICER AND JOIN ROOM
================================
*/

router.post("/:roomId/join", async (req, res) => {
  try {
    const roomId = req.params.roomId.toUpperCase();

    const {
      officerId,
      verificationCode,
    } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "ROOM NOT FOUND",
      });
    }

    const officer = GAME_CONFIG.officers.find(
      (item) => item.officerId === officerId
    );

    if (!officer) {
      return res.status(400).json({
        success: false,
        message: "INVALID OFFICER",
      });
    }

    if (
      officer.verificationCode !== verificationCode
    ) {
      return res.status(401).json({
        success: false,
        message: "VERIFICATION FAILED",
      });
    }

    const existingOfficer = room.officers.find(
      (item) => item.officerId === officerId
    );

    if (!existingOfficer) {
      if (room.officers.length >= GAME_CONFIG.maxPlayers) {
        return res.status(403).json({
          success: false,
          message: "INVESTIGATION TEAM FULL",
        });
      }

      room.officers.push({
        officerId: officer.officerId,
        name: officer.name,
        rank: officer.rank,
        isOnline: false,
        lastKnownActivity: "Joining investigation",
      });
    }

    room.lastActivity = new Date();

    await room.save();

    return res.json({
      success: true,

      room,

      officer: {
        officerId: officer.officerId,
        name: officer.name,
        rank: officer.rank,
        role: officer.role,
      },

      message: "IDENTITY VERIFIED",
    });
  } catch (error) {
    console.error("Failed to join room:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join investigation room.",
    });
  }
});

export default router;
