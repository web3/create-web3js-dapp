import { join } from "path";

import {
  Framework,
  TemplateType,
  type Options,
  type SelectedOption,
} from "./types";

export function getSelectedOption(opts: Options): SelectedOption {
  switch (opts.framework) {
    case Framework.Angular: {
      if (opts.template === TemplateType.Demonstration) {
        throw new Error(
          "Angular demonstration dApp has not yet been implemented.",
        );
      }

      const projectName: string = "web3js-angular-dapp-min";
      const projectLocation: string = join(
        __dirname,
        "..",
        "templates",
        "min",
        projectName,
      );
      return { projectName, projectLocation };
    }
    case Framework.React: {
      const isDemo: boolean = opts.template === TemplateType.Demonstration;
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
    case Framework.Vue: {
      if (opts.template === TemplateType.Demonstration) {
        throw new Error(
          "Vue demonstration dApp has not yet been implemented.",
        );
      }

      const projectName: string = "web3js-vue-dapp-min";
      const projectLocation: string = join(
        __dirname,
        "..",
        "templates",
        "min",
        projectName,
      );
      return { projectName, projectLocation };
    }
  }
}
