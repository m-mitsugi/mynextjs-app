//index.js

// 定数を取得
const {
  TemplateDatabaseId,
  TemplateContainerId,
  FavoriteDatabaseId,
  FavoriteContainerId,
  Endpoint,
  Key,
  AdminUser,
  Port,
  NotFound,
  PublicChange,
} = require("./const.js");

// Cosmos DB の設定
const { CosmosClient } = require("@azure/cosmos");
const Client = new CosmosClient({
  endpoint: Endpoint,
  key: Key,
});

const TemplateDatabase = Client.database(TemplateDatabaseId);
const TemplateContainer = TemplateDatabase.container(TemplateContainerId);

const FavoriteDatabase = Client.database(FavoriteDatabaseId);
const FavoriteContainer = FavoriteDatabase.container(FavoriteContainerId);

// ミドルウェアの設定
const Express = require("express");
const Cors = require("cors");
const App = Express();
App.use(Express.json()); //クライアント経由でサーバーに送信されたデータを取得できる,
App.use(Cors()); // クロスオリジンリソースシェアリングの設定

//時刻算出
const { DateTime } = require("luxon");
const Now = DateTime.now().setZone("Asia/Tokyo").toFormat("yyyyMMddHHmmss");

//テンプレートテーブル登録
App.post("/api/submit", async (req, res) => {
  // initDb("template");
  const { title, registerId, registerName, template, explanation, publicFlg } =
    req.body;

  try {
    // ドキュメントを Cosmos DB に登録
    //分割代入const{A:B}=C ⇒CというオブジェクトからAというプロパティを取り出してBに代入する
    const { resource: CreatedItem } = await TemplateContainer.items.create({
      // id,
      title,
      registerId,
      registerName,
      template,
      explanation,
      publicFlg: publicFlg,
      createDate: Now,
      updateDate: Now,
    });

    console.log("Document created:", CreatedItem);

    // レスポンスを返す
    res.status(200).json({ message: "データ受信＆登録完了" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "登録エラー." + error });
  }
});

//テンプレートテーブル更新
App.put("/api/updateTmp", async (req, res) => {
  const ReqUpdateItem = ({
    id,
    title,
    registerId,
    registerName,
    template,
    explanation,
    createDate,
    publicFlg,
  } = req.body);

  const AfUpdateItem = {
    id: ReqUpdateItem.id,
    title: ReqUpdateItem.title,
    registerId: ReqUpdateItem.registerId,
    registerName: ReqUpdateItem.registerName,
    template: ReqUpdateItem.template,
    explanation: ReqUpdateItem.explanation,
    publicFlg: ReqUpdateItem.publicFlg,
    createDate: ReqUpdateItem.createDate,
    updateDate: Now,
  };
  console.log(Now);

  try {
    // ドキュメントを Cosmos DB に登録
    const { resource: BfUpdate } = await TemplateContainer.item(
      ReqUpdateItem.id,
      ReqUpdateItem.id
    ).read();

    const { resource: Afupdate } = await TemplateContainer.item(id).replace(
      AfUpdateItem
    );

    console.log("Document update:", Afupdate);
    //更新前データを取得して更新前後でpublicflgを比較する
    if (BfUpdate.publicFlg == true && Afupdate.publicFlg == false) {
      //公開→非公開の場合はお気に入りテーブルから該当のテンプレートを削除する
      deleteFavorite(req, res, PublicChange, Afupdate.id, Afupdate.registerId);
    } else {
      res.status(200).json({ message: "データ受信＆更新完了" });
    }
    // レスポンスを返す
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "更新エラー" + error });
  }
});

// テンプレートテーブル削除
App.delete("/api/deleteTmp", async (req, res) => {
  const Id = req.query.Id;

  try {
    // partkeyを指定している場合は一緒に指定してあげる
    const { resource } = await TemplateContainer.item(Id, Id).delete();
    console.log(`削除完了 id: ${Id}`, resource);
    res.status(200).json({ message: "データ削除完了" });
  } catch (error) {
    console.log(`削除エラー id: ${Id}`, error);
    res.status(500).json({ message: "削除エラー: " + error.message });
  }
});

