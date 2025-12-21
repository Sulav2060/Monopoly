import express, { Request, Response } from "express";
import RoomManager from "../services/room.service";
import { ApiResponse } from "../types/game";

const router = express.Router();
const roomManager = RoomManager.getInstance();

/**
 * POST /room/create
 * Create a new room
 */
router.post("/create", (req: Request, res: Response) => {
  try {
    const { roomName, hostId, hostName } = req.body;

    if (!roomName || !hostId || !hostName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: roomName, hostId, hostName",
      } as ApiResponse);
    }

    const room = roomManager.createRoom(roomName, hostId, hostName);

    return res.status(201).json({
      success: true,
      data: room,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }
});

/**
 * GET /room/:roomId
 * Get room details
 */
router.get("/:roomId", (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: roomId",
      } as ApiResponse);
    }
    const room = roomManager.getRoom(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found",
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      data: room,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }
});

/**
 * GET /room
 * Get all available rooms
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const rooms = roomManager.getAvailableRooms();

    return res.status(200).json({
      success: true,
      data: rooms,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }
});

/**
 * POST /room/:roomId/join
 * Join an existing room
 */
router.post("/:roomId/join", (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: roomId",
      } as ApiResponse);
    }
    const { playerId, playerName } = req.body;

    if (!playerId || !playerName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: playerId, playerName",
      } as ApiResponse);
    }

    const room = roomManager.joinRoom(roomId, playerId, playerName);

    return res.status(200).json({
      success: true,
      data: room,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }
});

/**
 * POST /room/:roomId/leave
 * Leave a room
 */
router.post("/:roomId/leave", (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: roomId",
      } as ApiResponse);
    }    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: roomId",
      } as ApiResponse);
    }
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: playerId",
      } as ApiResponse);
    }

    const room = roomManager.leaveRoom(roomId, playerId);

    return res.status(200).json({
      success: true,
      data: room,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }
});

/**
 * POST /room/:roomId/start
 * Start a game in the room
 */
router.post("/:roomId/start", (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: roomId",
      } as ApiResponse);
    }
    const game = roomManager.startGame(roomId);

    return res.status(200).json({
      success: true,
      data: game,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }
});

/**
 * GET /room/:roomId/all
 * Get all rooms (debug endpoint)
 */
router.get("/all/list", (req: Request, res: Response) => {
  try {
    const rooms = roomManager.getAllRooms();

    return res.status(200).json({
      success: true,
      data: rooms,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    } as ApiResponse);
  }
});

export default router;
