import { BigQuery } from "@google-cloud/bigquery"
import path from "path"

// 環境変数またはデフォルト値を使用
const PROJECT_ID = process.env.BIGQUERY_PROJECT_ID || "my-project-202409-436903"
const DATASET_ID = process.env.BIGQUERY_DATASET_ID || "meta_marketing"
const REGION = process.env.BIGQUERY_REGION || "asia-northeast1"
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), "service-account-key.json")

// BigQueryクライアントのインスタンスを作成
export function createBigQueryClient() {
  try {
    // 環境変数GOOGLE_APPLICATION_CREDENTIALSが設定されている場合は自動的に使用される
    // または明示的にキーファイルを指定
    const options: any = {
      projectId: process.env.BIGQUERY_PROJECT_ID,
      location: process.env.BIGQUERY_REGION,
    }

    // キーファイルが存在する場合は明示的に指定
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
        // キーファイルの存在確認は省略（サーバーレス環境では不要な場合が多い）
        options.keyFilename = keyPath
      } catch (error) {
        console.warn("認証情報ファイルの読み込みに失敗しました。デフォルトの認証情報を使用します。", error)
      }
    }

    return new BigQuery(options)
  } catch (error) {
    console.error("BigQueryクライアントの作成に失敗しました:", error)
    throw new Error(
      `BigQueryクライアントの作成に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    )
  }
}

// データセットの存在確認
export async function checkDatasetExists(datasetId: string = DATASET_ID) {
  const bigquery = createBigQueryClient()
  try {
    const [dataset] = await bigquery.dataset(datasetId).get()
    return !!dataset
  } catch (error) {
    console.error(`データセット ${datasetId} の確認に失敗しました:`, error)
    return false
  }
}

// テーブルの存在確認
export async function checkTableExists(tableId: string, datasetId: string = DATASET_ID) {
  const bigquery = createBigQueryClient()
  try {
    const [table] = await bigquery.dataset(datasetId).table(tableId).get()
    return !!table
  } catch (error) {
    return false
  }
}

// BigQueryのデータ型をフロントエンドの型に変換
export function mapBigQueryType(type: string) {
  const typeMap: Record<string, string> = {
    STRING: "STRING",
    INTEGER: "INTEGER",
    INT64: "INTEGER",
    FLOAT: "FLOAT",
    FLOAT64: "FLOAT",
    NUMERIC: "NUMERIC",
    BIGNUMERIC: "BIGNUMERIC",
    BOOLEAN: "BOOLEAN",
    BOOL: "BOOLEAN",
    TIMESTAMP: "TIMESTAMP",
    DATE: "DATE",
    TIME: "TIME",
    DATETIME: "DATETIME",
    GEOGRAPHY: "GEOGRAPHY",
    BYTES: "BYTES",
    RECORD: "RECORD",
    STRUCT: "RECORD",
    ARRAY: "ARRAY",
    JSON: "JSON",
  }

  return typeMap[type] || type
}

// フロントエンドの型をBigQueryの型に変換
export function mapToBigQueryType(type: string) {
  const typeMap: Record<string, string> = {
    STRING: "STRING",
    INTEGER: "INTEGER",
    FLOAT: "FLOAT",
    NUMERIC: "NUMERIC",
    BIGNUMERIC: "BIGNUMERIC",
    BOOLEAN: "BOOLEAN",
    TIMESTAMP: "TIMESTAMP",
    DATE: "DATE",
    TIME: "TIME",
    DATETIME: "DATETIME",
    GEOGRAPHY: "GEOGRAPHY",
    BYTES: "BYTES",
    RECORD: "STRUCT",
    ARRAY: "ARRAY",
    JSON: "JSON",
  }

  return typeMap[type] || type
}

// エラーメッセージを取得
export function getBigQueryErrorMessage(error: any): string {
  if (error.message) {
    return error.message
  }
  if (error.errors && error.errors.length > 0) {
    return error.errors[0].message
  }
  return "不明なエラーが発生しました"
}
