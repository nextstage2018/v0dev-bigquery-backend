/**
 * デバッグ用ヘルパー関数
 */

/**
 * オブジェクトを安全にログ出力する（機密情報をマスク）
 * @param obj 出力するオブジェクト
 * @param sensitiveKeys マスクする機密情報のキー
 * @returns マスク処理されたオブジェクト
 */
export function safeLogObject(
  obj: any,
  sensitiveKeys: string[] = ["password", "token", "key", "secret", "service_account_key"],
): any {
  if (!obj || typeof obj !== "object") {
    return obj
  }

  const result: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // 機密情報かどうかチェック
      const isSensitive = sensitiveKeys.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey.toLowerCase()))

      if (isSensitive) {
        // 機密情報はマスク
        result[key] =
          typeof obj[key] === "string" ? `***${obj[key].length}文字のセンシティブ情報***` : "***センシティブ情報***"
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        // オブジェクトは再帰的に処理
        result[key] = safeLogObject(obj[key], sensitiveKeys)
      } else {
        // その他の値はそのまま
        result[key] = obj[key]
      }
    }
  }

  return result
}

/**
 * ネットワークエラーの詳細情報を取得
 * @param error エラーオブジェクト
 * @returns エラーの詳細情報
 */
export function getNetworkErrorDetails(error: any): Record<string, any> {
  const details: Record<string, any> = {
    name: error.name,
    message: error.message,
    type: typeof error,
  }

  // エラータイプに応じた追加情報
  if (error instanceof TypeError) {
    details.isTypeError = true
  }

  if (error instanceof DOMException) {
    details.isDOMException = true
    details.code = error.code
  }

  // スタックトレースがあれば追加
  if (error.stack) {
    details.stack = error.stack
  }

  return details
}

/**
 * レスポンスオブジェクトから安全に情報を抽出
 * @param response fetchのレスポンスオブジェクト
 * @returns レスポンスの基本情報
 */
export function getResponseInfo(response: Response): Record<string, any> {
  try {
    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      redirected: response.redirected,
      type: response.type,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
    }
  } catch (e) {
    return {
      error: "レスポンス情報の抽出に失敗しました",
      originalError: e,
    }
  }
}

/**
 * 環境変数の状態をログ出力
 */
export function logEnvironmentInfo(): void {
  console.log("=== 環境情報 ===")
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log("NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL || "未設定")
  console.log("ブラウザ:", typeof window !== "undefined" ? window.navigator.userAgent : "サーバーサイド")
}
