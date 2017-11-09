import { NodeType } from "../../nodes";

export const data = {
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

export const schema: any = {
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
