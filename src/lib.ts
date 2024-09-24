import { join } from "path";

import {
  Framework,
  TemplateType,
  type Options,
  type SelectedOption,
} from "./types";

export function getSelectedOption(opts: Options): SelectedOption {
  const isDemo: boolean = opts.template === TemplateType.Demonstration;
  switch (opts.framework) {
    case Framework.Angular: {
      const projectName: string = isDemo
        ? "web3js-angular-dapp-demo"
        : "web3js-angular-dapp-min";
      const projectLocation: string = join(
        __dirname,
        "..",
        "templates",
        isDemo ? "demo" : "min",
        projectName,
      );
      return { projectName, projectLocation };
    }
    case Framework.React: {
      const projectName: string = isDemo
        ? "web3js-react-dapp-demo"
        : "web3js-react-dapp-min";
      const projectLocation: string = join(
        __dirname,
        "..",
        "templates",
        isDemo ? "demo" : "min",
        projectName,
      );
      return { projectName, projectLocation };
    }
  }
}
