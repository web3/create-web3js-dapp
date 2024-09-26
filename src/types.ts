export type Framework = "angular" | "react";
export type TemplateType = "minimal";

export interface Options {
  framework: Framework;
  template: TemplateType;
}

export interface SelectedOption {
  projectName: string;
  projectLocation: string;
}
