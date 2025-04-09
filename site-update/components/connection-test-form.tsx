"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { testBigQueryConnection } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface ConnectionTestFormProps {
  onConnectionSuccess?: (projectId: string, datasetId: string) => void
}

export default function ConnectionTestForm({ onConnectionSuccess }: ConnectionTestFormProps) {
  const { toast } = useToast()
  const [projectId, setProjectId] = useState("")
  const [datasetId, setDatasetId] = useState("")
  const [region, setRegion] = useState("asia-northeast1")
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [keyJson, setKeyJson] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking" | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  // サービスアカウントキーファイルの読み込み
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setKeyFile(file)

    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonContent = event.target?.result as string
          setKeyJson(jsonContent)
        } catch (error) {
          console.error("ファイル読み込みエラー:", error)
          setKeyJson("")
        }
      }
      reader.readAsText(file)
    } else {
      setKeyJson("")
    }
  }

  // 接続テスト実行
  const handleConnectionTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setConnectionStatus("checking")
    setErrorMessage("")

    try {
      // API リクエストデータの準備
      const requestData = {
        projectId,
        datasetId,
        region,
        serviceAccountKey: keyJson || null,
      }

      // API 呼び出し
      const response = await testBigQueryConnection(requestData)

      if (response.success) {
        setConnectionStatus("connected")
        toast({
          title: "接続テスト成功",
          description: "BigQueryへの接続テストに成功しました。",
          variant: "default",
        })

        // 接続成功時にコールバックを呼び出す
        if (onConnectionSuccess) {
          onConnectionSuccess(projectId, datasetId)
        }
      } else {
        setConnectionStatus("disconnected")
        setErrorMessage(response.message || "接続テストに失敗しました。")
        toast({
          title: "接続テスト失敗",
          description: response.message || "BigQueryへの接続テストに失敗しました。",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setConnectionStatus("disconnected")
      setErrorMessage(error.message || "接続テストに失敗しました。")
      toast({
        title: "接続テスト失敗",
        description: error.message || "BigQueryへの接続テストに失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {connectionStatus === "checking" && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>接続確認中</AlertTitle>
          <AlertDescription>BigQueryへの接続状態を確認しています...</AlertDescription>
        </Alert>
      )}

      {connectionStatus === "disconnected" && errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>接続エラー</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {connectionStatus === "connected" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>接続済み</AlertTitle>
          <AlertDescription>
            BigQuery ({projectId}.{datasetId}) に正常に接続されています。
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>BigQuery接続設定</CardTitle>
          <CardDescription>
            BigQueryへの接続情報を設定します。サービスアカウントキーは初回接続時のみ必要です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnectionTest} className="space-y-4">
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
                <Label htmlFor="datasetId">
                  データセットID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="datasetId"
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
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
                <Label htmlFor="keyFile">サービスアカウントキーファイル</Label>
                <Input id="keyFile" type="file" onChange={handleFileChange} accept="application/json" />
                <p className="text-xs text-muted-foreground">
                  JSONフォーマットのサービスアカウントキーファイル（初回接続時のみ必要）
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    接続中...
                  </>
                ) : connectionStatus === "connected" ? (
                  "再接続"
                ) : (
                  "接続"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
