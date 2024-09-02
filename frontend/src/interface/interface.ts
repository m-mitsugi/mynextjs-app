export interface TemplateProps {
  formData: TempForm;
  publicFlg: boolean;
  onInputChange: (name: string, value: string) => void;
  onCheckboxChange: () => void;
  inputList: InputItem[];
  formFlg: number;
}

export interface InputItem {
  key: keyof TemplateProps["formData"];
  name: string;
  isTextarea?: boolean;
  readOnly?: boolean; // 追加：読み取り専用フラグ
}

export interface TemplateList extends TempForm {
  id: string;
  publicFlg: boolean;
  favoriteFlg: number;
}

export interface TempForm {
  id: string;
  title: string;
  registerId: string;
  registerName: string;
  template: string;
  explanation: string;
  createDate: string;
  updateDate: string;
  // publicFlg: boolean;
}

//親からTmpListページへpropsで渡す時に使う
export interface TmpListProps {
  templates: TemplateList[];
  onClickTemplate: (id: string) => void;
  favoriteCheck: (templateId: string, loginId: string) => void;
  setSelecteTmp: (index: number) => void;
  selectTmp: number;
  scrollFlg: number;
}
