// TmpForm.tsx
import React from "react";
import { TemplateProps } from "../interface/interface";
// interface TemplateProps {
//   formData: {
//     title: string;
//     registerId: string;
//     registerName: string;
//     template: string;
//     explanation: string;
//   };
//   publicFlg: boolean;
//   onInputChange: (name: string, value: string) => void;
//   onCheckboxChange: () => void;
// }

// interface InputItem {
//   key: keyof TemplateProps["formData"];
//   name: string;
//   isTextarea?: boolean;
//   readOnly?: boolean; // 追加：読み取り専用フラグ
// }

const TmpForm: React.FC<TemplateProps> = ({
  formData,
  publicFlg,
  onInputChange,
  onCheckboxChange,
  inputList,
  formFlg,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onInputChange(e.target.name, e.target.value);
  };

  // const inputList: InputItem[] = [
  //   { key: "title", name: "Title" },
  //   { key: "registerId", name: "RegisterID", readOnly: true },
  //   { key: "registerName", name: "RegisterName" },
  //   { key: "template", name: "Template", isTextarea: true },
  //   { key: "explanation", name: "Explanation", isTextarea: true },
  // ];

  const allForm = () => {
    return (
      <>
        {inputList.map((inputItem) => (
          <div className="p-2 w-full" key={inputItem.key}>
            <div className="flex items-center justify-start">
              <label
                htmlFor={inputItem.key as string}
                className="w-1/6 text-sm text-gray-600"
              >
                {inputItem.name}
              </label>
              {inputItem.isTextarea ? (
                <textarea
                  id={inputItem.key as string}
                  name={inputItem.key as string}
                  value={formData[inputItem.key]}
                  readOnly={inputItem.readOnly}
                  onChange={handleInputChange}
                  className={`w-5/6 h-48 bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out ${
                    inputItem.readOnly ? "cursor-not-allowed" : ""
                  }`}
                />
              ) : (
                <input
                  type="text"
                  id={inputItem.key as string}
                  name={inputItem.key as string}
                  value={formData[inputItem.key]}
                  onChange={handleInputChange}
                  readOnly={inputItem.readOnly}
                  className={`w-5/6 bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out ${
                    inputItem.readOnly ? "cursor-not-allowed" : ""
                  }`}
                />
              )}
            </div>
          </div>
        ))}
        <div className="p-2 w-full flex items-center">
          <label htmlFor="toggle" className="w-1/6 text-sm text-gray-600">
            Public/Private
          </label>
          <label className="relative flex cursor-pointer items-center ml-2">
            <input
              disabled={formFlg == 2 ? true : false}
              type="checkbox"
              id="toggle"
              checked={publicFlg}
              onChange={onCheckboxChange}
              className="peer sr-only"
            />
            <div className="h-7 w-14 rounded-full bg-gray-200 after:absolute after:left-[4px] after:top-0.5 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
          </label>
          <span className="ml-2">{publicFlg ? "Public" : "Private"}</span>
        </div>
      </>
    );
  };

  const onlyTemplate = () => {
    return (
      <textarea
        id={"template"}
        name={"template"}
        onChange={handleInputChange}
        value={formData.template}
        readOnly={false}
        className={`w-1/2 h-60 bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out
        `}
      />
    );
  };
  return (
    // formFlg=0:フォーム全部表示、1:templateエリアだけ表示
    <>
      {formFlg == 1 ? (
        onlyTemplate()
      ) : (
        <div
          className="flex flex-wrap -m-2 overflow-y-auto"
          style={{ maxHeight: "620px" }} // 高さを調整
        >
          {allForm()}
        </div>
      )}
    </>
  );
};

export default TmpForm;
