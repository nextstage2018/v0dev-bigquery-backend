/**
 * CORSプロキシユーティリティ
 *
 * CORSエラーが発生する場合に、プロキシサービスを使用してリクエストを中継します。
 */

/**
 * CORSプロキシを使用してリクエストを送信する
 *
 * @param url 元のURL
 * @param options fetchオプション
 * @returns レスポンス
 */
export async function fetchWithCorsProxy(url: string, options: RequestInit = {}): Promise<Response> {
  // まず直接リクエストを試みる
  try {
    const directResponse = await fetch(url, options)
    return directResponse
  } catch (error) {
    console.log("直接リクエスト失敗、プロキシを試行:", error)

    // CORSプロキシサービスを使用
    // 注: これらのサービスは一時的な開発用途のみに使用し、本番環境では適切なCORS設定を行うべき
    const corsProxies = ["https://cors-anywhere.herokuapp.com/", "https://api.allorigins.win/raw?url="]

    // 各プロキシを順番に試す
    for (const proxy of corsProxies) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`
        console.log(`プロキシ経由でリクエスト: ${proxyUrl}`)

        const proxyResponse = await fetch(proxyUrl, options)
        return proxyResponse
      } catch (proxyError) {
        console.log(`プロキシ ${proxy} 失敗:`, proxyError)
        // 次のプロキシを試す
      }
    }

    // すべてのプロキシが失敗した場合
    throw new Error("すべてのリクエスト方法が失敗しました。ネットワーク接続とCORS設定を確認してください。")
  }
}
