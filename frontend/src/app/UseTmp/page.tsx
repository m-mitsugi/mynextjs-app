// UseTmp.tsx
"use client"; // クライアントコンポーネントとしてマーク
import React, {
  useState,
  useLayoutEffect,
  ChangeEvent,
  useEffect,
} from "react";
import TmpForm from "../../commponents/TmpForm";
import { InputItem, TemplateList } from "../../interface/interface";
import TmpLists from "../../commponents/TmpList";
import useFormData from "../../hooks/hooks";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const TmpList = () => {
  //hooksから共通処理を取得
  const {
    formData,
    publicFlg,
    handleInputChange,
    handleCheckboxChange,
    getTemplate,
    setFetchTmpToForm,
    setSelecteTmp,
    selectTmp,
    loginId,
    setCurrentUrl,
    referrer,
    setRefferUrl,
  } = useFormData();
  const params = new URLSearchParams();

  const router = useRouter();

  const handleEdit = (id: string) => {
    const href = `/CreateAndEditTmp?Id=${id}`;
    router.push(href);
  };

  //TemplateList[]⇒配列型で配列の中身がinterfaceのTemplateList
  const [templates, setTemplates] = useState<TemplateList[]>([]); // テンプレートのリスト
  const [count, setCount] = useState(0);
  //子コンポーネントの項目に渡す要素
  const inputList: InputItem[] = [
    { key: "title", name: "Title", readOnly: true },
    { key: "registerId", name: "RegisterID", readOnly: true },
    { key: "registerName", name: "RegisterName", readOnly: true },
    { key: "template", name: "Template", isTextarea: true, readOnly: true },
    {
      key: "explanation",
      name: "Explanation",
      isTextarea: true,
      readOnly: true,
    },
  ];
  // const fetchTemplates = async (registerId: string, search: string) => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:5000/api/getAllTmp?RegisterId=" +
  //         registerId +
  //         "&Search=" +
  //         search,
  //       {
  //         method: "GET",
  //       }
  //     );
  //     const data = await response.json();
  //     afterFetchChk(response.status, data);
  //     setCount(1);
  //     // }
  //   } catch (error) {
  //     console.error("Error getAllTmp:", error);
  //     alert(error);
  //   }
  // };
  useEffect(() => {
    setCurrentUrl();
  }, []);

  // 一覧ページ読み込み時にテンプレート一覧を取得
  useLayoutEffect(() => {
    //初回表示だけ実行
    if (count == 0) {
      fetchMyFavorite(loginId, "");
      setCount(1);
    }
  });

  // useEffect(() => {
  //   if (formData.id && loginId) {
  //     favoriteCheck(formData.id, loginId);
  //   } else {
  //     setFavoriteFlg(0);
  //   }
  // }, [formData.id, loginId]);
  // //削除押下時実行関数
  // const handleDelete = async (id: string) => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:5000/api/deleteTmp?Id=" + id,
  //       { method: "POST" }
  //     );
  //     const result = await response.json();
  //     console.log("Response", result);
  //     alert(result.message);
  //   } catch (error) {
  //     console.log("Error", error);
  //     alert(error);
  //   }
  //   //削除後一覧再取得
  //   fetchTemplates(loginId, "");
  // };
  //お気に入り押下時実行関数
  // const submitFavorite = async (id: string, loginId: string) => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:5000/api/favoriteTmp?Id=" +
  //         id +
  //         "&LoginId=" +
  //         loginId,
  //       { method: "POST" }
  //     );
  //     const result = await response.json();
  //     console.log("Response", result);
  //     setFavoriteFlg(1);
  //     // alert(result.message);
  //   } catch (error) {
  //     console.log("Error", error);
  //     alert(error);
  //   }
  // };
  const [favoriteFlg, setFavoriteFlg] = useState(0);
  //お気に入りされてるかチェック
  const favoriteCheck = async (templateId: string, loginId: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/favoriteTmp?TemplateId=" +
          templateId +
          "&LoginId=" +
          loginId,
        { method: "GET" }
      );
      const result = await response.json();
      console.log("Response", result);
      // console.log("Response", result[0].id);
      if (result.length == 1) {
        setFavoriteFlg(1);
      } else {
        setFavoriteFlg(0);
      }
      // alert(result.message);
    } catch (error) {
      console.log("Error", error);
      alert(error);
    }
  };

  // const deleteFavorite = async (templateId: string, loginId: string) => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:5000/api/deleteFavorite?TemplateId=" +
  //         templateId +
  //         "&LoginId=" +
  //         loginId,
  //       { method: "GET" }
  //     );
  //     const result = await response.json();
  //     console.log("Response", result);
  //     // console.log("Response", result[0].id);
  //     setFavoriteFlg(0);
  //     // alert(result.message);
  //   } catch (error) {
  //     console.log("Error", error);
  //     alert(error);
  //   }
  // };
  // const [selectedOption, setSelectedOption] = useState("0");

  // イベントハンドラの型を指定
  // const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
  //   const selectedValue = event.target.value;
  //   setSelectedOption(selectedValue);
  //   handleOptionChange(selectedValue); // 関数を呼び出す
  // };

  // 選択されたオプションに基づく処理
  // const handleOptionChange = (value: string) => {
  //   sortTemplates(value, "");
  // };
  //sort用関数
  // const sortTemplates = async (sort: string, search: string) => {
  //   //0=ALL,1=自分作成,2=お気に入り
  //   switch (sort) {
  //     case "0":
  //       fetchTemplates(loginId, search);
  //       break;
  //     case "1":
  //       fetchMyTemplates(loginId, search);
  //       break;
  //     case "2":
  //       fetchMyFavorite(loginId, search);
  //       break;
  //     default:
  //       fetchTemplates(loginId, search);
  //       break;
  //   }
  // };

  // //自分作成テンプレート取得
  // const fetchMyTemplates = async (registerId: string, search: string) => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:5000/api/getMyTmp?RegisterId=" +
  //         registerId +
  //         "&Search=" +
  //         search,
  //       {
  //         method: "GET",
  //       }
  //     );
  //     const data = await response.json();
  //     afterFetchChk(response.status, data);
  //   } catch (error) {
  //     console.error("Error getMyTmp:", error);
  //     alert(error);
  //   }
  // };
  //お気に入りテンプレート取得
  const fetchMyFavorite = async (registerId: string, search: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/getMyFavorite?RegisterId=" +
          registerId +
          "&Search=" +
          search,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      afterFetchChk(response.status, data);
    } catch (error) {
      console.error("Error getMyFavorite:", error);
      alert(error);
    }
  };
  // const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key !== "Enter") return; //1
  //   e.preventDefault(); //2
  //   sortTemplates(selectedOption, search);
  // };
  //一覧取得後にデータが取れているかチェックする 404=データがない
  const afterFetchChk = (status: number, data: []) => {
    if (status === 404) {
      //フォームとリストを空にする
      setTemplates([]);
      setFetchTmpToForm(data);
      // favoriteCheck(formData.id, loginId);
      // setFavoriteFlg(0);
      throw new Error("データがありません");
    } else {
      setSelecteTmp(0);
      setTemplates(data);
      setFetchTmpToForm(data);
      // favoriteCheck(formData.id, loginId);
    }
  };
  // const [search, setSearch] = useState("");
  // const searchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearch(event.target.value); // `setSearch` は `useState` で設定した関数
  // };
  // //クリップボードコピー
  // const copyTextToClipboard = (text: string) => {
  //   navigator.clipboard.writeText(text);
  // };

  return (
    <>
      <div className="flex items-center justify-between w-full mb-12">
        <h1 className="m-4 sm:text-3xl text-2xl font-medium title-font text-gray-900">
          テンプレート利用
        </h1>
        <Link
          href={"/TmpList"}
          className="m-4 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        >
          template
        </Link>
      </div>{" "}
      <div className="justify-center items-center gap-1">
        <div className="container mx-auto ">
          <div className="p-2 w-2/3 ml-auto border border-gray-200 rounded transform scale-75">
            <TmpLists
              templates={templates}
              onClickTemplate={getTemplate}
              favoriteCheck={favoriteCheck}
              setSelecteTmp={setSelecteTmp}
              selectTmp={selectTmp}
              scrollFlg={1}
            />
          </div>
        </div>
        <div className="container my-40 mx-auto flex  justify-center transform scale-150">
          {" "}
          <TmpForm
            formData={formData}
            publicFlg={publicFlg}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
            inputList={inputList}
            formFlg={1}
          />
          {/* <textarea
            id={"template"}
            name={"template"}
            onChange={handleInputChange}
            value={formData.template}
            readOnly={false}
            className={`w-1/2 h-48 bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out
        `}
          /> */}
        </div>{" "}
      </div>
    </>
  );
};

export default TmpList;
