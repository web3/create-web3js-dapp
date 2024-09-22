import { strict as assert } from "assert";
import { test } from "node:test";
import { join } from "path";

import { getSelectedOption } from "./lib";
import type { Options, SelectedOption } from "./types";

test("getSelectedOption(angular, minimal)", () => {
  const opts: Options = { framework: "angular", template: "minimal" };
  const result: SelectedOption = getSelectedOption(opts);

  const expectedName: string = "web3js-angular-dapp-min";
  assert.strictEqual(
    result.projectName,
    expectedName,
    "unexpected project name",
  );

  const expectedLocation: string = join(
    __dirname,
    "..",
    "templates",
    "min",
    expectedName,
  );
  assert.strictEqual(
    result.projectLocation,
    expectedLocation,
    "unexpected project location",
  );
});

test("getSelectedOption(react, minimal)", () => {
  const opts: Options = { framework: "react", template: "minimal" };
  const result: SelectedOption = getSelectedOption(opts);

  const expectedName: string = "web3js-react-dapp-min";
  assert.strictEqual(
    result.projectName,
    expectedName,
    "unexpected project name",
  );

  const expectedLocation: string = join(
    __dirname,
    "..",
    "templates",
    "min",
    expectedName,
  );
  assert.strictEqual(
    result.projectLocation,
    expectedLocation,
    "unexpected project location",
  );
});
