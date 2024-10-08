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
  try {
    const result: SelectedOption = getSelectedOption(opts);
  } catch (e) {
    assert.strictEqual(
      e.toString(),
      "Error: Angular demonstration dApp has not yet been implemented.",
    );
    return;
  }

  assert.strictEqual(true, false);
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

test("getSelectedOption(vue, minimal)", () => {
  const opts: Options = {
    framework: Framework.Vue,
    template: TemplateType.Minimal,
  };
  const result: SelectedOption = getSelectedOption(opts);

  const expectedName: string = "web3js-vue-dapp-min";
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

test("getSelectedOption(vue, demonstration)", () => {
  const opts: Options = {
    framework: Framework.Vue,
    template: TemplateType.Demonstration,
  };
  try {
    const result: SelectedOption = getSelectedOption(opts);
  } catch (e) {
    assert.strictEqual(
      e.toString(),
      "Error: Vue demonstration dApp has not yet been implemented.",
    );
    return;
  }

  assert.strictEqual(true, false);
});
