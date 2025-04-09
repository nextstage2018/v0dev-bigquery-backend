import { NextResponse } from "next/server"
import { createBigQueryClient } from "@/lib/bigquery"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { projectId = process.env.BIGQUERY_PROJECT_ID, datasetId = process.env.BIGQUERY_DATASET_ID, query } = data

    if (!projectId || !datasetId || !query) {
      return NextResponse.json(
        {
          success: false,
          message: "必須パラメータが不足しています。",
        },
        { status: 400 },
      )
    }

    try {
      // BigQueryクライアントを作成
      const bigquery = createBigQueryClient()

      // クエリオプションの設定
      const options = {
        query,
        location: process.env.BIGQUERY_REGION || "asia-northeast1",
        jobTimeoutMs: 30000, // 30秒タイムアウト
      }

      // クエリの実行
      const startTime = Date.now()
      const [job] = await bigquery.createQueryJob(options)
      const [rows] = await job.getQueryResults()
      const endTime = Date.now()

      // ジョブ情報の取得
      const [jobMetadata] = await job.getMetadata()
      const statistics = jobMetadata.statistics

      return NextResponse.json({
        success: true,
        results: rows,
        totalRows: rows.length,
        executionTime: (endTime - startTime) / 1000, // 秒単位
        bytesProcessed: statistics?.totalBytesProcessed || 0,
        jobId: job.id,
      })
    } catch (error: any) {
      console.error("クエリ実行エラー:", error)

      // エラーメッセージを適切に抽出
      let errorMessage = "不明なエラーが発生しました"
      if (error.message) {
        errorMessage = error.message
      } else if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].message
      }

      return NextResponse.json(
        {
          success: false,
          message: "クエリの実行に失敗しました。",
          error: errorMessage,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("リクエスト処理エラー:", error)

    return NextResponse.json(
      {
        success: false,
        message: "リクエストの処理中にエラーが発生しました。",
        error: error.message || "不明なエラーが発生しました",
      },
      { status: 400 },
    )
  }
}
