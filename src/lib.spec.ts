import { strict as assert } from "assert";
import { test } from "node:test";
import { join } from "path";

import { getSelectedOption } from "./lib";
import {
  Framework,
  TemplateType,
  type Options,
  type SelectedOption,
} from "./types";

test("getSelectedOption(angular, minimal)", () => {
  const opts: Options = {
    framework: Framework.Angular,
    template: TemplateType.Minimal,
  };
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

test("getSelectedOption(angular, demonstration)", () => {
  const opts: Options = {
    framework: Framework.Angular,
    template: TemplateType.Demonstration,
  };
  const result: SelectedOption = getSelectedOption(opts);

  const expectedName: string = "web3js-angular-dapp-demo";
  assert.strictEqual(
    result.projectName,
    expectedName,
    "unexpected project name",
  );

  const expectedLocation: string = join(
    __dirname,
    "..",
    "templates",
    "demo",
    expectedName,
  );
  assert.strictEqual(
    result.projectLocation,
    expectedLocation,
    "unexpected project location",
  );
});

test("getSelectedOption(react, minimal)", () => {
  const opts: Options = {
    framework: Framework.React,
    template: TemplateType.Minimal,
  };
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

test("getSelectedOption(react, demonstration)", () => {
  const opts: Options = {
    framework: Framework.React,
    template: TemplateType.Demonstration,
  };
  const result: SelectedOption = getSelectedOption(opts);

  const expectedName: string = "web3js-react-dapp-demo";
  assert.strictEqual(
    result.projectName,
    expectedName,
    "unexpected project name",
  );

  const expectedLocation: string = join(
    __dirname,
    "..",
    "templates",
    "demo",
    expectedName,
  );
  assert.strictEqual(
    result.projectLocation,
    expectedLocation,
    "unexpected project location",
  );
});
