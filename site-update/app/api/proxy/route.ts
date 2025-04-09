import { type NextRequest, NextResponse } from "next/server"

// POSTリクエストハンドラ内のエラーハンドリングを改善
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json()
    const { url, method = "POST", headers = {}, data } = body

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "URLが指定されていません",
        },
        { status: 400 },
      )
    }

    console.log(`プロキシリクエスト: ${method} ${url}`)

    // データの検証（POSTリクエストの場合）
    if (method === "POST" && data) {
      console.log("リクエストデータ:", JSON.stringify(data).substring(0, 100) + "...")

      // 必須パラメーターの確認
      if (url.includes("/api/test-connection")) {
        const { project_id, dataset_id, region, service_account_key } = data
        if (!project_id) console.warn("警告: project_id パラメーターがありません")
        if (!dataset_id) console.warn("警告: dataset_id パラメーターがありません")
        if (!region) console.warn("警告: region パラメーターがありません")
        if (!service_account_key) console.warn("警告: service_account_key パラメーターがありません")

        // service_account_keyがJSON形式かチェック
        try {
          if (typeof service_account_key === "string") {
            JSON.parse(service_account_key)
          }
        } catch (e) {
          console.warn("警告: service_account_key が有効なJSON形式ではありません")
        }
      }
    }

    // 転送するリクエストのオプションを設定
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      cache: "no-store",
    }

    // POSTリクエストの場合はボディを追加
    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      fetchOptions.body = JSON.stringify(data)
    }

    // リクエストを転送
    const response = await fetch(url, fetchOptions)

    // レスポンスのステータスとヘッダーを取得
    const responseData = await response.text()

    console.log(`プロキシレスポンス: ${response.status} ${response.statusText}`)

    // レスポンスの最初の部分をログに出力（デバッグ用）
    console.log("レスポンス本文の一部:", responseData.substring(0, 200))

    // 503エラーの場合は特別なメッセージを返す
    if (response.status === 503) {
      return NextResponse.json(
        {
          success: false,
          status: 503,
          statusText: "Service Unavailable",
          message: "Herokuアプリが応答していないか、起動中です。数分後に再試行してください。",
          rawResponse: responseData.substring(0, 500), // エラーページの一部を含める
        },
        { status: 503 },
      )
    }

    // JSONかどうか確認
    let parsedData
    let isJson = false
    try {
      parsedData = JSON.parse(responseData)
      isJson = true
    } catch (e) {
      parsedData = responseData
    }

    // レスポンスを返す
    return NextResponse.json(
      {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedData,
        isJson,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  } catch (error) {
    console.error("プロキシエラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      {
        status: 500,
      },
    )
  }
}
