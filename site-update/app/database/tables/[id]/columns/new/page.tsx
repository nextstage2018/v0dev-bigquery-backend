"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// サンプルテーブル情報
const tableInfo = {
  id: "table-1",
  name: "users",
  description: "ユーザー情報を管理するテーブル",
}

// BigQueryのデータ型オプション
const dataTypes = [
  { value: "STRING", label: "STRING" },
  { value: "INTEGER", label: "INTEGER" },
  { value: "FLOAT", label: "FLOAT" },
  { value: "NUMERIC", label: "NUMERIC" },
  { value: "BIGNUMERIC", label: "BIGNUMERIC" },
  { value: "BOOLEAN", label: "BOOLEAN" },
  { value: "TIMESTAMP", label: "TIMESTAMP" },
  { value: "DATE", label: "DATE" },
  { value: "TIME", label: "TIME" },
  { value: "DATETIME", label: "DATETIME" },
  { value: "GEOGRAPHY", label: "GEOGRAPHY" },
  { value: "BYTES", label: "BYTES" },
  { value: "RECORD", label: "RECORD (STRUCT)" },
  { value: "ARRAY", label: "ARRAY" },
  { value: "JSON", label: "JSON" },
]

// BigQueryのモード
const modes = [
  { value: "NULLABLE", label: "NULLABLE" },
  { value: "REQUIRED", label: "REQUIRED" },
  { value: "REPEATED", label: "REPEATED" },
]

export default function NewColumnPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [mode, setMode] = useState("NULLABLE")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ここでBigQueryにカラムを追加する処理を行う
      // 実際の実装では、APIエンドポイントを呼び出してサーバーサイドで処理する
      await new Promise((resolve) => setTimeout(resolve, 1500)) // 処理模擬

      toast({
        title: "カラム作成成功",
        description: `カラム「${name}」が正常に作成されました。`,
        variant: "default",
      })

      // 作成後はカラム一覧ページに戻る
      router.push(`/database/tables/${params.id}/columns`)
    } catch (error) {
      toast({
        title: "エラー",
        description: "カラムの作成に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/database/tables/${params.id}/columns`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{tableInfo.name} - 新規カラム作成</h1>
      </div>

      <p className="text-muted-foreground">
        BigQueryテーブルに新しいカラムを作成します。必要な情報を入力してください。
      </p>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>カラム情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  カラム名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: first_name, email など"
                  required
                />
                <p className="text-xs text-muted-foreground">BigQueryの命名規則に従った名前を入力してください。</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  データ型 <span className="text-red-500">*</span>
                </Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="データ型を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((dataType) => (
                      <SelectItem key={dataType.value} value={dataType.value}>
                        {dataType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  BigQueryでサポートされているデータ型を選択してください。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">
                  モード <span className="text-red-500">*</span>
                </Label>
                <Select value={mode} onValueChange={setMode} required>
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="モードを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {modes.map((modeOption) => (
                      <SelectItem key={modeOption.value} value={modeOption.value}>
                        {modeOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  NULLABLE: NULL値を許可、REQUIRED: NULL値を許可しない、REPEATED: 配列型
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このカラムの用途や保存するデータについて説明"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/database/tables/${params.id}/columns`}>キャンセル</Link>
            </Button>
            <Button type="submit" disabled={isLoading || !name || !type}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  作成中...
                </>
              ) : (
                "作成"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
