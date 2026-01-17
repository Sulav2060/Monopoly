import { payRent } from "../../engine/payRent";
import { createBaseState } from "../helpers/gameState";
import { testProperty } from "../helpers/tiles";

describe("payRent", () => {
  test("does nothing if property has no owner", () => {
    const state = createBaseState();
    state.properties = [];

    const result = payRent(state, testProperty);

    expect(result).toEqual(state);
  });

  test("does nothing if player owns the property", () => {
    const state = createBaseState();
    if (!state.properties[0]) {
      console.log("no state found");
      return;
    }
    state.properties = [
      {
        tileIndex: 1, 
        ownerId: "p1",
      },
    ];

    const result = payRent(state, testProperty);

    expect(result).toEqual(state);
  });

  test("transfers rent from player to owner", () => {
    const state = createBaseState();

    const result = payRent(state, testProperty);

    expect(result.players[0]!.money).toBe(1450);
    expect(result.players[1]!.money).toBe(1550);
  });

  test("adds RENT_PAID event", () => {
    const state = createBaseState();

    const result = payRent(state, testProperty);

    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toEqual({
      type: "RENT_PAID",
      from: "p1",
      to: "p2",
      amount: 50,
    });
  });

  test("does not mutate original state", () => {
    const state = createBaseState();

    payRent(state, testProperty);

    expect(state.players[0]!.money).toBe(1500);
    expect(state.players[1]!.money).toBe(1500);
    expect(state.events).toHaveLength(0);
  });
});
