import { NextResponse } from "next/server"
import { createBigQueryClient, checkTableExists, mapToBigQueryType, getBigQueryErrorMessage } from "@/lib/bigquery"

// テーブル一覧取得API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") || process.env.BIGQUERY_PROJECT_ID
    const datasetId = searchParams.get("datasetId") || process.env.BIGQUERY_DATASET_ID

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

    // テーブル一覧を取得
    const [tables] = await bigquery.dataset(datasetId).getTables()

    // テーブルの詳細情報を取得
    const tableDetails = await Promise.all(
      tables.map(async (table) => {
        try {
          const [metadata] = await table.getMetadata()
          const [rowCount] = await table.getRows({ limit: 0 })

          return {
            id: table.id,
            name: table.id,
            description: metadata.description || "",
            columnCount: metadata.schema?.fields?.length || 0,
            rowCount: Number.parseInt(rowCount?.length || "0"),
            createdAt: new Date(Number.parseInt(metadata.creationTime)).toISOString().split("T")[0],
            updatedAt: new Date(Number.parseInt(metadata.lastModifiedTime)).toISOString().split("T")[0],
            status: "active",
            projectId,
            datasetId,
          }
        } catch (error) {
          console.error(`テーブル ${table.id} の詳細取得エラー:`, error)
          return {
            id: table.id,
            name: table.id,
            description: "詳細情報の取得に失敗しました",
            columnCount: 0,
            rowCount: 0,
            createdAt: "-",
            updatedAt: "-",
            status: "error",
            projectId,
            datasetId,
          }
        }
      }),
    )

    return NextResponse.json({
      success: true,
      tables: tableDetails,
    })
  } catch (error: any) {
    console.error("テーブル一覧取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        message: "テーブル一覧の取得に失敗しました。",
        error: getBigQueryErrorMessage(error),
      },
      { status: 500 },
    )
  }
}

// テーブル作成API
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      projectId = process.env.BIGQUERY_PROJECT_ID,
      datasetId = process.env.BIGQUERY_DATASET_ID,
      tableName,
      description,
      columns,
      partitioningType,
      partitioningField,
      partitioningTimeUnit,
      expirationDays,
    } = data

    if (!projectId || !datasetId || !tableName || !columns || columns.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "必須パラメータが不足しています。",
        },
        { status: 400 },
      )
    }

    // テーブル名のバリデーション
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return NextResponse.json(
        {
          success: false,
          message: "テーブル名は英数字とアンダースコアのみ使用できます。",
        },
        { status: 400 },
      )
    }

    try {
      // BigQueryクライアントを作成
      const bigquery = createBigQueryClient()

      // テーブルが既に存在するか確認
      const tableExists = await checkTableExists(tableName, datasetId)
      if (tableExists) {
        return NextResponse.json(
          {
            success: false,
            message: `テーブル '${tableName}' は既に存在します。`,
          },
          { status: 409 },
        )
      }

      // スキーマの作成
      const schema = columns.map((column) => ({
        name: column.name,
        type: mapToBigQueryType(column.type),
        mode: column.mode,
        description: column.description || undefined,
      }))

      // テーブルオプションの設定
      const options: any = {
        schema,
        description,
      }

      // パーティショニング設定
      if (partitioningType === "time_unit" && partitioningField) {
        options.timePartitioning = {
          type: partitioningTimeUnit,
          field: partitioningField,
        }
      } else if (partitioningType === "integer_range" && partitioningField) {
        options.rangePartitioning = {
          field: partitioningField,
          range: {
            start: 0,
            end: 1000000,
            interval: 10000,
          },
        }
      }

      // テーブル有効期限の設定
      if (expirationDays && Number.parseInt(expirationDays) > 0) {
        const expirationMs = Number.parseInt(expirationDays) * 24 * 60 * 60 * 1000
        options.expirationTime = new Date(Date.now() + expirationMs).getTime()
      }

      // テーブルの作成
      const [table] = await bigquery.dataset(datasetId).createTable(tableName, options)

      // 作成したテーブルのメタデータを取得
      const [metadata] = await table.getMetadata()

      return NextResponse.json({
        success: true,
        message: `テーブル '${tableName}' が正常に作成されました。`,
        table: {
          id: table.id,
          name: table.id,
          description: metadata.description || "",
          columnCount: schema.length,
          rowCount: 0,
          createdAt: new Date(Number.parseInt(metadata.creationTime)).toISOString().split("T")[0],
          updatedAt: new Date(Number.parseInt(metadata.lastModifiedTime)).toISOString().split("T")[0],
          status: "active",
          projectId,
          datasetId,
        },
      })
    } catch (error: any) {
      console.error("テーブル作成エラー:", error)

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
          message: "テーブルの作成に失敗しました。",
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
