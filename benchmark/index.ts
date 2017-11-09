import * as Ajv from "ajv";
import Benchmark from "benchmarkjs-pretty";
import { NodeType, validate, IObj } from "../src/index";

// tslint:disable no-console

const schema: any = {
  kind: NodeType.RECORD,
  key: { kind: NodeType.REGEX, regex: /^(\/[^\/]*)+$/ },
  required: ["/"],
  value: {
    kind: NodeType.OBJECT,
    required: [],
    props: {
      fstype: {
        kind: NodeType.ENUM,
        items: ["ext3", "ext4", "btrfs"],
      },
      options: { kind: NodeType.ARRAY, type: { kind: NodeType.STRING } },
      readonly: { kind: NodeType.BOOLEAN },
      storage: {
        kind: NodeType.UNION,
        items: [
          {
            kind: NodeType.OBJECT,
            required: ["type", "server", "remotePath"],
            props: {
              type: { kind: NodeType.LITERAL, value: "nfs" },
              server: { kind: NodeType.STRING },
              remotePath: { kind: NodeType.REGEX, regex: /^(\/[^/]+)+$/ },
            },
          },
          {
            kind: NodeType.OBJECT,
            required: ["type", "label"],
            props: {
              type: { kind: NodeType.LITERAL, value: "disk" },
              label: {
                kind: NodeType.REGEX,
                regex: /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/,
              },
            },
          },
          {
            kind: NodeType.OBJECT,
            required: ["type", "device"],
            props: {
              type: { kind: NodeType.LITERAL, value: "disk" },
              device: {
                kind: NodeType.REGEX,
                regex: /^\/dev\/[^/]+(\/[^/]+)*$/,
              },
            },
          },
          {
            kind: NodeType.OBJECT,
            required: ["type", "sizeInMB"],
            props: {
              type: { kind: NodeType.LITERAL, value: "tmpfs" },
              sizeInMB: { kind: NodeType.NUMBER },
            },
          },
        ],
      },
    },
  },
};

const data = {
  "/": {
    storage: {
      type: "disk",
      device: "/dev/sda1",
    },
    fstype: "btrfs",
    readonly: true,
  },
  "/var": {
    storage: {
      type: "disk",
      label: "8f3ba6f4-5c70-46ec-83af-0d5434953e5f",
    },
    fstype: "ext4",
    options: ["nosuid"],
  },
  "/tmp": {
    storage: {
      type: "tmpfs",
      sizeInMB: 64,
    },
  },
  "/var/www": {
    storage: {
      type: "nfs",
      server: "my.nfs.server",
      remotePath: "/exports/mypath",
    },
  },
};

const schema2 = {
  $schema: "http://json-schema.org/draft-06/schema#",
  type: "object",
  properties: {
    "/": { $ref: "#/definitions/Entry" },
  },
  patternProperties: {
    "^(/[^/]+)+$": { $ref: "#/definitions/Entry" },
  },
  additionalProperties: false,
  required: ["/"],
  definitions: {
    Entry: {
      type: "object",
      properties: {
        storage: {
          oneOf: [
            { $ref: "#/definitions/Disk" },
            { $ref: "#/definitions/DiskUUID" },
            { $ref: "#/definitions/NFS" },
            { $ref: "#/definitions/tmpfs" },
          ],
          fstype: { enum: ["btrfs", "ext3", "ext4"] },
          options: { type: "array", items: { type: "string" } },
          readonly: { type: "boolean" },
        },
      },
    },
    Disk: {
      properties: {
        type: { enum: ["disk"] },
        device: {
          type: "string",
          pattern: "^/dev/[^/]+(/[^/]+)*$",
        },
      },
      required: ["type", "device"],
      additionalProperties: false,
    },
    DiskUUID: {
      properties: {
        type: { enum: ["disk"] },
        label: {
          type: "string",
          pattern:
            "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$",
        },
      },
      required: ["type", "label"],
      additionalProperties: false,
    },
    NFS: {
      properties: {
        type: { enum: ["nfs"] },
        remotePath: {
          type: "string",
          pattern: "^(/[^/]+)+$",
        },
        server: {
          type: "string",
          oneOf: [
            { format: "hostname" },
            { format: "ipv4" },
            { format: "ipv6" },
          ],
        },
      },
      required: ["type", "server", "remotePath"],
      additionalProperties: false,
    },
    tmpfs: {
      properties: {
        type: { enum: ["tmpfs"] },
        sizeInMB: {
          type: "integer",
          minimum: 16,
          maximum: 512,
        },
      },
      required: ["type", "sizeInMB"],
      additionalProperties: false,
    },
  },
};

let counter = 0;

const ajv = new Ajv();
console.time("ajv single");
ajv.validate(schema2, data);
console.timeEnd("ajv single");

console.time("custom single");
validate(data, schema);
console.timeEnd("custom single");

new Benchmark("json_schema-validation")
  .add("ajv", () => {
    ajv.validate(schema2, data);
    if (ajv.errors !== null) {
      counter++;
    }
  })
  .add("custom", () => {
    const res = validate(data, schema);
    if (res.error !== undefined) {
      counter++;
    }
  })
  .run()
  .then(() => console.log(counter));
