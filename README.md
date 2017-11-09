# Fast JSON Validator

A **10x** faster way to validate json objects with a simple ast. This library
is intended to be used as a transpilation target.

| Library | Test Name | Single Run | Benchmark |
|---|---|---|---|
| [ajv](https://github.com/epoberezkin/ajv) | fstab | 22.926ms | 17,550 ops/sec |
| fast-json-validator | fstab | **0.67ms** | **149,795 ops/sec** |

## Installation

```bash
# npm
npm install --save fast-json-validator

# yarn
yarn add fast-json-validator
```

## Usage

Although one can construct the schema by hand, it is **not recommended**. This
library is more intended as a transpile target from other languages (think
GraphQL, TypeScript, Flow,...).

```js
import * as v from "fast-json-validate";

const data = {
  "/": "bar",
  "/bar/bob": {
    type: "ext4"
  },
}

const schema = v.record(
  n.union([
    n.string(),
    n.object(
      {
        type: n.enum(["ext4", "ext4"])
      },
      { required: ["type"]}
    )
  ]),
  { type: n.regexType(/^\//})
);
```

## FAQ

**Q: Why another tool to validate json data?**

This project was born because I got frustrated with creating automatic mocks
out of `json-schema` definitions. The `json-schema` grammar allows to create
conflicting schemas that never validate, is slow to verify (the validator has
to make a lot of educated guesses), validation libraries tend to be a lot
bigger than necessary, and are difficult to parse.

## License

`MIT`, see [License file](LICENSE.md).
