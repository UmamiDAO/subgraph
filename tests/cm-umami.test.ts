import { assert, describe, test } from "matchstick-as/assembly/index";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  test("PpsEntity created and stored", () => {
    assert.entityCount("PpsEntity", 1);

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  });
});
