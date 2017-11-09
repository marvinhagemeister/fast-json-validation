import { validate } from "../validate";
import { data, schema } from "./fixtures/fstab";

describe("e2e", () => {
  it("should be true", () => {
    expect(validate(data, schema)).toEqual({ valid: true, error: undefined });
  });
});
