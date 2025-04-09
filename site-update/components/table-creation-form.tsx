"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Plus, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { createBigQueryTable } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

// BigQueryのデータ型オプション
const dataTypes = [
  { value: "STRING", label: "STRING" },
  { value: "INTEGER", label: "INTEGER" },
  { value: "FLOAT", label: "FLOAT" },
  { value: "NUMERIC", label: "NUMERIC" },
  { value: "BOOLEAN", label: "BOOLEAN" },
  { value: "TIMESTAMP", label: "TIMESTAMP" },
  { value: "DATE", label: "DATE" },
  { value: "DATETIME", label: "DATETIME" },
]

// BigQueryのモード
const modes = [
  { value: "NULLABLE", label: "NULLABLE" },
  { value: "REQUIRED", label: "REQUIRED" },
  { value: "REPEATED", label: "REPEATED" },
]

interface Column {
  id: string
  name: string
  type: string
  mode: "NULLABLE" | "REQUIRED" | "REPEATED"
  description: string
}

export default function TableCreationForm({ projectId = "", datasetId = "" }) {
  const { toast } = useToast()
  const [tableName, setTableName] = useState("")
  const [tableDescription, setTableDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // カラム管理の状態
  const [columns, setColumns] = useState<Column[]>([
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

  const [showColumnForm, setShowColumnForm] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState("STRING")
  const [newColumnMode, setNewColumnMode] = useState<"NULLABLE" | "REQUIRED" | "REPEATED">("NULLABLE")
  const [newColumnDescription, setNewColumnDescription] = useState("")

  // カラム追加処理
  const handleAddColumn = () => {
    if (!newColumnName.trim()) {
      toast({
        title: "入力エラー",
        description: "カラム名は必須です。",
        variant: "destructive",
      })
      return
    }

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: newColumnName,
      type: newColumnType,
      mode: newColumnMode,
      description: newColumnDescription,
    }

    setColumns([...columns, newColumn])

    // フォームをリセット
    setNewColumnName("")
    setNewColumnType("STRING")
    setNewColumnMode("NULLABLE")
    setNewColumnDescription("")
    setShowColumnForm(false)

    toast({
      title: "カラム追加",
      description: `カラム「${newColumnName}」を追加しました。`,
      variant: "default",
    })
  }

  // カラム削除処理
  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter((col) => col.id !== id))

    toast({
      title: "カラム削除",
      description: "カラムを削除しました。",
      variant: "default",
    })
  }

  // テーブル作成処理
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!tableName.trim()) {
      toast({
        title: "入力エラー",
        description: "テーブル名は必須です。",
        variant: "destructive",
      })
      return
    }

    if (columns.length === 0) {
      toast({
        title: "入力エラー",
        description: "少なくとも1つのカラムが必要です。",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // API リクエストデータの準備
      const requestData = {
        projectId,
        datasetId,
        tableName,
        description: tableDescription,
        columns: columns.map((col) => ({
          name: col.name,
          type: col.type,
          mode: col.mode,
          description: col.description,
        })),
      }

      // API 呼び出し
      const response = await createBigQueryTable(requestData)

      if (response.success) {
        setSuccessMessage(response.message || `テーブル「${tableName}」が正常に作成されました。`)
        toast({
          title: "テーブル作成成功",
          description: response.message || `テーブル「${tableName}」が正常に作成されました。`,
          variant: "default",
        })

        // フォームをリセット
        setTableName("")
        setTableDescription("")
      } else {
        setErrorMessage(response.message || "テーブルの作成に失敗しました。")
        toast({
          title: "テーブル作成エラー",
          description: response.message || "テーブルの作成に失敗しました。",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setErrorMessage(error.message || "テーブルの作成に失敗しました。")
      toast({
        title: "エラー",
        description: error.message || "テーブルの作成に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>成功</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>テーブル作成</CardTitle>
          <CardDescription>BigQueryに新しいテーブルを作成します。必要な情報を入力してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTable} className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">プロジェクトID</Label>
                  <Input id="projectId" value={projectId} disabled placeholder="接続設定から取得されます" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datasetId">データセットID</Label>
                  <Input id="datasetId" value={datasetId} disabled placeholder="接続設定から取得されます" />
                </div>
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
              <div className="space-y-2">
                <Label htmlFor="tableDescription">説明</Label>
                <Textarea
                  id="tableDescription"
                  value={tableDescription}
                  onChange={(e) => setTableDescription(e.target.value)}
                  placeholder="このテーブルの用途や保存するデータについて説明"
                  rows={3}
                />
              </div>
            </div>

            {/* カラム定義 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">カラム定義</h3>
                <Button type="button" variant="outline" onClick={() => setShowColumnForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  カラム追加
                </Button>
              </div>

              {columns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>カラム名</TableHead>
                      <TableHead>データ型</TableHead>
                      <TableHead>モード</TableHead>
                      <TableHead>説明</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columns.map((column) => (
                      <TableRow key={column.id}>
                        <TableCell className="font-medium">{column.name}</TableCell>
                        <TableCell>{column.type}</TableCell>
                        <TableCell>{column.mode}</TableCell>
                        <TableCell>{column.description}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveColumn(column.id)}
                            disabled={columns.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  カラムがありません。「カラム追加」ボタンからカラムを追加してください。
                </div>
              )}

              {/* カラム追加フォーム */}
              {showColumnForm && (
                <div className="mt-4 border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">新規カラム追加</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowColumnForm(false)
                        setNewColumnName("")
                        setNewColumnType("STRING")
                        setNewColumnMode("NULLABLE")
                        setNewColumnDescription("")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newColumnName">
                        カラム名 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="newColumnName"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="例: first_name, email など"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newColumnType">
                        データ型 <span className="text-red-500">*</span>
                      </Label>
                      <Select value={newColumnType} onValueChange={setNewColumnType}>
                        <SelectTrigger id="newColumnType">
                          <SelectValue placeholder="データ型を選択" />
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newColumnMode">
                        モード <span className="text-red-500">*</span>
                      </Label>
                      <Select value={newColumnMode} onValueChange={(value) => setNewColumnMode(value as any)}>
                        <SelectTrigger id="newColumnMode">
                          <SelectValue placeholder="モードを選択" />
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
                    <div className="space-y-2">
                      <Label htmlFor="newColumnDescription">説明</Label>
                      <Input
                        id="newColumnDescription"
                        value={newColumnDescription}
                        onChange={(e) => setNewColumnDescription(e.target.value)}
                        placeholder="このカラムの説明"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleAddColumn}>
                      追加
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || columns.length === 0}>
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
