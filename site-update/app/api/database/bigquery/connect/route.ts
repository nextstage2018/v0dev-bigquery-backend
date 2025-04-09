import { NextResponse } from "next/server"
import { createBigQueryClient, checkDatasetExists } from "@/lib/bigquery"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { projectId, datasetId, region } = data

    if (!projectId || !datasetId || !region) {
      return NextResponse.json(
        {
          success: false,
          message: "必須パラメータが不足しています。projectId, datasetId, regionは必須です。",
        },
        { status: 400 },
      )
    }

    // 環境変数を一時的に上書き（実際の運用では環境変数を使用）
    process.env.BIGQUERY_PROJECT_ID = projectId
    process.env.BIGQUERY_DATASET_ID = datasetId
    process.env.BIGQUERY_REGION = region

    try {
      // BigQueryクライアントを作成
      const bigquery = createBigQueryClient()

      // データセットの存在確認
      const datasetExists = await checkDatasetExists(datasetId)
      if (!datasetExists) {
        return NextResponse.json(
          {
            success: false,
            message: `データセット '${datasetId}' が存在しません。`,
          },
          { status: 404 },
        )
      }

      // 接続テスト（データセット情報を取得）
      const [dataset] = await bigquery.dataset(datasetId).get()

      return NextResponse.json({
        success: true,
        message: "BigQueryに正常に接続されました。",
        connection: {
          projectId,
          datasetId,
          region,
          timestamp: new Date().toISOString(),
        },
        dataset: {
          id: dataset.id,
          location: dataset.location,
          creationTime: dataset.metadata.creationTime,
          lastModifiedTime: dataset.metadata.lastModifiedTime,
        },
      })
    } catch (error: any) {
      console.error("BigQuery接続エラー:", error)

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
          message: "BigQueryへの接続に失敗しました。",
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
