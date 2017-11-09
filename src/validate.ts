import * as n from "./nodes";

export type Data = Record<string, any>;

export interface Result {
  valid: boolean;
  error?: string;
}

export interface Context {
  options: Options;
}

export interface Options {
  allowAdditional: boolean;
}

const defaults: Options = {
  allowAdditional: true,
};

export function validate(
  data: Data,
  schema: n.IObj,
  options: Partial<Options> = {},
): Result {
  const settings = { errors: [], options: { ...defaults, ...options } };
  const res = check(data, schema, [], settings);

  return res === undefined
    ? { valid: true, error: undefined }
    : { valid: false, error: res };
}

export function printLoc(loc: string[]) {
  return loc.length > 0 ? loc.join(".") : ".";
}

export function checkObj(
  data: Data,
  node: n.IObj,
  loc: string[],
  ctx: Context,
): undefined | string {
  for (const key of node.required) {
    if (data[key] === undefined) {
      return `Missing required property "${key}" at "${printLoc(loc)}"`;
    }
  }

  const seen = new Set<string>();

  for (const key of Object.keys(data)) {
    if (!ctx.options.allowAdditional && node.props[key] === undefined) {
      return `Additional property "${key}" not defined in schema at "${printLoc(
        loc,
      )}"`;
    }

    if (node.props[key] !== undefined) {
      const res = check(data[key], node.props[key], [...loc, key], ctx);
      if (res !== null) {
        return res;
      }
    }

    seen.add(key);
  }

  // Check for missing keys
  for (const key of Object.keys(node.props)) {
    if (seen.has(key)) {
      continue;
    }

    const res = check(data[key], node.props[key], [...loc, key], ctx);
    if (res !== null) {
      return res;
    }
  }
}

export function checkUnion(
  data: any,
  node: n.IUnion,
  loc: string[],
  ctx: Context,
): undefined | string {
  for (const item of node.items) {
    const res = check(data, item, loc, ctx);
    if (res === undefined) {
      return;
    }
  }

  return `Invalid type at "${printLoc(loc)}"`;
}

export function checkLiteral(
  data: any,
  node: n.ILiteral,
  loc: string[],
): undefined | string {
  if (data !== node.value) {
    return `Expected "${node.value}", but got "${data}" instead at "${printLoc(
      loc,
    )}"`;
  }
}

export function checkPrimitive(data: any, node: n.Node): boolean {
  const { kind } = node;
  switch (node.kind) {
    case n.NodeType.STRING:
      return typeof data === "string";
    case n.NodeType.NUMBER:
      return typeof data === "number";
    case n.NodeType.BOOLEAN:
      return typeof data === "boolean";
    case n.NodeType.NULL:
      return data === null;
    default:
      return false;
  }
}

export function checkEnum(data: any, node: n.IEnum, loc: string[]) {
  if (!node.items.includes(data)) {
    return `Expected "${data}" to be one of [${node.items.join(
      ", ",
    )}] at "${printLoc(loc)}"`;
  }
}

export function checkRecord(
  data: any,
  node: n.IRecord,
  loc: string[],
  ctx: Context,
) {
  for (const key of node.required) {
    if (data[key] === undefined) {
      return `Missing required property "${key}" at "${printLoc(loc)}"`;
    }
  }

  for (const key of Object.keys(data)) {
    const pos = [...loc, key];
    const keyCheck = check(key, node.key, pos, ctx);
    if (keyCheck !== undefined) {
      return keyCheck;
    }

    const res = check(data[key], node.value, pos, ctx);
    if (res !== undefined) {
      return res;
    }
  }
}

export function checkArray(
  data: any[],
  node: n.IArray,
  loc: string[],
  ctx: Context,
) {
  for (let i = 0; i < data.length; i++) {
    const res = check(data[i], node.type, [...loc, `[${i}]`], ctx);
    if (res !== undefined) {
      return res;
    }
  }
}

export function checkRegex(data: string, node: n.IRegex, loc: string[]) {
  if (!node.regex.test(data)) {
    return `Expected "${data}" to match ${node.regex} at "${printLoc(loc)}"`;
  }
}

const primitive: any = {
  [n.NodeType.STRING]: "string",
  [n.NodeType.NUMBER]: "number",
  [n.NodeType.BOOLEAN]: "number",
  [n.NodeType.NULL]: "null",
};

export function check(
  data: any,
  node: n.Node,
  loc: string[],
  ctx: Context,
): undefined | string {
  switch (node.kind) {
    case n.NodeType.OBJECT:
      return checkObj(data, node as n.IObj, loc, ctx);
    case n.NodeType.UNION:
      return checkUnion(data, node as n.IUnion, loc, ctx);
    case n.NodeType.LITERAL:
      return checkLiteral(data, node as n.ILiteral, loc);
    case n.NodeType.ENUM:
      return checkEnum(data, node as n.IEnum, loc);
    case n.NodeType.RECORD:
      return checkRecord(data, node as n.IRecord, loc, ctx);
    case n.NodeType.ARRAY:
      return checkArray(data, node as n.IArray, loc, ctx);
    case n.NodeType.REGEX:
      return checkRegex(data, node as n.IRegex, loc);
    case n.NodeType.STRING:
    case n.NodeType.NULL:
    case n.NodeType.NUMBER:
    case n.NodeType.BOOLEAN:
      if (!checkPrimitive(data, node)) {
        return `Expected "${data}" to be of type "${
          primitive[node.kind]
        }" at "${printLoc(loc)}`;
      }
      break;
    default:
      throw new Error("not implemented! " + data);
  }
}
