import { drawCommunityChest } from "../../engine/drawCommunityChest";
import { GameState } from "../../types/game";

describe("drawCommunityChest", () => {
  test("money card gives money", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 2,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      communityChestDeck: [{ type: "MONEY", amount: 200 }],
      communityChestIndex: 0,
    };

    const result = drawCommunityChest(state);

    expect(result.players[0]!.money).toBe(1200);
    expect(result.communityChestIndex).toBe(0); // wraps
    expect(result.events[0]).toEqual({
      type: "COMMUNITY_CHEST",
      card: { type: "MONEY", amount: 200 },
    });
  });

  test("GO_TO_JAIL card sends player to jail", () => {
    const state: GameState = {
      players: [
        {
          id: "p1",
          name: "A",
          position: 2,
          money: 1000,
          inJail: false,
          jailTurns: 0,
          isBankrupt: false,
        },
      ],
      currentTurnIndex: 0,
      events: [],
      properties: [],
      communityChestDeck: [{ type: "GO_TO_JAIL" }],
      communityChestIndex: 0,
    };

    const result = drawCommunityChest(state);

    expect(result.players[0]!.inJail).toBe(true);
    expect(result.events.some((e) => e.type === "PLAYER_SENT_TO_JAIL")).toBe(
      true
    );
  });
});
