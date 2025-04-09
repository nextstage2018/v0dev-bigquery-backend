"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// サンプルデータベース
const sampleDatabases = [
  {
    id: "db-1",
    name: "production",
    description: "本番環境データベース",
    type: "BigQuery",
    projectId: "your-project-id",
    datasetId: "production_dataset",
  },
  {
    id: "db-2",
    name: "staging",
    description: "ステージング環境データベース",
    type: "BigQuery",
    projectId: "your-project-id",
    datasetId: "staging_dataset",
  },
  {
    id: "db-3",
    name: "development",
    description: "開発環境データベース",
    type: "BigQuery",
    projectId: "your-project-id",
    datasetId: "development_dataset",
  },
  {
    id: "db-4",
    name: "analytics",
    description: "分析用データベース",
    type: "BigQuery",
    projectId: "your-project-id",
    datasetId: "analytics_dataset",
  },
]

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

export default function NewTablePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tableName, setTableName] = useState("")
  const [description, setDescription] = useState("")
  const [database, setDatabase] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // 初期カラム
  const [columns, setColumns] = useState([
    {
      id: "col-1",
      name: "id",
      type: "STRING",
      mode: "REQUIRED",
      description: "一意識別子",
    },
    {
      id: "col-2",
      name: "created_at",
      type: "TIMESTAMP",
      mode: "REQUIRED",
      description: "レコード作成日時",
    },
    {
      id: "col-3",
      name: "updated_at",
      type: "TIMESTAMP",
      mode: "REQUIRED",
      description: "レコード更新日時",
    },
  ])

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      {
        id: `col-${Date.now()}`,
        name: "",
        type: "STRING",
        mode: "NULLABLE",
        description: "",
      },
    ])
  }

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter((col) => col.id !== id))
  }

  const handleColumnChange = (id: string, field: string, value: any) => {
    setColumns(
      columns.map((col) => {
        if (col.id === id) {
          return { ...col, [field]: value }
        }
        return col
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ここでBigQueryにテーブルを作成する処理を行う
      // 実際の実装では、APIエンドポイントを呼び出してサーバーサイドで処理する
      await new Promise((resolve) => setTimeout(resolve, 2000)) // 処理模擬

      toast({
        title: "テーブル作成成功",
        description: `テーブル「${tableName}」が正常に作成されました。`,
        variant: "default",
      })

      // 作成後はテーブル一覧ページに戻る
      router.push("/database")
    } catch (error) {
      toast({
        title: "エラー",
        description: "テーブルの作成に失敗しました。",
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
          <Link href="/database">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">BigQueryテーブル作成</h1>
      </div>

      <p className="text-muted-foreground">
        BigQueryに新しいデータテーブルを作成します。テーブル名、説明、カラム情報を入力してください。
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>テーブル基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="database">
                    データベース <span className="text-red-500">*</span>
                  </Label>
                  <Select value={database} onValueChange={setDatabase} required>
                    <SelectTrigger id="database">
                      <SelectValue placeholder="データベースを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleDatabases.map((db) => (
                        <SelectItem key={db.id} value={db.id}>
                          {db.name} ({db.datasetId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="このテーブルの用途や保存するデータについて説明"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>カラム定義</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddColumn}>
                <Plus className="mr-2 h-4 w-4" />
                カラム追加
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {columns.map((column, index) => (
                  <div key={column.id} className="grid grid-cols-12 gap-2 items-start border-b pb-4">
                    <div className="col-span-3">
                      <Label htmlFor={`column-name-${column.id}`} className="mb-2 block">
                        カラム名 {index === 0 && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={`column-name-${column.id}`}
                        value={column.name}
                        onChange={(e) => handleColumnChange(column.id, "name", e.target.value)}
                        placeholder="カラム名"
                        required={index === 0}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`column-type-${column.id}`} className="mb-2 block">
                        データ型
                      </Label>
                      <Select
                        value={column.type}
                        onValueChange={(value) => handleColumnChange(column.id, "type", value)}
                      >
                        <SelectTrigger id={`column-type-${column.id}`}>
                          <SelectValue placeholder="データ型" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`column-mode-${column.id}`} className="mb-2 block">
                        モード
                      </Label>
                      <Select
                        value={column.mode}
                        onValueChange={(value) => handleColumnChange(column.id, "mode", value)}
                      >
                        <SelectTrigger id={`column-mode-${column.id}`}>
                          <SelectValue placeholder="モード" />
                        </SelectTrigger>
                        <SelectContent>
                          {modes.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`column-description-${column.id}`} className="mb-2 block">
                        説明
                      </Label>
                      <Input
                        id={`column-description-${column.id}`}
                        value={column.description}
                        onChange={(e) => handleColumnChange(column.id, "description", e.target.value)}
                        placeholder="説明"
                      />
                    </div>
                    <div className="col-span-1 pt-8">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveColumn(column.id)}
                        disabled={columns.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/database">キャンセル</Link>
            </Button>
            <Button type="submit" disabled={isLoading || !tableName || !database || columns.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  作成中...
                </>
              ) : (
                "テーブルを作成"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