//テンプレート一覧取得
App.get("/api/getAllTmp", async (req, res) => {
  const RegisterId = req.query.RegisterId;
  const Search = req.query.Search;
  const SearchQuery = judgeSearch(Search);
  let query = `SELECT * FROM template `;

  //管理者以外の場合条件を付与する
  if (RegisterId !== AdminUser) {
    query += ` WHERE (template.registerId = @registerId${SearchQuery}) OR (template.registerId <> @registerId AND template.publicFlg = true${SearchQuery})`;
  }

  try {
    const QuerySpec = {
      query: query,
      parameters: [
        { name: "@registerId", value: RegisterId },
        { name: "@search", value: `%${Search}%` },
      ],
    };

    const { resources: TemplateItems } = await TemplateContainer.items
      .query(QuerySpec)
      .fetchAll();
    //取得したテンプレート一覧からお気に入りされているか判定しfavoriteFlgを追加
    const Result = await getFavoriteFlg(TemplateItems, RegisterId);

    errorChk(Result, res);

    console.log(Result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "一覧取得エラー" + error });
  }
});

const getFavoriteFlg = async (Items, registerId) => {
  const QuerySpec = {
    query: `SELECT * FROM favorite WHERE favorite.userEmail = @registerId`,
    parameters: [
      {
        name: "@registerId",
        value: registerId,
      },
    ],
  };

  //お気に入りテーブル取得
  const { resources: FavoriteItems } = await FavoriteContainer.items
    .query(QuerySpec)
    .fetchAll();

  const FavoriteTemplateIds = new Set(
    FavoriteItems.map((fav) => fav.templateId)
  );

  // テンプレートに新しい項目を追加
  const Result = Items.map((template) => ({
    ...template,
    favoriteFlg: FavoriteTemplateIds.has(template.id) ? 1 : 0,
  }));

  return Result;
};

//and条件が入力されているかチェック
const judgeSearch = (search) => {
  const SearchQuery = search != "" ? " AND template.title LIKE @search" : "";
  return SearchQuery;
};

//自分が作成したテンプレート一覧取得
App.get("/api/getMyTmp", async (req, res) => {
  const RegisterId = req.query.RegisterId;
  const Search = req.query.Search;
  const SearchQuery = judgeSearch(Search);

  try {
    const QuerySpec = {
      query: `SELECT * FROM template WHERE template.registerId = @registerId${SearchQuery}`,

      parameters: [
        { name: "@registerId", value: RegisterId },
        { name: "@search", value: `%${Search}%` },
      ],
    };

    const { resources: TemplateItems } = await TemplateContainer.items
      .query(QuerySpec)
      .fetchAll();
    //取得したテンプレート一覧からお気に入りされているか判定しfavoriteFlgを追加
    const Result = await getFavoriteFlg(TemplateItems, req.query.RegisterId);

    errorChk(Result, res);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "一覧取得エラー" + error });
  }
});

//お気に入りテンプレート一覧取得
App.get("/api/getMyFavorite", async (req, res) => {
  const RegisterId = req.query.RegisterId;
  const Search = req.query.Search;

  try {
    const QuerySpec = {
      query: `SELECT * FROM favorite WHERE favorite.userEmail = @registerId`,
      parameters: [{ name: "@registerId", value: RegisterId }],
    };

    const { resources: Items } = await FavoriteContainer.items
      .query(QuerySpec)
      .fetchAll();

    if (Items.length === NotFound) {
      res.status(404).json({ error: "データが見つかりません" });
      return;
    }

    const SearchQuery = judgeSearch(Search);

    const TemplateQuerySpec = {
      query: `SELECT * FROM template WHERE template.id IN (${Items.map(
        (item) => `'${item.templateId}'`
      ).join(",")})${SearchQuery}`,
      parameters: [{ name: "@search", value: `%${Search}%` }],
    };

    const { resources: TemplateItems } = await TemplateContainer.items
      .query(TemplateQuerySpec)
      .fetchAll();
    console.log(TemplateItems);
    //取得したテンプレート一覧からお気に入りされているか判定しfavoriteFlgを追加
    const Result = await getFavoriteFlg(TemplateItems, req.query.RegisterId);

    errorChk(Result, res);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "お気に入り一覧取得エラー" + error });
  }
});

