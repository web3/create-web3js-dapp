#!/usr/bin/env node

import { exec } from "child_process";
import { cpSync } from "fs";
import { join } from "path";
import { promisify } from "util";

import { Option, type OptionValues, program } from "commander";
import { select } from "@inquirer/prompts";

import { getSelectedOption } from "./lib";
import { Framework, TemplateType, type Options } from "./types";

program
  .addOption(
    new Option("-f, --framework <name>", "front-end framework").choices([
      "angular",
      "react",
    ]),
  )
  .addOption(
    new Option("-t, --template <type>", "template type").choices([
      "demonstration",
      "minimal",
    ]),
  );

program.parse();

main();

async function main() {
  const opts: Options = await inquire(program.opts());
  const { projectName, projectLocation } = getSelectedOption(opts);
  const destination: string = join(process.cwd(), projectName);
  console.log(`Creating a new Web3.js dApp in ${destination}`);
  try {
    cpSync(projectLocation, destination, { recursive: true });
  } catch (e) {
    console.error(`Failed to copy ${projectLocation} to ${destination}: {e}`);
  }

  console.log("Installing template dependencies using npm...");
  try {
    await promisify(exec)("npm install", { cwd: destination });
  } catch (e) {
    console.error(`Failed to install template dependencies using npm ${e}`);
  }

  console.log(`Success! Created new Web3.js dApp at ${destination}`);
  console.log("Get started by typing:\n");
  console.log(`  cd ${projectName}`);
  console.log("  npm start");
}

async function inquire(cliOpts: OptionValues): Promise<Options> {
  const options: Options = {
    framework: cliOpts.framework,
    template: cliOpts.template,
  };

  if (!options.framework) {
    options.framework = await select({
      message: "Select a front-end framework",
      choices: [
        {
          name: "Angular",
          value: Framework.Angular,
        },
        {
          name: "React",
          value: Framework.React,
        },
      ],
    });
  }

  if (!options.template) {
    const choices = [
      {
        name: "Minimal",
        value: TemplateType.Minimal,
        description: "Starter project with minimal boilerplate",
      },
    ];

    if (options.framework === Framework.React) {
      choices.unshift({
        name: "Demonstration",
        value: TemplateType.Demonstration,
        description: "Demonstration dApp",
      });
    }

    options.template = await select({
      message: "Select a template type",
      choices,
    });
  }

  return options;
}
