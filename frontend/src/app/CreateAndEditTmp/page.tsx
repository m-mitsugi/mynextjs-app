// CreateAndEditTmp.tsx
"use client"; // クライアントコンポーネントとしてマーク
import TmpForm from "../../commponents/TmpForm";
import { InputItem } from "../../interface/interface";
import useFormData from "../../hooks/hooks";
import { useState, useEffect, createContext } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";

const CreateAndEditTmp = () => {
  const {
    formData,
    publicFlg,
    handleInputChange,
    handleCheckboxChange,
    setRegisterId,
    getTemplate,
    loginId,
    setCurrentUrl,
    referrer,
    setRefferUrl,
    setReferrer,
  } = useFormData();
  const [count, setCount] = useState(0);
  //編集ボタンから遷移した場合：URLにidパラメータがあった場合は全件取得してformに設定
  //作成ボタンから遷移した場合：ログインIDをセットするだけ
  const params = useSearchParams();
  const [updateFlg, setUpdateFlg] = useState(0);

  //ログインIDをフォームにセット
  useEffect(() => {
    const setLoginId = () => {
      //初回表示だけ実行
      setRegisterId(loginId);
    };

    const id = params.getAll("Id");
    console.log(id);
    if (count == 0) {
      //urlにテンプレートIDが含まれている場合更新と判断
      if (!id[0]) {
        setLoginId();
      } else {
        getTemplate(id[0]);
        setUpdateFlg(1);
      }
      setCount(1);
    }
  }, []);

  useEffect(() => {
    console.log("1回目");
    setRefferUrl();
    setCurrentUrl();
  }, []);

  // const [formData, setFormData] = useState({
  //   title: "",
  //   registerId: "common@example.com", // 全画面共通のメールアドレスを初期値に設定
  //   registerName: "",
  //   template: "",
  //   explanation: "",
  //   publicFlg: true,
  // });
  // const [publicFlg, setpublicFlg] = useState(true);

  //子コンポーネントの項目に渡す要素
  const inputList: InputItem[] = [
    { key: "title", name: "Title" },
    { key: "registerId", name: "RegisterID", readOnly: true },
    { key: "registerName", name: "RegisterName" },
    { key: "template", name: "Template", isTextarea: true },
    { key: "explanation", name: "Explanation", isTextarea: true },
  ];

  // 文字入力された時の関数
  //「...」⇒スプレッド構文：配列やobjecを展開（既存の状態を維持しつつ、特定のフィールドのみを更新することが可能）
  // const handleInputChange = (name: string, value: string) => {
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };

  // トグル変更時の関数
  // const handleCheckboxChange = () => {
  //   setpublicFlg(!publicFlg);
  //   //formDataにも設定
  //   setFormData({
  //     ...formData,
  //     publicFlg: publicFlg,
  //   });
  // };

  // 送信押下時の関数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 必須項目のチェック
    const { title, registerId, template } = formData;

    if (!title || !registerId || !template) {
      let errorMsg: string[] = [];
      if (!title) errorMsg.push("「title」は必須です。\n");
      if (!registerId) errorMsg.push("「registerID」は必須です。\n");
      if (!template) errorMsg.push("「template」は必須です。");

      alert(errorMsg.join(""));
      return;
    }

    console.log("フォームが送信されました:", {
      ...formData,
      // publicFlg: publicFlg ? "public" : "private",
    });

    // 登録or更新を判定
    if (updateFlg == 0) {
      reqPost(); //登録
    } else {
      reqUpdate(); //更新
    }
  };

  const reqPost = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //JavaScriptオブジェクトをJSON形式の文字列に変換
        body: JSON.stringify({
          ...formData,
          publicFlg: publicFlg,
        }),
      });

      const result = await response.json();
      console.log("Response:", result);
      alert(result.message);
    } catch (error) {
      console.error("Error:", error);
      alert(error);
    }
  };

  const reqUpdate = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/updateTmp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        //JavaScriptオブジェクトをJSON形式の文字列に変換
        body: JSON.stringify({
          ...formData,
          publicFlg: publicFlg,
        }),
      });

      const result = await response.json();
      console.log("Response:", result);
      alert(result.message);
    } catch (error) {
      console.error("Error:", error);
      alert(error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between w-full mb-2">
        <h1 className="m-4 sm:text-3xl text-2xl font-medium title-font text-gray-900">
          テンプレート{updateFlg === 0 ? "登録" : "更新"}
        </h1>
      </div>{" "}
      <div className="flex items-center justify-between w-full mb-2">
        <Link
          href={referrer}
          className="m-4 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        >
          back
        </Link>
      </div>{" "}
      <form onSubmit={handleSubmit}>
        <div className="container px-5 py-2 mx-auto">
          <div className="p-2 w-3/4 mx-auto">
            <TmpForm
              formData={formData}
              publicFlg={publicFlg}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              inputList={inputList}
              formFlg={0}
            />
          </div>
        </div>

        <div className="p-2 w-full">
          <button
            type="submit"
            className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          >
            Save
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateAndEditTmp;
