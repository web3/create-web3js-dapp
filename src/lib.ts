import { join } from "path";

import type { Options, SelectedOption } from "./types";

export function getSelectedOption(opts: Options): SelectedOption {
  switch (opts.framework) {
    case "angular": {
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
  }
}
