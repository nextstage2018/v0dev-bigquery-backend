"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function TestHerokuPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://still-basin-48263-5333a02adcc6.herokuapp.com"

  const testHeroku = async () => {
    setStatus("loading")
    setMessage("")
    setDetails(null)

    try {
      // 単純なGETリクエストでHerokuの状態を確認
      console.log("Herokuの状態確認中:", API_BASE_URL)

      const startTime = Date.now()
      const response = await fetch(API_BASE_URL, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const responseTime = Date.now() - startTime

      const text = await response.text()

      setStatus("success")
      setMessage(`Herokuアプリは起動しています (${responseTime}ms)`)
      setDetails({
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        response: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
      })
    } catch (error) {
      console.error("Heroku接続エラー:", error)

      setStatus("error")
      setMessage("Herokuアプリに接続できません")
      setDetails({
        error: error instanceof Error ? error.message : String(error),
        possibleCauses: [
          "Herokuアプリがスリープ状態（無料プランの場合）",
          "ネットワーク接続の問題",
          "CORSポリシーの制限",
          "Herokuアプリがダウンしている",
        ],
        recommendation:
          "Herokuダッシュボードでアプリの状態を確認してください。無料プランの場合は、最初のリクエストで起動に時間がかかることがあります。",
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Heroku接続テスト</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Herokuアプリの状態確認</CardTitle>
          <CardDescription>
            Herokuアプリが起動しているかどうかを確認します。無料プランのHerokuアプリは30分間アクセスがないとスリープ状態になります。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2">テスト対象URL:</p>
            <code className="bg-gray-100 p-2 rounded block">{API_BASE_URL}</code>
          </div>

          <Button onClick={testHeroku} disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                確認中...
              </>
            ) : (
              "Herokuの状態を確認"
            )}
          </Button>

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle>接続成功</AlertTitle>
              <AlertDescription>
                <p>{message}</p>
                {details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium text-sm">詳細情報</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>接続エラー</AlertTitle>
              <AlertDescription>
                <p>{message}</p>
                {details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium text-sm">詳細情報</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  </details>
                )}
                <div className="mt-4">
                  <h4 className="font-medium text-sm">考えられる原因:</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                    <li>Herokuアプリがスリープ状態（無料プランの場合）</li>
                    <li>ネットワーク接続の問題</li>
                    <li>CORSポリシーの制限</li>
                    <li>Herokuアプリがダウンしている</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Herokuアプリについての注意事項</h2>
        <div className="space-y-2">
          <h3 className="font-medium">無料プランのスリープ</h3>
          <p>
            Herokuの無料プランでは、30分間アクセスがないとアプリがスリープ状態になります。最初のアクセスでは起動に時間がかかることがあります（約10〜30秒）。
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">CORSの設定</h3>
          <p>
            Herokuアプリ側でCORSが適切に設定されていない場合、ブラウザからのリクエストがブロックされることがあります。サーバー側のCORS設定を確認してください。
          </p>
        </div>
      </div>
    </div>
  )
}
