"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function BigQueryForm() {
  const { toast } = useToast()

  // 共通の入力フィールド
  const [projectId, setProjectId] = useState("")
  const [datasetName, setDatasetName] = useState("")
  const [region, setRegion] = useState("asia-northeast1")
  const [serviceAccountKey, setServiceAccountKey] = useState("")
  const [keyFile, setKeyFile] = useState<File | null>(null)

  // テーブル作成用の追加フィールド
  const [tableName, setTableName] = useState("")

  // 操作タイプの選択
  const [operationType, setOperationType] = useState("test-connection")

  // 状態管理
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"success" | "error" | "idle">("idle")
  const [responseMessage, setResponseMessage] = useState("")
  const [responseData, setResponseData] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // APIのベースURLと各エンドポイント
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://still-basin-48263-5333a02adcc6.herokuapp.com"

  // スラッシュの重複を防ぐ関数
  function buildUrl(baseUrl: string, path: string): string {
    // ベースURLの末尾のスラッシュを削除
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
    // パスの先頭のスラッシュを確認
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    return `${cleanBaseUrl}${cleanPath}`
  }

  const API_ENDPOINTS = {
    TEST_CONNECTION: buildUrl(API_BASE_URL, "/api/test-connection"),
    CREATE_TABLE: buildUrl(API_BASE_URL, "/api/create-table"),
  }

  // サービスアカウントキーファイルの読み込み処理を改善
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setKeyFile(file)

    console.log("ファイル選択:", file ? file.name : "ファイルなし")

    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonContent = event.target?.result as string
          console.log("ファイル読み込み成功:", jsonContent.substring(0, 50) + "...")

          // JSONとして解析してから再度文字列化することで、有効なJSONであることを確認
          const parsedJson = JSON.parse(jsonContent)
          setServiceAccountKey(JSON.stringify(parsedJson))
        } catch (error) {
          console.error("ファイル読み込みエラー:", error)
          setServiceAccountKey("")
          // エラーメッセージを表示
          toast({
            title: "JSONパースエラー",
            description: "サービスアカウントキーが有効なJSON形式ではありません。",
            variant: "destructive",
          })
        }
      }
      reader.onerror = (error) => {
        console.error("FileReader エラー:", error)
      }
      reader.readAsText(file)
    } else {
      setServiceAccountKey("")
    }
  }

  // Herokuの起動確認（改良版リトライ機能付き）
  const wakeUpHeroku = async (maxRetries = 5): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Heroku起動確認 (試行 ${attempt}/${maxRetries})...`)

        // 進捗状況を更新
        setDebugInfo((prev) => `${prev}\nHeroku起動試行中... (${attempt}/${maxRetries})`)

        // Herokuアプリを起動するためのシンプルなGETリクエスト
        const response = await fetch(API_BASE_URL, {
          method: "GET",
          cache: "no-store", // キャッシュを使用しない
          headers: {
            "Cache-Control": "no-cache",
          },
          // 15秒のタイムアウトを設定（起動に時間がかかる場合があるため延長）
          signal: AbortSignal.timeout(15000),
        })

        console.log(`Heroku起動確認 (試行 ${attempt}/${maxRetries}):`, response.status, response.statusText)
        setDebugInfo((prev) => `${prev}\nHeroku応答: ${response.status} ${response.statusText}`)

        if (response.ok) {
          return true
        }

        // 503エラーの場合は特別なメッセージを表示
        if (response.status === 503) {
          setDebugInfo((prev) => `${prev}\nHerokuが起動中または過負荷状態です (503 Service Unavailable)`)
        }

        // 応答はあるがOKでない場合
        if (attempt === maxRetries) {
          console.warn("Herokuからの応答がエラー状態です:", response.status, response.statusText)
        }
      } catch (error) {
        console.error(`Heroku起動確認エラー (試行 ${attempt}/${maxRetries}):`, error)
        setDebugInfo((prev) => `${prev}\n起動確認エラー: ${error instanceof Error ? error.message : String(error)}`)

        if (attempt === maxRetries) {
          return false
        }

        // 次の試行前に待機（指数バックオフ）
        const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 20000) // 最大20秒
        console.log(`${waitTime}ms後に再試行します...`)
        setDebugInfo((prev) => `${prev}\n${waitTime}ms後に再試行します...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }

    return false
  }

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("=== フォーム送信開始 ===")
    setIsLoading(true)
    setStatus("idle")
    setResponseMessage("")
    setResponseData(null)
    setDebugInfo("")

    // デバッグ情報の収集
    const debugData: string[] = [
      `時刻: ${new Date().toISOString()}`,
      `ブラウザ: ${navigator.userAgent}`,
      `API Base URL: ${API_BASE_URL}`,
      `エンドポイント: ${operationType === "test-connection" ? API_ENDPOINTS.TEST_CONNECTION : API_ENDPOINTS.CREATE_TABLE}`,
      `環境変数: ${process.env.NEXT_PUBLIC_API_BASE_URL ? "設定あり" : "未設定"}`,
    ]

    try {
      // Herokuを起動（最大5回試行）
      setDebugInfo("Heroku起動確認中...\n")
      const isHerokuAwake = await wakeUpHeroku(5)

      if (!isHerokuAwake) {
        setDebugInfo(
          (prev) => `${prev}\n警告: Herokuが応答していません。以下の理由が考えられます：
1. アプリがスリープ状態（無料プランの場合）
2. アプリがクラッシュまたはエラー状態
3. サーバーがメンテナンス中または過負荷状態

対応策:
- 数分待ってから再試行してください
- Herokuダッシュボードでアプリの状態を確認してください
- アプリのログを確認して、エラーがないか調べてください`,
        )

        throw new Error("Herokuアプリが応答していないか、エラー状態です。数分後に再試行してください。")
      }

      // フォーム送信処理内のJSON検証部分を改善
      // 必須項目のチェック
      console.log("入力値検証開始")
      if (!projectId.trim()) throw new Error("プロジェクトIDは必須です")
      if (!datasetName.trim()) throw new Error("データセットIDは必須です") // 名前をIDに変更
      if (!region.trim()) throw new Error("リージョンは必須です")
      if (!serviceAccountKey.trim()) throw new Error("サービスアカウントキーは必須です")
      if (operationType === "create-table" && !tableName.trim()) throw new Error("テーブル名は必須です")

      // サービスアカウントキーがJSON形式かチェック
      try {
        const parsedKey = JSON.parse(serviceAccountKey)

        // 必須フィールドの存在チェック
        if (!parsedKey.type || parsedKey.type !== "service_account") {
          throw new Error("サービスアカウントキーに 'type' フィールドがないか、値が 'service_account' ではありません")
        }
        if (!parsedKey.project_id) {
          throw new Error("サービスアカウントキーに 'project_id' フィールドがありません")
        }
        if (!parsedKey.private_key) {
          throw new Error("サービスアカウントキーに 'private_key' フィールドがありません")
        }
        if (!parsedKey.client_email) {
          throw new Error("サービスアカウントキーに 'client_email' フィールドがありません")
        }

        // 正規化されたJSONを使用
        setServiceAccountKey(JSON.stringify(parsedKey))
      } catch (e) {
        if (e instanceof SyntaxError) {
          throw new Error("サービスアカウントキーが有効なJSON形式ではありません")
        }
        throw e
      }

      // 共通のリクエストデータ
      const requestData = {
        project_id: projectId,
        dataset_name: datasetName,
        region,
        service_account_key: JSON.parse(serviceAccountKey), // 文字列からJSONオブジェクトに変換
      }

      // 操作タイプに応じてエンドポイントとリクエストデータを設定
      const endpoint = operationType === "test-connection" ? API_ENDPOINTS.TEST_CONNECTION : API_ENDPOINTS.CREATE_TABLE
      debugData.push(`使用エンドポイント: ${endpoint}`)

      // テーブル作成の場合はテーブル名を追加
      const finalRequestData =
        operationType === "create-table" ? { ...requestData, table_name: tableName } : requestData

      // デバッグ情報に追加
      debugData.push(`リクエストパラメーター: project_id=${projectId}, dataset_id=${datasetName}, region=${region}`)
      debugData.push(`service_account_key: ${serviceAccountKey.substring(0, 20)}...`)

      // ここからAPIリクエストを送信
      console.log("APIリクエスト送信開始:", endpoint)
      setDebugInfo((prev) => `${prev}\nAPIリクエスト送信中...`)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalRequestData),
      })

      console.log("APIレスポンス受信:", response.status, response.statusText)
      setDebugInfo((prev) => `${prev}\nAPIレスポンス: ${response.status} ${response.statusText}`)

      // レスポンスのContent-Typeを確認
      const contentType = response.headers.get("Content-Type")
      if (!contentType || !contentType.includes("application/json")) {
        const textData = await response.text()
        throw new Error(`無効なレスポンス形式: ${textData.substring(0, 100)}...`)
      }

      // レスポンスをJSONとして解析
      const data = await response.json()
      console.log("APIレスポンスデータ:", data)

      if (data.success) {
        setStatus("success")
        setResponseMessage(data.message || "操作が成功しました")
        setResponseData(data)

        toast({
          title: operationType === "test-connection" ? "接続テスト成功" : "テーブル作成成功",
          description: data.message || "操作が成功しました",
          variant: "default",
        })
      } else {
        setStatus("error")
        setResponseMessage(data.message || data.error || "操作に失敗しました")

        toast({
          title: operationType === "test-connection" ? "接続テスト失敗" : "テーブル作成失敗",
          description: data.message || data.error || "操作に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("処理エラー:", error)
      debugData.push(`最終エラー: ${error instanceof Error ? error.message : String(error)}`)

      setStatus("error")
      setResponseMessage(error.message || "操作に失敗しました")

      toast({
        title: operationType === "test-connection" ? "接続テスト失敗" : "テーブル作成失敗",
        description: error.message || "操作に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setDebugInfo(debugData.join("\n"))
      console.log("=== フォーム送信完了 ===")
    }
  }

  return (
    <div className="space-y-6">
      {/* セキュリティに関する注意事項 */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>セキュリティに関する注意事項</AlertTitle>
        <AlertDescription>
          <p>サービスアカウントキーは機密情報です。以下の点にご注意ください：</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>キーファイルは安全に保管し、不要になったら削除してください</li>
            <li>公開リポジトリにキーファイルをコミットしないでください</li>
            <li>本番環境では環境変数を使用することをお勧めします</li>
            <li>このフォームで送信されたキー情報はサーバーとの通信のみに使用され、ブラウザには保存されません</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* 操作結果の表示 */}
      {status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>成功</AlertTitle>
          <AlertDescription>
            <p>{responseMessage}</p>
            {responseData && (
              <div className="mt-4">
                <details>
                  <summary className="cursor-pointer font-medium text-sm">詳細情報を表示</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(responseData, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>
            <p>{responseMessage}</p>
            {debugInfo && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium text-sm">デバッグ情報</summary>
                <pre className="mt-2 p-2 bg-gray-800 text-gray-200 rounded text-xs overflow-auto max-h-60">
                  {debugInfo}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>BigQuery操作</CardTitle>
          <CardDescription>
            BigQueryへの接続テストまたはテーブル作成を行います。必要な情報を入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 操作タイプの選択 */}
            <div className="space-y-3">
              <Label>操作タイプ</Label>
              <RadioGroup value={operationType} onValueChange={setOperationType} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="test-connection" id="test-connection" />
                  <Label htmlFor="test-connection" className="cursor-pointer">
                    接続テスト（読み込み）
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="create-table" id="create-table" />
                  <Label htmlFor="create-table" className="cursor-pointer">
                    テーブル作成（書き込み）
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 共通の入力フィールド */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">接続情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">
                    プロジェクトID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="例: my-project-id"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datasetName">
                    データセット名 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="datasetName"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="例: my_dataset"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">
                    リージョン <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="例: asia-northeast1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyFile">
                    サービスアカウントキーファイル <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="keyFile"
                    type="file"
                    onChange={handleFileChange}
                    accept="application/json"
                    required={!serviceAccountKey}
                  />
                  <p className="text-xs text-muted-foreground">JSONフォーマットのサービスアカウントキーファイル</p>
                </div>
              </div>

              {/* サービスアカウントキーの手動入力（オプション） */}
              <div className="space-y-2">
                <Label htmlFor="serviceAccountKey">
                  サービスアカウントキー（JSON）
                  <span className="text-xs text-muted-foreground ml-2">
                    ファイルをアップロードするか、JSONを直接入力
                  </span>
                </Label>
                <Textarea
                  id="serviceAccountKey"
                  value={serviceAccountKey}
                  onChange={(e) => setServiceAccountKey(e.target.value)}
                  placeholder='{"type": "service_account", "project_id": "...", ...}'
                  rows={3}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* テーブル作成時のみ表示する追加フィールド */}
            {operationType === "create-table" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">テーブル情報</h3>
                <div className="space-y-2">
                  <Label htmlFor="tableName">
                    テーブル名 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tableName"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="例: users, products など"
                    required
                  />
                  <p className="text-xs text-muted-foreground">BigQueryの命名規則に従った名前を入力してください。</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {operationType === "test-connection" ? "接続テスト中..." : "テーブル作成中..."}
                  </>
                ) : operationType === "test-connection" ? (
                  "接続テスト実行"
                ) : (
                  "テーブル作成"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
