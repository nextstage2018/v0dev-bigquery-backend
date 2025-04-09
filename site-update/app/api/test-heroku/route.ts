import { NextResponse } from "next/server"

export async function GET() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://still-basin-48263-5333a02adcc6.herokuapp.com"

    // Herokuアプリの状態を確認
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(10000), // 10秒タイムアウト
    })

    const text = await response.text()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      responseText: text.substring(0, 500), // 最初の500文字のみ
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 },
    )
  }
}
