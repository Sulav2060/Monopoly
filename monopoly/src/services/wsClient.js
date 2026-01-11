/**
 * WebSocket Client for Monopoly Game
 * Handles real-time game communication with backend
 *
 * Message Contract:
 * Client → Server: { type: "ROLL_DICE", gameId, playerId }
 * Server → Client: { type: "GAME_STATE_UPDATE", gameId, state }
 */

class GameSocketManager {
  constructor() {
    this.socket = null;
    this.gameId = "game-1";
    this.playerId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.isIntentionallyClosed = false;
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket URL (e.g., "ws://localhost:4000")
   * @param {string} gameId - Game ID to join
   * @param {string} playerId - Player ID
   */
  connect(url, gameId, playerId, playerName) {
    return new Promise((resolve, reject) => {
      try {
        this.gameId = gameId;
        this.playerId = playerId;
        this.playerName = playerName || `Player ${playerId?.split("-").pop()}`;
        this.isIntentionallyClosed = false;

        console.log(`🔌 Connecting WebSocket to ${url}`);
        this.socket = new WebSocket(url);

        // Connection opened
        this.socket.onopen = () => {
          console.log("✅ WebSocket connected");
          this.reconnectAttempts = 0;

          // Send JOIN_GAME message with player data
          console.log("📤 Sending: JOIN_GAME");
          this.socket.send(
            JSON.stringify({
              type: "JOIN_GAME",
              gameId,
              playerId: this.playerId,
              playerName: this.playerName,
            })
          );

          this._trigger("connect");
          resolve();
        };

        // Handle incoming messages
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log(`📨 Received: ${message.type}`, message);

            if (message.type === "GAME_STATE_UPDATE") {
              if (message.gameId === this.gameId) {
                this._trigger("gameStateUpdate", message.state);
              }
            } else if (message.type === "ERROR") {
              console.error("❌ Server error:", message.message);
              this._trigger("error", new Error(message.message));
            } else {
              this._trigger(message.type, message);
            }
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        };

        // Connection closed
        this.socket.onclose = () => {
          console.log("👋 WebSocket disconnected");
          this._trigger("disconnect");

          if (!this.isIntentionallyClosed) {
            this._attemptReconnect(url, gameId, playerId, this.playerName);
          }
        };

        // Error handling
        this.socket.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          this._trigger("error", error);
          reject(error);
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            const timeoutError = new Error("WebSocket connection timeout");
            this.socket?.close();
            reject(timeoutError);
          }
        }, 10000);
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        reject(error);
      }
    });
  }

  /**
   * Send a message to the server
   * @param {object} message - Message object with 'type' property
   */
  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    console.log(`📤 Sending: ${message.type}`);
    this.socket.send(JSON.stringify(message));
  }

  /**
   * Roll dice (sends ROLL_DICE message)
   */
  rollDice() {
    if (!this.gameId || !this.playerId) {
      throw new Error("Game or player not set");
    }

    this.send({
      type: "ROLL_DICE",
      gameId: this.gameId,
      playerId: this.playerId,
    });
  }

  /**
   * Listen for events
   * @param {string} event - Event name ('gameStateUpdate', 'error', 'connect', etc.)
   * @param {function} callback - Handler function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    console.log("🔌 WebSocket disconnected");
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // ─── Private Methods ───

  _trigger(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in listener for ${event}:`, e);
        }
      });
    }
  }

  _attemptReconnect(url, gameId, playerId, playerName) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(
        `🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect(url, gameId, playerId, playerName).catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached");
      this._trigger("error", new Error("Failed to reconnect"));
    }
  }
}

// Export singleton instance
export const wsClient = new GameSocketManager();
export default GameSocketManager;
