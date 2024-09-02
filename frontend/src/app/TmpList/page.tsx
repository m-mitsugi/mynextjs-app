// TmpList.tsx
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
    beforeSelectTmp,
    setBeforeSelectTmp,
    loginId,
    scrollFlg,
    setScrollFlg,
    adminUser,
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

  const title = { key: "title", name: "Title", readOnly: true };

  const fetchTemplates = async (registerId: string, search: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/getAllTmp?RegisterId=" +
          registerId +
          "&Search=" +
          search,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      afterFetchChk(response.status, data, selectTmp);
      setCount(1);
      // }
    } catch (error) {
      console.error("Error getAllTmp:", error);
      alert(error);
    }
  };

  // 一覧ページ読み込み時にテンプレート一覧を取得
  useLayoutEffect(() => {
    //初回表示だけ実行
    if (count == 0) {
      fetchTemplates(loginId, "");
      // setCount(1);
    }
  }, []);
  //遷移元のurlを取得後現在のurlを設定
  useEffect(() => {
    setRefferUrl();
    setCurrentUrl();
  }, []);

  useEffect(() => {
    if (formData.id && loginId) {
      console.log("useEffect");
      favoriteCheck(formData.id, loginId);
    } else {
      setFavoriteFlg(0);
    }
  }, [formData.id, loginId]);
  //削除押下時実行関数
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/deleteTmp?Id=" + id,
        { method: "DELETE" }
      );
      const result = await response.json();
      console.log("Response", result);
      alert(result.message);
    } catch (error) {
      console.log("Error", error);
      alert(error);
    }
    //削除後一覧再取得
    sortTemplates(selectedOption, search);
  };
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

  //お気に入り押下時実行関数
  const submitFavorite = async (id: string, loginId: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/favoriteTmp?Id=" +
          id +
          "&LoginId=" +
          loginId,
        { method: "POST" }
      );
      const result = await response.json();
      console.log("Response", result);
      setFavoriteFlg(1);
      // alert(result.message);
    } catch (error) {
      console.log("Error", error);
      alert(error);
    }
    //削除後にドロップボックスの値がfavoriteの場合は一覧再取得する
    // setBeforeSelectTmp(selectTmp);
    if (selectedOption !== "2") {
      // setSelecteTmp(beforeSelectTmp); //選択中のテンプレートindexをセット
    }
    sortTemplates(selectedOption, search);
  };

  //お気に入り削除
  const deleteFavorite = async (templateId: string, loginId: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/deleteFavorite?TemplateId=" +
          templateId +
          "&LoginId=" +
          loginId,
        { method: "DELETE" }
      );
      const result = await response.json();
      console.log("Response", result);
      // console.log("Response", result[0].id);
      setFavoriteFlg(0);
      // alert(result.message);
    } catch (error) {
      console.log("Error", error);
      alert(error);
    }
    //削除後にドロップボックスの値がfavoriteの場合は一覧再取得する
    setBeforeSelectTmp(selectTmp);

    if (selectedOption !== "2") {
      // setSelecteTmp(beforeSelectTmp);
    } else {
      // setSelecteTmp(0);
    }

    sortTemplates(selectedOption, search);
  };
  const [selectedOption, setSelectedOption] = useState("0");

  // イベントハンドラの型を指定
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    handleOptionChange(selectedValue, search); // 関数を呼び出す
  };

  // 選択されたオプションに基づく処理
  const handleOptionChange = (value: string, search: string) => {
    sortTemplates(value, search);
  };
  //sort用関数
  const sortTemplates = async (sort: string, search: string) => {
    //0=ALL,1=自分作成,2=お気に入り
    switch (sort) {
      case "0":
        fetchTemplates(loginId, search);
        break;
      case "1":
        fetchMyTemplates(loginId, search);
        break;
      case "2":
        fetchMyFavorite(loginId, search);
        break;
      default:
        fetchTemplates(loginId, search);
        break;
    }
  };

  //自分作成テンプレート取得
  const fetchMyTemplates = async (registerId: string, search: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/getMyTmp?RegisterId=" +
          registerId +
          "&Search=" +
          search,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      afterFetchChk(response.status, data, beforeSelectTmp);
    } catch (error) {
      console.error("Error getMyTmp:", error);
      alert(error);
    }
  };
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
      afterFetchChk(response.status, data, beforeSelectTmp);
    } catch (error) {
      console.error("Error getMyFavorite:", error);
      alert(error);
    }
  };
  //検索欄でエンターが押されたとき処理する
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return; //1
    e.preventDefault(); //2
    sortTemplates(selectedOption, search);
  };
  //一覧取得後にデータが取れているかチェックする 404=データがない
  const afterFetchChk = async (
    status: number,
    data: [],
    beforeSelectTmp: number
  ) => {
    if (status === 404) {
      //フォームとリストを空にする
      setTemplates([]);
      setFetchTmpToForm(data);
      favoriteCheck(formData.id, loginId);
      setFavoriteFlg(0);
      // throw new Error("データがありません");
    } else {
      // setSelecteTmp(selectTmp);
      setSelecteTmp(0);
      setTemplates(data);
      await setFetchTmpToForm(data);
      if (count !== 0) {
        //初回表示時に2回呼び出しが行われて結果がおかしくなる（useeffectとlayouteffect）
        favoriteCheck(formData.id, loginId);
      }
    }
  };
  const [search, setSearch] = useState("");
  //検索用state
  const searchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value); // `setSearch` は `useState` で設定した関数
  };
  //クリップボードコピー
  const copyTextToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const searchIcon = (
    <svg
      width="30"
      height="30"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );

  const filterIcon = (
    <svg
      width="30"
      height="30"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.85355 2.14645C3.65829 1.95118 3.34171 1.95118 3.14645 2.14645C2.95118 2.34171 2.95118 2.65829 3.14645 2.85355L7.14645 6.85355C7.34171 7.04882 7.65829 7.04882 7.85355 6.85355L11.8536 2.85355C12.0488 2.65829 12.0488 2.34171 11.8536 2.14645C11.6583 1.95118 11.3417 1.95118 11.1464 2.14645L7.5 5.79289L3.85355 2.14645ZM3.85355 8.14645C3.65829 7.95118 3.34171 7.95118 3.14645 8.14645C2.95118 8.34171 2.95118 8.65829 3.14645 8.85355L7.14645 12.8536C7.34171 13.0488 7.65829 13.0488 7.85355 12.8536L11.8536 8.85355C12.0488 8.65829 12.0488 8.34171 11.8536 8.14645C11.6583 7.95118 11.3417 7.95118 11.1464 8.14645L7.5 11.7929L3.85355 8.14645Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );

  const editIcon = (
    <svg
      width="30"
      height="30"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );

  const deleteIcon = (
    <svg
      width="30"
      height="30"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );
  const copyIcon = (
    <svg
      width="30"
      height="30"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H7V13H3.5C3.22386 13 3 12.7761 3 12.5V2.5C3 2.22386 3.22386 2 3.5 2H4V2.25C4 2.66421 4.33579 3 4.75 3H10.25C10.6642 3 11 2.66421 11 2.25V2H11.5C11.7761 2 12 2.22386 12 2.5V7H13V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5ZM10.5 9C10.7761 9 11 8.77614 11 8.5C11 8.22386 10.7761 8 10.5 8C10.2239 8 10 8.22386 10 8.5C10 8.77614 10.2239 9 10.5 9ZM13 8.5C13 8.77614 12.7761 9 12.5 9C12.2239 9 12 8.77614 12 8.5C12 8.22386 12.2239 8 12.5 8C12.7761 8 13 8.22386 13 8.5ZM14.5 9C14.7761 9 15 8.77614 15 8.5C15 8.22386 14.7761 8 14.5 8C14.2239 8 14 8.22386 14 8.5C14 8.77614 14.2239 9 14.5 9ZM15 10.5C15 10.7761 14.7761 11 14.5 11C14.2239 11 14 10.7761 14 10.5C14 10.2239 14.2239 10 14.5 10C14.7761 10 15 10.2239 15 10.5ZM14.5 13C14.7761 13 15 12.7761 15 12.5C15 12.2239 14.7761 12 14.5 12C14.2239 12 14 12.2239 14 12.5C14 12.7761 14.2239 13 14.5 13ZM14.5 15C14.7761 15 15 14.7761 15 14.5C15 14.2239 14.7761 14 14.5 14C14.2239 14 14 14.2239 14 14.5C14 14.7761 14.2239 15 14.5 15ZM8.5 11C8.77614 11 9 10.7761 9 10.5C9 10.2239 8.77614 10 8.5 10C8.22386 10 8 10.2239 8 10.5C8 10.7761 8.22386 11 8.5 11ZM9 12.5C9 12.7761 8.77614 13 8.5 13C8.22386 13 8 12.7761 8 12.5C8 12.2239 8.22386 12 8.5 12C8.77614 12 9 12.2239 9 12.5ZM8.5 15C8.77614 15 9 14.7761 9 14.5C9 14.2239 8.77614 14 8.5 14C8.22386 14 8 14.2239 8 14.5C8 14.7761 8.22386 15 8.5 15ZM11 14.5C11 14.7761 10.7761 15 10.5 15C10.2239 15 10 14.7761 10 14.5C10 14.2239 10.2239 14 10.5 14C10.7761 14 11 14.2239 11 14.5ZM12.5 15C12.7761 15 13 14.7761 13 14.5C13 14.2239 12.7761 14 12.5 14C12.2239 14 12 14.2239 12 14.5C12 14.7761 12.2239 15 12.5 15Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );

  const favoriteIcon = (iconJudge: number) => {
    if (iconJudge == 1) {
      return (
        <svg
          width="30"
          height="30"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.22303 0.665992C7.32551 0.419604 7.67454 0.419604 7.77702 0.665992L9.41343 4.60039C9.45663 4.70426 9.55432 4.77523 9.66645 4.78422L13.914 5.12475C14.18 5.14607 14.2878 5.47802 14.0852 5.65162L10.849 8.42374C10.7636 8.49692 10.7263 8.61176 10.7524 8.72118L11.7411 12.866C11.803 13.1256 11.5206 13.3308 11.2929 13.1917L7.6564 10.9705C7.5604 10.9119 7.43965 10.9119 7.34365 10.9705L3.70718 13.1917C3.47945 13.3308 3.19708 13.1256 3.25899 12.866L4.24769 8.72118C4.2738 8.61176 4.23648 8.49692 4.15105 8.42374L0.914889 5.65162C0.712228 5.47802 0.820086 5.14607 1.08608 5.12475L5.3336 4.78422C5.44573 4.77523 5.54342 4.70426 5.58662 4.60039L7.22303 0.665992Z"
            fill="currentColor"
          ></path>
        </svg>
      );
    } else {
      return (
        <svg
          width="30"
          height="30"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.97942 1.25171L6.9585 1.30199L5.58662 4.60039C5.54342 4.70426 5.44573 4.77523 5.3336 4.78422L1.7727 5.0697L1.71841 5.07405L1.38687 5.10063L1.08608 5.12475C0.820085 5.14607 0.712228 5.47802 0.914889 5.65162L1.14406 5.84793L1.39666 6.06431L1.43802 6.09974L4.15105 8.42374C4.23648 8.49692 4.2738 8.61176 4.24769 8.72118L3.41882 12.196L3.40618 12.249L3.32901 12.5725L3.25899 12.866C3.19708 13.1256 3.47945 13.3308 3.70718 13.1917L3.9647 13.0344L4.24854 12.861L4.29502 12.8326L7.34365 10.9705C7.43965 10.9119 7.5604 10.9119 7.6564 10.9705L10.705 12.8326L10.7515 12.861L11.0354 13.0344L11.2929 13.1917C11.5206 13.3308 11.803 13.1256 11.7411 12.866L11.671 12.5725L11.5939 12.249L11.5812 12.196L10.7524 8.72118C10.7263 8.61176 10.7636 8.49692 10.849 8.42374L13.562 6.09974L13.6034 6.06431L13.856 5.84793L14.0852 5.65162C14.2878 5.47802 14.18 5.14607 13.914 5.12475L13.6132 5.10063L13.2816 5.07405L13.2274 5.0697L9.66645 4.78422C9.55432 4.77523 9.45663 4.70426 9.41343 4.60039L8.04155 1.30199L8.02064 1.25171L7.89291 0.944609L7.77702 0.665992C7.67454 0.419604 7.32551 0.419604 7.22303 0.665992L7.10715 0.944609L6.97942 1.25171ZM7.50003 2.60397L6.50994 4.98442C6.32273 5.43453 5.89944 5.74207 5.41351 5.78103L2.84361 5.98705L4.8016 7.66428C5.17183 7.98142 5.33351 8.47903 5.2204 8.95321L4.62221 11.461L6.8224 10.1171C7.23842 9.86302 7.76164 9.86302 8.17766 10.1171L10.3778 11.461L9.77965 8.95321C9.66654 8.47903 9.82822 7.98142 10.1984 7.66428L12.1564 5.98705L9.58654 5.78103C9.10061 5.74207 8.67732 5.43453 8.49011 4.98442L7.50003 2.60397Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      );
    }
  };

  const editButton = (icon: React.ReactNode, disabled: boolean) => {
    return (
      <button
        type="submit"
        // className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        className={`focus:outline-none hover:bg-gray-200 rounded text-lg ${
          disabled === true ? "cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        onClick={() => {
          handleEdit(formData.id);
        }}
      >
        {icon}
      </button>
    );
  };
  const deleteButton = (icon: React.ReactNode, disabled: boolean) => {
    return (
      <button
        type="submit"
        disabled={disabled}
        className={`focus:outline-none hover:bg-gray-200 rounded text-lg ${
          disabled === true ? "cursor-not-allowed" : ""
        }`}
        onClick={() => {
          confirmedDelete();
        }}
      >
        {icon}
      </button>
    );
  };
  const favoriteButton = (disabled: boolean, iconJudge: number) => {
    return (
      <button
        type="submit"
        className={`focus:outline-none hover:bg-gray-200 rounded text-lg ${
          disabled === true ? "cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        onClick={() => {
          {
            iconJudge == 1
              ? deleteFavorite(formData.id, loginId)
              : submitFavorite(formData.id, loginId);
          }
        }}
      >
        {favoriteIcon(iconJudge)}
      </button>
    );
  };
  const copyButton = (icon: React.ReactNode) => {
    return (
      <button
        type="submit"
        className="focus:outline-none hover:bg-gray-200 rounded text-lg"
        onClick={() => {
          copyTextToClipboard(formData.template);
        }}
      >
        {icon}
      </button>
    );
  };
  const confirmedDelete = () => {
    const confirmed = window.confirm("本当に削除しますか？");

    if (confirmed) {
      // ユーザーが「OK」を選択した場合の処理
      handleDelete(formData.id); // 実際の削除処理をここで呼び出します
    } else {
      // ユーザーが「キャンセル」を選択した場合の処理
      console.log("削除処理がキャンセルされました");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="m-4 sm:text-3xl text-2xl font-medium title-font text-gray-900">
          テンプレート一覧
        </h1>
        <Link
          href={"/CreateAndEditTmp"}
          className="m-4 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        >
          CreateTemplate
        </Link>
      </div>
      <div className=" flex justify-center gap-1">
        <div className="container px-2 py-1 ">
          <div className="flex mb-2">
            <div>
              <Link
                href={referrer}
                className="border m-4 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              >
                back
              </Link>
            </div>

            <div className="m-20 lg:w-85 md:w-1/2">
              <div className="w-65 ml-3 inline-flex ">
                <div className="m-1"> {filterIcon}</div>
                <select
                  id="options"
                  value={selectedOption}
                  onChange={handleChange}
                  className="bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                >
                  <option value="0">all</option>
                  <option value="1">mine</option>
                  <option value="2">favorite</option>
                </select>
              </div>
              <div className="w-65 m-3 inline-flex ">
                <div className="m-1"> {searchIcon}</div>
                <input
                  placeholder="検索"
                  value={search}
                  onChange={searchChange}
                  onKeyDown={handleInputKeyDown}
                  className={`bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
                />
              </div>
              <div className="lg:w-80 md:w-1/2 ml-9">
                <TmpLists
                  templates={templates}
                  onClickTemplate={getTemplate}
                  favoriteCheck={favoriteCheck}
                  setSelecteTmp={setSelecteTmp}
                  selectTmp={selectTmp}
                  scrollFlg={0}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mr-40 container border border-gray-200 rounded px-2 py-4">
          <div className="m-5 flex justify-end">
            {/* お気に入りボタン */}
            <div className="p-2">
              {formData.id //リスト取得時に一覧データ0件の場合はお気に入りボタンはdsiabledにする
                ? // ? favoriteFlg == 1
                  favoriteButton(false, favoriteFlg)
                : // : favoriteButton(false, favoriteFlg)
                  favoriteButton(true, 0)}
            </div>
            {/* 編集ボタン */}
            <div className="p-2">
              {editButton(
                editIcon,
                formData.registerId == loginId ? false : true
              )}
            </div>
            {/* 削除ボタン */}
            {/* 作成者以外は削除ボタンが使えないように制御する */}
            <div className="p-2">
              {deleteButton(
                deleteIcon,
                formData.registerId == loginId || loginId == adminUser
                  ? false
                  : true
              )}
            </div>
            {/* コピーボタン */}
            <div className="p-2">{copyButton(copyIcon)}</div>
          </div>
          <div className="mx-auto inline-flex ">
            <TmpForm
              formData={formData}
              publicFlg={publicFlg}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              inputList={inputList}
              formFlg={2} //publicflgをdisableにするため2を設定
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TmpList;
