import { NextResponse } from "next/server"
import { createBigQueryClient, checkTableExists, getBigQueryErrorMessage } from "@/lib/bigquery"

// テーブル詳細取得API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") || process.env.BIGQUERY_PROJECT_ID
    const datasetId = searchParams.get("datasetId") || process.env.BIGQUERY_DATASET_ID
    const tableId = params.id

    if (!projectId || !datasetId) {
      return NextResponse.json(
        {
          success: false,
          message: "projectIdとdatasetIdは必須です。",
        },
        { status: 400 },
      )
    }

    // BigQueryクライアントを作成
    const bigquery = createBigQueryClient()

    // テーブルが存在するか確認
    const tableExists = await checkTableExists(tableId, datasetId)
    if (!tableExists) {
      return NextResponse.json(
        {
          success: false,
          message: `テーブル '${tableId}' は存在しません。`,
        },
        { status: 404 },
      )
    }

    // テーブルの詳細情報を取得
    const table = bigquery.dataset(datasetId).table(tableId)
    const [metadata] = await table.getMetadata()
    const [rowCount] = await table.getRows({ limit: 0 })

    // カラム情報を取得
    const columns =
      metadata.schema?.fields?.map((field: any, index: number) => ({
        id: `col-${index + 1}`,
        name: field.name,
        type: field.type,
        mode: field.mode,
        description: field.description || "",
        order: index + 1,
      })) || []

    // インデックス情報を取得
    const indexes = []
    if (metadata.clustering?.fields) {
      indexes.push({
        name: `${tableId}_clustering`,
        columns: metadata.clustering.fields,
        unique: false,
      })
    }

    return NextResponse.json({
      success: true,
      table: {
        id: tableId,
        name: tableId,
        description: metadata.description || "",
        columnCount: columns.length,
        rowCount: Number.parseInt(rowCount?.length || "0"),
        createdAt: new Date(Number.parseInt(metadata.creationTime)).toISOString().split("T")[0],
        updatedAt: new Date(Number.parseInt(metadata.lastModifiedTime)).toISOString().split("T")[0],
        status: "active",
        projectId,
        datasetId,
        schema: {
          fields: columns,
        },
        indexes,
        partitioning: metadata.timePartitioning || metadata.rangePartitioning,
      },
    })
  } catch (error: any) {
    console.error("テーブル詳細取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        message: "テーブル詳細の取得に失敗しました。",
        error: getBigQueryErrorMessage(error),
      },
      { status: 500 },
    )
  }
}

// テーブル削除API
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") || process.env.BIGQUERY_PROJECT_ID
    const datasetId = searchParams.get("datasetId") || process.env.BIGQUERY_DATASET_ID
    const tableId = params.id

    if (!projectId || !datasetId) {
      return NextResponse.json(
        {
          success: false,
          message: "projectIdとdatasetIdは必須です。",
        },
        { status: 400 },
      )
    }

    // BigQueryクライアントを作成
    const bigquery = createBigQueryClient()

    // テーブルが存在するか確認
    const tableExists = await checkTableExists(tableId, datasetId)
    if (!tableExists) {
      return NextResponse.json(
        {
          success: false,
          message: `テーブル '${tableId}' は存在しません。`,
        },
        { status: 404 },
      )
    }

    // テーブルの削除
    await bigquery.dataset(datasetId).table(tableId).delete()

    return NextResponse.json({
      success: true,
      message: `テーブル '${tableId}' が正常に削除されました。`,
    })
  } catch (error: any) {
    console.error("テーブル削除エラー:", error)
    return NextResponse.json(
      {
        success: false,
        message: "テーブルの削除に失敗しました。",
        error: getBigQueryErrorMessage(error),
      },
      { status: 500 },
    )
  }
}
