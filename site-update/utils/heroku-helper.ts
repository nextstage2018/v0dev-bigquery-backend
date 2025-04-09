/**
 * Herokuアプリの状態確認と起動を支援するユーティリティ
 */

/**
 * Herokuアプリの状態を確認し、必要に応じて起動を試みる
 * @param url HerokuアプリのベースURL
 * @param maxRetries 最大再試行回数
 * @param onProgress 進捗状況を報告するコールバック関数
 * @returns 起動成功したかどうか
 */
export async function checkAndWakeHerokuApp(
  url: string,
  maxRetries = 5,
  onProgress?: (message: string) => void,
): Promise<boolean> {
  // URLの末尾のスラッシュを削除
  const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (onProgress) {
        onProgress(`Herokuアプリ起動確認中... (${attempt}/${maxRetries})`)
      }

      // シンプルなGETリクエストでアプリの状態を確認
      const response = await fetch(baseUrl, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(15000), // 15秒タイムアウト
      })

      if (onProgress) {
        onProgress(`応答: ${response.status} ${response.statusText}`)
      }

      if (response.ok) {
        if (onProgress) {
          onProgress("Herokuアプリは正常に起動しています")
        }
        return true
      }

      // 503エラーの場合は特別なメッセージ
      if (response.status === 503) {
        if (onProgress) {
          onProgress("Herokuアプリが起動中または過負荷状態です (503 Service Unavailable)")
        }
      }

      // 最後の試行でも失敗した場合
      if (attempt === maxRetries) {
        if (onProgress) {
          onProgress(`最大試行回数(${maxRetries}回)に達しました。Herokuアプリは応答していません。`)
        }
        return false
      }

      // 次の試行前に待機（指数バックオフ）
      const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 20000) // 最大20秒
      if (onProgress) {
        onProgress(`${waitTime}ms後に再試行します...`)
      }
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    } catch (error) {
      if (onProgress) {
        onProgress(`エラー: ${error instanceof Error ? error.message : String(error)}`)
      }

      if (attempt === maxRetries) {
        return false
      }

      // 次の試行前に待機（指数バックオフ）
      const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 20000) // 最大20秒
      if (onProgress) {
        onProgress(`${waitTime}ms後に再試行します...`)
      }
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  return false
}

/**
 * Herokuアプリの状態を診断し、問題の可能性を返す
 * @param url HerokuアプリのベースURL
 * @returns 診断結果
 */
export async function diagnoseHerokuApp(url: string): Promise<{
  status: "ok" | "sleeping" | "error" | "unknown"
  message: string
  responseTime?: number
  statusCode?: number
}> {
  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(10000), // 10秒タイムアウト
    })
    const responseTime = Date.now() - startTime

    if (response.ok) {
      return {
        status: "ok",
        message: `Herokuアプリは正常に動作しています (${responseTime}ms)`,
        responseTime,
        statusCode: response.status,
      }
    }

    if (response.status === 503) {
      // 応答時間が短い場合はエラー状態、長い場合はスリープからの起動中の可能性
      if (responseTime < 1000) {
        return {
          status: "error",
          message: "Herokuアプリがエラー状態または過負荷状態です (503 Service Unavailable)",
          responseTime,
          statusCode: 503,
        }
      } else {
        return {
          status: "sleeping",
          message: "Herokuアプリがスリープから起動中の可能性があります (503 Service Unavailable)",
          responseTime,
          statusCode: 503,
        }
      }
    }

    return {
      status: "error",
      message: `Herokuアプリがエラーを返しました (${response.status} ${response.statusText})`,
      responseTime,
      statusCode: response.status,
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "sleeping",
        message: "Herokuアプリがタイムアウトしました。スリープ状態の可能性があります。",
      }
    }

    return {
      status: "unknown",
      message: `接続エラー: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
