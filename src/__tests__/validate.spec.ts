import * as v from "../validate";
import * as n from "../nodes";

describe("validate", () => {
  describe("literal", () => {
    it("should check strings", () => {
      expect(v.checkLiteral("foo", n.literal("foo"), [])).toEqual(undefined);
      expect(typeof v.checkLiteral("foo", n.literal("bar"), [])).toEqual(
        "string",
      );
    });

    it("should check numbers", () => {
      expect(v.checkLiteral(2, n.literal(2), [])).toEqual(undefined);
      expect(typeof v.checkLiteral(2, n.literal(200), [])).toEqual("string");
    });

    it("should check booleans", () => {
      expect(v.checkLiteral(true, n.literal(true), [])).toEqual(undefined);
      expect(typeof v.checkLiteral(true, n.literal(false), [])).toEqual(
        "string",
      );
    });

    it("should check booleans", () => {
      expect(v.checkLiteral(null, n.literal(null), [])).toEqual(undefined);
      expect(typeof v.checkLiteral(null, n.literal(false), [])).toEqual(
        "string",
      );
    });
  });

  describe("primitive", () => {
    it("should check string", () => {
      expect(v.checkPrimitive("foo", n.string())).toEqual(true);
      expect(v.checkPrimitive(null, n.string())).toEqual(false);
    });

    it("should check number", () => {
      expect(v.checkPrimitive(2, n.number())).toEqual(true);
      expect(v.checkPrimitive(null, n.number())).toEqual(false);
    });

    it("should check boolean", () => {
      expect(v.checkPrimitive(true, n.boolean())).toEqual(true);
      expect(v.checkPrimitive(null, n.boolean())).toEqual(false);
    });

    it("should check boolean", () => {
      expect(v.checkPrimitive(null, n.nullType())).toEqual(true);
      expect(v.checkPrimitive("foo", n.nullType())).toEqual(false);
    });
  });

  describe("enum", () => {
    it("should check if in enum", () => {
      expect(v.checkEnum("2", n.enums([1, "2"]), [])).toEqual(undefined);
      expect(typeof v.checkEnum(3, n.enums([1, "2"]), [])).toEqual("string");
    });
  });

  describe("regex", () => {
    it("should check if value matches regex", () => {
      expect(v.checkRegex("foo", n.regexType(/foo/), [])).toEqual(undefined);
      expect(typeof v.checkRegex("3", n.regexType(/foo/), [])).toEqual(
        "string",
      );
    });
  });

  describe("array", () => {
    const options = { options: { allowAdditional: true } };
    it("should check array", () => {
      expect(v.checkArray([], n.array(n.string()), [], options)).toEqual(
        undefined,
      );
      expect(v.checkArray(["foo"], n.array(n.string()), [], options)).toEqual(
        undefined,
      );
      expect(
        typeof v.checkArray([2], n.array(n.string()), [], options),
      ).toEqual("string");
    });
  });

  describe("record", () => {
    const options = { options: { allowAdditional: true } };

    it("should check simple", () => {
      expect(
        v.checkRecord({ foo: "bar" }, n.record(n.string()), [], options),
      ).toEqual(undefined);
      expect(
        typeof v.checkRecord({ foo: 3 }, n.record(n.string()), [], options),
      ).toEqual("string");
    });

    it("should check key", () => {
      expect(
        v.checkRecord(
          { foo: "bar" },
          n.record(n.string(), { key: n.regexType(/foo/) }),
          [],
          options,
        ),
      ).toEqual(undefined);
      expect(
        typeof v.checkRecord(
          { bar: "bar" },
          n.record(n.string(), { key: n.regexType(/foo/) }),
          [],
          options,
        ),
      ).toEqual("string");
    });

    it("should check required", () => {
      expect(
        v.checkRecord(
          { foo: "bar" },
          n.record(n.string(), { required: ["foo"] }),
          [],
          options,
        ),
      ).toEqual(undefined);
      expect(
        typeof v.checkRecord(
          { bar: "bar" },
          n.record(n.string(), { required: ["foo"] }),
          [],
          options,
        ),
      ).toEqual("string");
    });
  });

  describe("object", () => {
    const ctx = { options: { allowAdditional: true } };

    it("should check simple", () => {
      expect(
        v.checkObj({ foo: "bar" }, n.object({ foo: n.string() }), [], ctx),
      ).toEqual(undefined);
      expect(
        typeof v.checkObj(
          { bar: "bar" },
          n.object({ foo: n.string() }),
          [],
          ctx,
        ),
      ).toEqual("string");
    });

    it("should check required", () => {
      expect(
        v.checkObj(
          { foo: "bar", bar: "boof" },
          n.object({ foo: n.string() }, { required: ["foo"] }),
          [],
          ctx,
        ),
      ).toEqual(undefined);
      expect(
        typeof v.checkObj(
          { bar: "boof" },
          n.object({ foo: n.string() }, { required: ["foo"] }),
          [],
          ctx,
        ),
      ).toEqual("string");
    });

    it("should forbid additional properties", () => {
      const ctx2 = { ...ctx, ...{ options: { allowAdditional: false } } };
      expect(
        v.checkObj(
          { foo: "bar", bar: "boof" },
          n.object({ foo: n.string() }, { required: ["foo"] }),
          [],
          ctx2,
        ),
      ).toEqual(undefined);
      expect(
        typeof v.checkObj(
          { bar: "boof" },
          n.object({ foo: n.string() }, { required: ["foo"] }),
          [],
          ctx2,
        ),
      ).toEqual("string");
    });
  });

  describe("union", () => {
    const ctx = { options: { allowAdditional: true } };

    it("should check union", () => {
      expect(
        v.checkUnion("foo", n.union([n.string(), n.number()]), [], ctx),
      ).toEqual(undefined);
      expect(
        typeof v.checkUnion(true, n.union([n.string(), n.number()]), [], ctx),
      ).toEqual("string");
    });
  });
});
