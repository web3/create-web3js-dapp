export type Framework = "angular";
export type TemplateType = "minimal";

export interface Options {
  framework: Framework;
  template: TemplateType;
}

export interface SelectedOption {
  projectName: string;
  projectLocation: string;
}
