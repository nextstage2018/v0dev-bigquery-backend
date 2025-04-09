// APIエンドポイントの設定を確認
// 環境変数からAPIのURLを取得（デフォルトはHerokuのURL）
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://still-basin-48263-5333a02adcc6.herokuapp.com"

// スラッシュの重複を防ぐ関数
function buildUrl(baseUrl: string, path: string): string {
  // ベースURLの末尾のスラッシュを削除
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  // パスの先頭のスラッシュを確認
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${cleanBaseUrl}${cleanPath}`
}

// APIエンドポイント - 正しいURL形式で構築
export const API_ENDPOINTS = {
  TEST_CONNECTION: buildUrl(API_BASE_URL, "/api/test-connection"),
  CREATE_TABLE: buildUrl(API_BASE_URL, "/api/create-table"),
}

// デバッグ用：設定情報をコンソールに出力
console.log("=== API設定情報 ===")
console.log("API_BASE_URL:", API_BASE_URL)
console.log("TEST_CONNECTION:", API_ENDPOINTS.TEST_CONNECTION)
console.log("CREATE_TABLE:", API_ENDPOINTS.CREATE_TABLE)
