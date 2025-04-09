"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS } from "@/lib/config"
import { safeLogObject, logEnvironmentInfo } from "@/utils/debug-helper"

export default function DebugPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [customEndpoint, setCustomEndpoint] = useState("")

  // 環境情報をロード時に表示
  useEffect(() => {
    logEnvironmentInfo()
    console.log("API_ENDPOINTS:", API_ENDPOINTS)
  }, [])

  // 接続テスト
  const testConnection = async () => {
    setIsLoading(true)
    setTestResult("")

    const endpoint = customEndpoint || API_ENDPOINTS.TEST_CONNECTION
    console.log(`接続テスト開始: ${endpoint}`)

    try {
      // まずOPTIONSリクエストでCORSをチェック
      console.log("OPTIONSリクエスト送信...")
      try {
        const optionsResponse = await fetch(endpoint, {
          method: "OPTIONS",
          headers: {
            Origin: window.location.origin,
          },
        })
        console.log("OPTIONSレスポンス:", {
          status: optionsResponse.status,
          headers: Object.fromEntries(optionsResponse.headers.entries()),
        })
      } catch (e) {
        console.warn("OPTIONSリクエストエラー:", e)
      }

      // 実際のGETリクエスト
      console.log("GETリクエスト送信...")
      const getResponse = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("GETレスポンス:", {
        status: getResponse.status,
        statusText: getResponse.statusText,
        headers: Object.fromEntries(getResponse.headers.entries()),
      })

      const text = await getResponse.text()
      console.log("レスポンステキスト:", text)

      setTestResult(`ステータス: ${getResponse.status} ${getResponse.statusText}\n\nレスポンス:\n${text}`)

      // POSTリクエスト
      console.log("POSTリクエスト送信...")
      const dummyData = {
        project_id: "test-project",
        dataset_name: "test_dataset",
        region: "asia-northeast1",
        service_account_key: '{"test":"value"}',
      }

      const postResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dummyData),
      })

      console.log("POSTレスポンス:", {
        status: postResponse.status,
        statusText: postResponse.statusText,
        headers: Object.fromEntries(postResponse.headers.entries()),
      })

      const postText = await postResponse.text()
      console.log("POSTレスポンステキスト:", postText)

      setTestResult(
        (prev) =>
          `${prev}\n\n--- POST結果 ---\nステータス: ${postResponse.status} ${postResponse.statusText}\n\nレスポンス:\n${postText}`,
      )
    } catch (error) {
      console.error("接続テストエラー:", safeLogObject(error))
      setTestResult(`エラー: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">APIデバッグツール</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API接続テスト</CardTitle>
          <CardDescription>APIエンドポイントへの接続をテストします</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customEndpoint">カスタムエンドポイント (オプション)</Label>
              <Input
                id="customEndpoint"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder={API_ENDPOINTS.TEST_CONNECTION}
              />
              <p className="text-xs text-muted-foreground">
                空白の場合はデフォルトの接続テストエンドポイントを使用します
              </p>
            </div>

            <Button onClick={testConnection} disabled={isLoading}>
              {isLoading ? "テスト中..." : "接続テスト実行"}
            </Button>

            {testResult && (
              <div className="mt-4">
                <Label>テスト結果</Label>
                <pre className="p-4 bg-gray-100 rounded-md overflow-auto max-h-96 text-xs">{testResult}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>環境情報</CardTitle>
          <CardDescription>現在の環境設定とAPIエンドポイント</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Label>API Base URL</Label>
              <pre className="p-2 bg-gray-100 rounded-md">{API_ENDPOINTS.TEST_CONNECTION.split("/api/")[0]}</pre>
            </div>
            <div>
              <Label>接続テストエンドポイント</Label>
              <pre className="p-2 bg-gray-100 rounded-md">{API_ENDPOINTS.TEST_CONNECTION}</pre>
            </div>
            <div>
              <Label>テーブル作成エンドポイント</Label>
              <pre className="p-2 bg-gray-100 rounded-md">{API_ENDPOINTS.CREATE_TABLE}</pre>
            </div>
            <div>
              <Label>環境変数</Label>
              <pre className="p-2 bg-gray-100 rounded-md">
                NEXT_PUBLIC_API_BASE_URL: {process.env.NEXT_PUBLIC_API_BASE_URL || "未設定 (デフォルト値使用)"}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
