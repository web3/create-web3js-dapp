export enum Framework {
  Angular = "angular",
  React = "react",
  Vue = "vue",
}

export enum TemplateType {
  Demonstration = "demonstration",
  Minimal = "minimal",
}

export interface Options {
  framework: Framework;
  template: TemplateType;
}

export interface SelectedOption {
  projectName: string;
  projectLocation: string;
}