const errorChk = (data, res) => {
  if (data.length === NotFound) {
    // データが見つからなかった場合は404 Not Found
    res.status(404).json({ error: "データが見つかりません" });
    return;
  }
  // データが正常に取得できた場合は200 OK
  res.status(200).json(data);
};

//テンプレート詳細取得
App.get("/api/getTmpDetail", async (req, res) => {
  const Id = req.query.Id;

  try {
    const QuerySpec = {
      query: `SELECT * FROM template WHERE template.id = @Id`,
      parameters: [{ name: "@Id", value: Id }],
    };
    // const query = "SELECT * FROM template WHERE template.id = "${req.query.id}"";
    //こっちでもid指定してとれる⇒response = await container.item(id).read();
    //itemsだと配列でとれてitemだと1レコードだけとれるだと思う
    const { resources: Items } = await TemplateContainer.items
      .query(QuerySpec)
      .fetchAll();
    res.status(200).json(Items);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "詳細取得エラー" + error });
  }
});

//お気に入りテーブル登録
App.post("/api/favoriteTmp", async (req, res) => {
  const TemplateId = req.query.Id;
  const UserEmail = req.query.LoginId;
  try {
    // ドキュメントを Cosmos DB に登録
    const { resource: CreatedItem } = await FavoriteContainer.items.create({
      templateId: TemplateId,
      userEmail: UserEmail,
      createDate: Now,
      updateDate: Now,
    });

    console.log("Document created:", CreatedItem);

    // レスポンスを返す
    res.status(200).json({ message: "データ受信＆登録完了" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "登録エラー." + error });
  }
});

//お気に入りテーブル登録チェック
App.get("/api/favoriteTmp", async (req, res) => {
  const TemplateId = req.query.TemplateId;
  const UserEmail = req.query.LoginId;
  try {
    // const query = "SELECT * FROM template";
    const QuerySpec = {
      query: `SELECT * FROM favorite WHERE favorite.templateId = @templateId AND favorite.userEmail = @userEmail`,
      parameters: [
        { name: "@templateId", value: TemplateId },
        { name: "@userEmail", value: UserEmail },
      ],
    };

    const { resources: Items } = await FavoriteContainer.items
      .query(QuerySpec)
      .fetchAll();
    res.status(200).json(Items);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "エラー" + error });
  }
});

//お気に入りテーブル削除
App.delete("/api/deleteFavorite", async (req, res) => {
  const TemplateId = req.query.TemplateId;
  const UserEmail = req.query.LoginId;

  deleteFavorite(req, res, 0, TemplateId, UserEmail);
});
const deleteFavorite = async (req, res, flg, templateId, userEmail) => {
  let notEqual;
  try {
    //flg⇒
    //1:テンプレートがpublic⇒privateに変更されたとき作成者以外のユーザーがお気に入りしていた場合
    //そのお気に入りデータを削除する
    //0:通常のお気に入り削除
    //=or!=でクエリを制御している
    notEqual = flg !== PublicChange ? "" : "!";

    const QuerySpec = {
      query: `SELECT * FROM favorite WHERE favorite.templateId = @templateId AND favorite.userEmail ${notEqual}= @userEmail`,
      parameters: [
        { name: "@templateId", value: templateId },
        { name: "@userEmail", value: userEmail },
      ],
    };

    const { resources: Items } = await FavoriteContainer.items
      .query(QuerySpec)
      .fetchAll();
    //レコードアリの場合削除
    if (Items.length !== NotFound) {
      //Promise.all: 複数の async 関数の結果を並行して実行し、すべての Promise が解決されるまで待機
      await Promise.all(
        Items.map(async (item) => {
          await FavoriteContainer.item(item.id, item.id).delete();
        })
      );
    }
    if (flg == PublicChange) {
      res.status(200).json({ message: "データ受信＆更新完了" });
    } else {
      res.status(200).json({ message: "お気に入り削除完了" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "削除エラー" + error });
  }
};

App.listen(Port, () => {
  console.log(`Server is running on http://localhost:${Port}`);
});
