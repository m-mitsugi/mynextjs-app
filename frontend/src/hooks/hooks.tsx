//共通で使う関数、state

import { useState, useCallback, useEffect } from "react";
import { TempForm, TemplateList } from "../interface/interface";
import { createContext } from "react";

const adminUser = "admin@admin.com";
const useFormData = () => {
  const [formData, setFormData] = useState<TempForm>({
    id: "",
    title: "",
    registerId: "",
    registerName: "",
    template: "",
    explanation: "",
    createDate: "",
    updateDate: "",

    // publicFlg: true,
  });

  const [publicFlg, setpublicFlg] = useState(true);
  // アロー関数・・・関数名 = (あれば引数) => {処理};
  const handleInputChange = (name: string, value: string) => {
    //prevData・・・最新の状態を確実に取得する
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = () => {
    setpublicFlg(!publicFlg);
    // setFormData((prevData) => ({
    //   ...prevData,
    //   publicFlg: !prevData.publicFlg,
    // }));
  };

  // const [templates, setTemplates] = useState<TemplateList[]>([]); // テンプレートのリスト
  // //テンプレート全部取得用
  // const fetchTemplates = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/api/getAllTmp", {
  //       method: "GET",
  //     });
  //     const data = await response.json();
  //     setTemplates(data);
  //   } catch (error) {
  //     console.error("fetchTemplatesError fetching templates:", error);
  //   }
  // };

  //テンプレート取得
  const getTemplate = async (id: string) => {
    //idをもとテンプレートを取得
    try {
      const response = await fetch(
        "http://localhost:5000/api/getTmpDetail?Id=" + id,
        { method: "GET" }
      );
      const data = await response.json();
      //配列で帰ってくるからきれいに格納できてない？
      setFetchTmpToForm(data);
      // setFormData((formData) => ({
      //   ...formData,
      //   title: data[0].title || "",
      //   registerId: data[0].registerId || "",
      //   registerName: data[0].registerName || "",
      //   template: data[0].template || "",
      //   explanation: data[0].explanation || "",
      // }));
      // setpublicFlg(data[0].publicFlg);
    } catch (error) {
      console.error("getTemplateError fetching templates:", error);
    }
    console.log(publicFlg);
    console.log(formData);
  };
  //formに格納
  const setFetchTmpToForm = async (data: any) => {
    const i = 0;
    if (data.error) {
      setFormData((prevData) => ({
        ...prevData,
        id: "",
        title: "",
        registerId: "",
        registerName: "",
        template: "",
        explanation: "",
        createDate: "",
      }));
      setpublicFlg(true);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        id: data[i].id || "",
        title: data[i].title || "",
        registerId: data[i].registerId || "",
        registerName: data[i].registerName || "",
        template: data[i].template || "",
        explanation: data[i].explanation || "",
        createDate: data[i].createDate || "",
      }));
      setpublicFlg(data[i].publicFlg);
    }
  };
  //ログイン情報をセット
  //管理者：admin@admin.com
  const [loginId, setLoginId] = useState("testUser1@example.com");
  // const [loginId, setLoginId] = useState("admin@admin.com");

  //ログインIDを入力情報にセットする処理
  const setRegisterId = (registerId: string) => {
    setFormData((prevData) => ({
      ...prevData,
      registerId: registerId,
    }));
  };
  const [selectTmp, setSelectTmp] = useState(0);
  const [beforeSelectTmp, setBeforeSelectTmp] = useState(0);

  const [scrollFlg, setScrollFlg] = useState(0);
  const chngeScroll = () => {};
  const [referrer, setReferrer] = useState("");

  const setCurrentUrl = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("referrer", window.location.href);
    }
  };
  const setReferrerUrl = () => {
    if (typeof window !== "undefined") {
      const storedReferrer = sessionStorage.getItem("referrer");
      setReferrer(storedReferrer || "No referrer found");
    }
  };

  return {
    formData,
    publicFlg,
    // templates,
    handleInputChange,
    handleCheckboxChange,
    getTemplate,
    setFetchTmpToForm,
    setRegisterId,
    setLoginId,
    selectTmp,
    setSelecteTmp: setSelectTmp,
    loginId,
    scrollFlg,
    setScrollFlg,
    adminUser,
    setCurrentUrl,
    referrer,
    setRefferUrl: setReferrerUrl,
    setReferrer,
    beforeSelectTmp,
    setBeforeSelectTmp,

    // fetchTemplates,
  };
};

export default useFormData;
