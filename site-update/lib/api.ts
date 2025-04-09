import { API_ENDPOINTS } from "./config"

// API リクエストのエラーハンドリング用ヘルパー関数
export async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options)

    // レスポンスのステータスコードを確認
    if (!response.ok) {
      // エラーレスポンスの内容を取得
      let errorMessage = "サーバーエラーが発生しました"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // JSON 解析に失敗した場合はステータステキストを使用
        errorMessage = `${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    // レスポンスの Content-Type を確認
    const contentType = response.headers.get("Content-Type")
    if (!contentType || !contentType.includes("application/json")) {
      try {
        // JSON形式でなくてもテキストとして読み取り試行
        const textData = await response.text()
        return { success: true, message: textData }
      } catch (e) {
        throw new Error("無効なレスポンス形式です")
      }
    }

    return await response.json()
  } catch (error: any) {
    // ネットワークエラーなどの例外をキャッチ
    console.error("API リクエストエラー:", error)
    throw error
  }
}

// BigQuery 接続テスト API
export async function testBigQueryConnection(connectionData: any) {
  return fetchWithErrorHandling(API_ENDPOINTS.TEST_CONNECTION, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(connectionData),
  })
}

// BigQuery テーブル作成 API
export async function createBigQueryTable(tableData: any) {
  return fetchWithErrorHandling(API_ENDPOINTS.CREATE_TABLE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tableData),
  })
}
