export const enum NodeType {
  OBJECT,
  STRING,
  NUMBER,
  BOOLEAN,
  NULL,
  ARRAY,
  LITERAL,
  UNION,
  ENUM,
  RECORD,
  REGEX,
}

export interface IObj extends Node {
  props: Record<string, AllNodes>;
  required: string[];
}

export interface IRecord extends Node {
  value: AllNodes;
  key: AllNodes;
  required: string[];
}

export interface IUnion extends Node {
  items: AllNodes[];
}

export interface IEnum extends Node {
  items: Array<string | number | null | boolean>;
}

export interface IArray extends Node {
  type: AllNodes;
}

export interface ILiteral extends Node {
  value: string | number | null | boolean;
}

export interface IRegex extends Node {
  regex: RegExp;
}

export interface Node {
  kind: NodeType;
}

export type AllNodes =
  | IObj
  | IUnion
  | ILiteral
  | IArray
  | IEnum
  | IRecord
  | Node;

/** Create a record type, which can have an abritary amount of keys */
export function record(
  value: AllNodes,
  options: Partial<{ key: AllNodes; required: string[] }> = {},
): IRecord {
  const key =
    options.key !== undefined ? options.key : { kind: NodeType.STRING };
  const required = options.required !== undefined ? options.required : [];
  return {
    kind: NodeType.RECORD,
    key,
    required,
    value,
  };
}

/** Create an object type where all properties have to be known upfront */
export function object(
  props: Record<string, AllNodes>,
  options: Partial<{ required: string[] }> = {},
): IObj {
  const required = options.required !== undefined ? options.required : [];
  return {
    kind: NodeType.OBJECT,
    required,
    props,
  };
}

/** Create an enum type where the value has to match one of the items */
export function enums(items: Array<string | boolean | null | number>): IEnum {
  return {
    kind: NodeType.ENUM,
    items,
  };
}

/** More advanced than enum. Matches one of the given nodes */
export function union(items: AllNodes[]): IUnion {
  return {
    kind: NodeType.UNION,
    items,
  };
}

/** Create an array type */
export function array(itemType: AllNodes): IArray {
  return {
    kind: NodeType.ARRAY,
    type: itemType,
  };
}

/** Create an regex type */
export function regexType(regex: RegExp): IRegex {
  return {
    kind: NodeType.REGEX,
    regex,
  };
}

/** Create boolean type */
export function literal(value: string | number | boolean | null): ILiteral {
  return { kind: NodeType.LITERAL, value };
}

/** Create boolean type */
export function boolean(): Node {
  return { kind: NodeType.BOOLEAN };
}

/** Create string type */
export function string(): Node {
  return { kind: NodeType.STRING };
}

/** Create number type */
export function number(): Node {
  return { kind: NodeType.NUMBER };
}

/** Create null type */
export function nullType(): Node {
  return { kind: NodeType.NULL };
}
