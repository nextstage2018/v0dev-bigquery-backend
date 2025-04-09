"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Database,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Info,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// 型定義
interface ConnectionTest {
  id: string
  projectId: string
  datasetId: string
  region: string
  keyFileName: string | null
  timestamp: string
  status: "success" | "failure"
  message: string
}

interface TableData {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  columnCount: number
  projectId?: string
  datasetId?: string
}

interface Column {
  id: string
  name: string
  type: string
  mode: "NULLABLE" | "REQUIRED" | "REPEATED"
  description: string
  order: number
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

// パーティショニングタイプ
const partitioningTypes = [
  { value: "none", label: "なし" },
  { value: "time_unit", label: "時間単位" },
  { value: "integer_range", label: "整数範囲" },
]

// 時間単位
const timeUnits = [
  { value: "HOUR", label: "時間" },
  { value: "DAY", label: "日" },
  { value: "MONTH", label: "月" },
  { value: "YEAR", label: "年" },
]

// サンプルテーブルデータ
const sampleTables: TableData[] = [
  {
    id: "table-1",
    name: "users",
    description: "ユーザー情報を管理するテーブル",
    createdAt: "2023-01-15",
    updatedAt: "2023-06-22",
    columnCount: 8,
    projectId: "my-project-202409-436903",
    datasetId: "meta_marketing",
  },
  {
    id: "table-2",
    name: "campaigns",
    description: "広告キャンペーン情報を管理するテーブル",
    createdAt: "2023-02-10",
    updatedAt: "2023-07-01",
    columnCount: 10,
    projectId: "my-project-202409-436903",
    datasetId: "meta_marketing",
  },
]

// サンプルカラムデータ
const sampleColumns: Record<string, Column[]> = {
  "table-1": [
    {
      id: "col-1",
      name: "id",
      type: "STRING",
      mode: "REQUIRED",
      description: "ユーザーの一意識別子",
      order: 1,
    },
    {
      id: "col-2",
      name: "email",
      type: "STRING",
      mode: "REQUIRED",
      description: "ユーザーのメールアドレス",
      order: 2,
    },
    {
      id: "col-3",
      name: "first_name",
      type: "STRING",
      mode: "NULLABLE",
      description: "ユーザーの名",
      order: 3,
    },
    {
      id: "col-4",
      name: "last_name",
      type: "STRING",
      mode: "NULLABLE",
      description: "ユーザーの姓",
      order: 4,
    },
    {
      id: "col-5",
      name: "created_at",
      type: "TIMESTAMP",
      mode: "REQUIRED",
      description: "レコード作成日時",
      order: 5,
    },
  ],
  "table-2": [
    {
      id: "col-1",
      name: "id",
      type: "STRING",
      mode: "REQUIRED",
      description: "キャンペーンの一意識別子",
      order: 1,
    },
    {
      id: "col-2",
      name: "name",
      type: "STRING",
      mode: "REQUIRED",
      description: "キャンペーン名",
      order: 2,
    },
    {
      id: "col-3",
      name: "budget",
      type: "NUMERIC",
      mode: "REQUIRED",
      description: "キャンペーン予算",
      order: 3,
    },
    {
      id: "col-4",
      name: "start_date",
      type: "DATE",
      mode: "REQUIRED",
      description: "開始日",
      order: 4,
    },
    {
      id: "col-5",
      name: "end_date",
      type: "DATE",
      mode: "NULLABLE",
      description: "終了日",
      order: 5,
    },
    {
      id: "col-6",
      name: "status",
      type: "STRING",
      mode: "REQUIRED",
      description: "ステータス",
      order: 6,
    },
  ],
}

// 接続テストコンポーネント
function ConnectionTestForm() {
  const { toast } = useToast()
  const [projectId, setProjectId] = useState("my-project-202409-436903")
  const [datasetId, setDatasetId] = useState("meta_marketing")
  const [region, setRegion] = useState("asia-northeast1")
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking")

  // 接続状態をチェック
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus("checking")
      try {
        // 実際の実装では、APIエンドポイントを呼び出して接続状態を確認する
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 接続テスト履歴から最新の結果を取得
        const savedTests = localStorage.getItem("connectionTests")
        if (savedTests) {
          const tests = JSON.parse(savedTests) as ConnectionTest[]
          if (tests.length > 0 && tests[0].status === "success") {
            setConnectionStatus("connected")
          } else {
            setConnectionStatus("disconnected")
          }
        } else {
          setConnectionStatus("disconnected")
        }
      } catch (error) {
        setConnectionStatus("disconnected")
      }
    }

    checkConnection()
  }, [])

  // 初期データをロード
  useEffect(() => {
    // ローカルストレージから接続テスト履歴を取得
    const savedTests = localStorage.getItem("connectionTests")
    if (savedTests) {
      setConnectionTests(JSON.parse(savedTests))
    }
  }, [])

  // 接続テスト履歴を保存
  const saveConnectionTests = (tests: ConnectionTest[]) => {
    setConnectionTests(tests)
    localStorage.setItem("connectionTests", JSON.stringify(tests))
  }

  // ConnectionTestForm コンポーネントの handleConnectionTest 関数を修正して接続状態を更新
  const handleConnectionTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setConnectionStatus("checking")

    try {
      // 接続テストのダミー処理（実際はAPIを呼び出す）
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // ランダムに成功または失敗を模擬
      const isSuccess = Math.random() > 0.3

      if (isSuccess) {
        // 成功時
        const newTest: ConnectionTest = {
          id: `test-${Date.now()}`,
          projectId,
          datasetId,
          region,
          keyFileName: keyFile?.name || null,
          timestamp: new Date().toISOString(),
          status: "success",
          message: "接続テストに成功しました。",
        }

        // 接続テスト履歴に追加
        saveConnectionTests([newTest, ...connectionTests])

        // 接続状態を更新
        setConnectionStatus("connected")

        toast({
          title: "接続テスト成功",
          description: "BigQueryへの接続テストに成功しました。",
          variant: "default",
        })
      } else {
        // 失敗時
        const newTest: ConnectionTest = {
          id: `test-${Date.now()}`,
          projectId,
          datasetId,
          region,
          keyFileName: keyFile?.name || null,
          timestamp: new Date().toISOString(),
          status: "failure",
          message: "接続テストに失敗しました。認証情報を確認してください。",
        }

        // 接続テスト履歴に追加
        saveConnectionTests([newTest, ...connectionTests])

        // 接続状態を更新
        setConnectionStatus("disconnected")

        toast({
          title: "接続テスト失敗",
          description: "BigQueryへの接続テストに失敗しました。",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("disconnected")
      toast({
        title: "エラー",
        description: "接続テスト中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTest = (id: string) => {
    const updatedTests = connectionTests.filter((test) => test.id !== id)
    saveConnectionTests(updatedTests)

    toast({
      title: "削除完了",
      description: "接続テスト履歴を削除しました。",
      variant: "default",
    })
  }

  // ConnectionTestForm コンポーネントの return 文の先頭に接続状態表示を追加
  return (
    <div className="space-y-6">
      {/* 接続状態表示 */}
      {connectionStatus === "checking" && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>接続確認中</AlertTitle>
          <AlertDescription>BigQueryへの接続状態を確認しています...</AlertDescription>
        </Alert>
      )}

      {connectionStatus === "disconnected" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>未接続</AlertTitle>
          <AlertDescription>
            BigQueryに接続されていません。下記フォームから接続テストを実行してください。
          </AlertDescription>
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
          <CardTitle>BigQuery接続テスト</CardTitle>
          <CardDescription>BigQueryへの接続テストを実行します。必要な情報を入力してください。</CardDescription>
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
                <Input
                  id="keyFile"
                  type="file"
                  onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                  accept="application/json"
                />
                <p className="text-xs text-muted-foreground">JSONフォーマットのサービスアカウントキーファイル</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    テスト実行中...
                  </>
                ) : (
                  "接続テスト実行"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>接続テスト履歴</CardTitle>
          <CardDescription>過去に実行した接続テストの履歴を表示します。</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              接続テスト履歴はありません。上記フォームから接続テストを実行してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ステータス</TableHead>
                  <TableHead>プロジェクトID</TableHead>
                  <TableHead>データセットID</TableHead>
                  <TableHead>リージョン</TableHead>
                  <TableHead>キーファイル</TableHead>
                  <TableHead>テスト日時</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connectionTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      {test.status === "success" ? (
                        <Badge className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          成功
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          失敗
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{test.projectId}</TableCell>
                    <TableCell>{test.datasetId}</TableCell>
                    <TableCell>{test.region}</TableCell>
                    <TableCell>{test.keyFileName || <span className="text-muted-foreground">なし</span>}</TableCell>
                    <TableCell>{new Date(test.timestamp).toLocaleString("ja-JP")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTest(test.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// テーブル作成コンポーネント
function TableCreationForm() {
  const router = useRouter()
  const { toast } = useToast()

  // 基本情報
  const [projectId, setProjectId] = useState("my-project-202409-436903")
  const [datasetId, setDatasetId] = useState("meta_marketing")
  const [tableName, setTableName] = useState("")
  const [description, setDescription] = useState("")

  // パーティショニング設定
  const [partitioningType, setPartitioningType] = useState("none")
  const [partitioningField, setPartitioningField] = useState("")
  const [partitioningTimeUnit, setPartitioningTimeUnit] = useState("DAY")

  // カラム設定
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "col-1",
      name: "id",
      type: "STRING",
      mode: "REQUIRED",
      description: "一意識別子",
      order: 1,
    },
    {
      id: "col-2",
      name: "created_at",
      type: "TIMESTAMP",
      mode: "REQUIRED",
      description: "レコード作成日時",
      order: 2,
    },
    {
      id: "col-3",
      name: "updated_at",
      type: "TIMESTAMP",
      mode: "REQUIRED",
      description: "レコード更新日時",
      order: 3,
    },
  ])

  // 詳細設定
  const [expirationDays, setExpirationDays] = useState("")
  const [requirePartitionFilter, setRequirePartitionFilter] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [tables, setTables] = useState<TableData[]>(sampleTables)
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
      mode: newColumnMode as "NULLABLE" | "REQUIRED" | "REPEATED",
      description: newColumnDescription,
      order: columns.length + 1,
    }

    setColumns([...columns, newColumn])

    // フォームをリセット
    setNewColumnName("")
    setNewColumnType("STRING")
    setNewColumnMode("NULLABLE")
    setNewColumnDescription("")
    setShowColumnForm(false)
  }

  // カラム削除処理
  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter((col) => col.id !== id))
  }

  // テーブル作成処理
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()

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
      // テーブル作成のダミー処理（実際はAPIを呼び出す）
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newTable: TableData = {
        id: `table-${Date.now()}`,
        name: tableName,
        description,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        columnCount: columns.length,
        projectId,
        datasetId,
      }

      setTables([...tables, newTable])

      toast({
        title: "テーブル作成成功",
        description: `テーブル「${tableName}」が正常に作成されました。`,
        variant: "default",
      })

      // 詳細設定ページへリダイレクト
      router.push(`/database/tables/${newTable.id}`)
    } catch (error) {
      toast({
        title: "エラー",
        description: "テーブルの作成に失敗しました。",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>BigQueryテーブル作成手順</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal pl-4 space-y-1 mt-2">
            <li>基本情報（プロジェクトID、データセットID、テーブル名）を入力</li>
            <li>テーブルのカラム定義を設定（少なくとも1つのカラムが必要）</li>
            <li>必要に応じてパーティショニングや詳細設定を行う</li>
            <li>「テーブルを作成」ボタンをクリックして作成完了</li>
          </ol>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleCreateTable}>
        <div className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>テーブルの基本情報を入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* カラム定義 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>カラム定義</CardTitle>
                <CardDescription>テーブルのカラム構造を定義します。少なくとも1つのカラムが必要です。</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={() => setShowColumnForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                カラム追加
              </Button>
            </CardHeader>
            <CardContent>
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
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowColumnForm(false)}>
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
                      <Select value={newColumnMode} onValueChange={setNewColumnMode}>
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
                      カラムを追加
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* パーティショニング設定 */}
          <Card>
            <CardHeader>
              <CardTitle>パーティショニング設定</CardTitle>
              <CardDescription>テーブルのパーティショニング方法を設定します。（オプション）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partitioningType">パーティショニングタイプ</Label>
                <Select value={partitioningType} onValueChange={setPartitioningType}>
                  <SelectTrigger id="partitioningType">
                    <SelectValue placeholder="パーティショニングタイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {partitioningTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {partitioningType === "time_unit" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partitioningField">パーティショニングフィールド</Label>
                    <Select value={partitioningField} onValueChange={setPartitioningField}>
                      <SelectTrigger id="partitioningField">
                        <SelectValue placeholder="フィールドを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns
                          .filter((col) => ["TIMESTAMP", "DATE", "DATETIME"].includes(col.type))
                          .map((col) => (
                            <SelectItem key={col.id} value={col.name}>
                              {col.name} ({col.type})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partitioningTimeUnit">時間単位</Label>
                    <Select value={partitioningTimeUnit} onValueChange={setPartitioningTimeUnit}>
                      <SelectTrigger id="partitioningTimeUnit">
                        <SelectValue placeholder="時間単位を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {partitioningType === "integer_range" && (
                <div className="space-y-2">
                  <Label htmlFor="partitioningField">パーティショニングフィールド</Label>
                  <Select value={partitioningField} onValueChange={setPartitioningField}>
                    <SelectTrigger id="partitioningField">
                      <SelectValue placeholder="フィールドを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns
                        .filter((col) => ["INTEGER"].includes(col.type))
                        .map((col) => (
                          <SelectItem key={col.id} value={col.name}>
                            {col.name} ({col.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 詳細設定 */}
          <Card>
            <CardHeader>
              <CardTitle>詳細設定</CardTitle>
              <CardDescription>テーブルの詳細設定を行います。（オプション）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expirationDays">有効期限（日数）</Label>
                  <Input
                    id="expirationDays"
                    type="number"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    placeholder="例: 30, 90, 365"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">空白の場合、テーブルに有効期限はありません。</p>
                </div>
              </div>

              {partitioningType !== "none" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requirePartitionFilter"
                    checked={requirePartitionFilter}
                    onCheckedChange={(checked) => setRequirePartitionFilter(!!checked)}
                  />
                  <Label htmlFor="requirePartitionFilter">クエリにパーティションフィルターを必須にする</Label>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/database">キャンセル</Link>
            </Button>
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
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>テーブル一覧</CardTitle>
          <CardDescription>作成済みのテーブル一覧を表示します。</CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              テーブルはありません。上記フォームからテーブルを作成してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>テーブル名</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>カラム数</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>更新日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>{table.description}</TableCell>
                    <TableCell>{table.columnCount}</TableCell>
                    <TableCell>{table.createdAt}</TableCell>
                    <TableCell>{table.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/database/tables/${table.id}`}>
                              <Database className="mr-2 h-4 w-4" />
                              <span>詳細</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/database/tables/${table.id}/columns`}>
                              <Database className="mr-2 h-4 w-4" />
                              <span>カラム管理</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>編集</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>削除</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// カラム管理コンポーネント
function ColumnManagement() {
  const { toast } = useToast()
  const [tables] = useState<TableData[]>(sampleTables)
  const [columns, setColumns] = useState<Record<string, Column[]>>(sampleColumns)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false)
  const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState(false)
  const [isDeleteColumnDialogOpen, setIsDeleteColumnDialogOpen] = useState(false)
  const [currentColumn, setCurrentColumn] = useState<Column | null>(null)

  // 新規カラム用の状態
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState("STRING")
  const [newColumnMode, setNewColumnMode] = useState<"NULLABLE" | "REQUIRED" | "REPEATED">("NULLABLE")
  const [newColumnDescription, setNewColumnDescription] = useState("")

  // 編集用の状態
  const [editColumnName, setEditColumnName] = useState("")
  const [editColumnType, setEditColumnType] = useState("")
  const [editColumnMode, setEditColumnMode] = useState<"NULLABLE" | "REQUIRED" | "REPEATED">("NULLABLE")
  const [editColumnDescription, setEditColumnDescription] = useState("")

  const handleAddColumn = () => {
    if (!selectedTable) return

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
      order: (columns[selectedTable]?.length || 0) + 1,
    }

    const updatedColumns = {
      ...columns,
      [selectedTable]: [...(columns[selectedTable] || []), newColumn],
    }

    setColumns(updatedColumns)
    setIsAddColumnDialogOpen(false)

    // フォームをリセット
    setNewColumnName("")
    setNewColumnType("STRING")
    setNewColumnMode("NULLABLE")
    setNewColumnDescription("")

    toast({
      title: "カラム追加成功",
      description: `カラム「${newColumnName}」が正常に追加されました。`,
      variant: "default",
    })
  }

  const handleEditColumn = () => {
    if (!selectedTable || !currentColumn) return

    if (!editColumnName.trim()) {
      toast({
        title: "入力エラー",
        description: "カラム名は必須です。",
        variant: "destructive",
      })
      return
    }

    const updatedColumns = {
      ...columns,
      [selectedTable]: columns[selectedTable].map((col) =>
        col.id === currentColumn.id
          ? {
              ...col,
              name: editColumnName,
              type: editColumnType,
              mode: editColumnMode,
              description: editColumnDescription,
            }
          : col,
      ),
    }

    setColumns(updatedColumns)
    setIsEditColumnDialogOpen(false)

    toast({
      title: "カラム編集成功",
      description: `カラム「${editColumnName}」が正常に更新されました。`,
      variant: "default",
    })
  }

  const handleDeleteColumn = () => {
    if (!selectedTable || !currentColumn) return

    const updatedColumns = {
      ...columns,
      [selectedTable]: columns[selectedTable].filter((col) => col.id !== currentColumn.id),
    }

    setColumns(updatedColumns)
    setIsDeleteColumnDialogOpen(false)

    toast({
      title: "カラム削除成功",
      description: `カラム「${currentColumn.name}」が正常に削除されました。`,
      variant: "default",
    })
  }

  const openEditDialog = (column: Column) => {
    setCurrentColumn(column)
    setEditColumnName(column.name)
    setEditColumnType(column.type)
    setEditColumnMode(column.mode)
    setEditColumnDescription(column.description)
    setIsEditColumnDialogOpen(true)
  }

  const openDeleteDialog = (column: Column) => {
    setCurrentColumn(column)
    setIsDeleteColumnDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>カラム管理</CardTitle>
          <CardDescription>テーブルを選択して、カラムの追加・編集・削除を行います。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tableSelect">テーブルを選択</Label>
              <Select value={selectedTable || ""} onValueChange={setSelectedTable}>
                <SelectTrigger id="tableSelect">
                  <SelectValue placeholder="テーブルを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTable && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium" id={`column-management-${selectedTable}`}>
                    {tables.find((t) => t.id === selectedTable)?.name} のカラム
                  </h3>
                  <Button onClick={() => setIsAddColumnDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    カラム追加
                  </Button>
                </div>

                {columns[selectedTable]?.length > 0 ? (
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
                      {columns[selectedTable]?.map((column) => (
                        <TableRow key={column.id}>
                          <TableCell className="font-medium">{column.name}</TableCell>
                          <TableCell>{column.type}</TableCell>
                          <TableCell>{column.mode}</TableCell>
                          <TableCell>{column.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(column)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(column)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    このテーブルにはカラムがありません。「カラム追加」ボタンからカラムを追加してください。
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* カラム追加ダイアログ */}
      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>新規カラム追加</DialogTitle>
            <DialogDescription>テーブルに新しいカラムを追加します。必要な情報を入力してください。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newColumnName" className="text-right">
                カラム名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newColumnName"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="col-span-3"
                placeholder="例: first_name, email など"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newColumnType" className="text-right">
                データ型 <span className="text-red-500">*</span>
              </Label>
              <Select value={newColumnType} onValueChange={setNewColumnType}>
                <SelectTrigger id="newColumnType" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newColumnMode" className="text-right">
                モード <span className="text-red-500">*</span>
              </Label>
              <Select value={newColumnMode} onValueChange={(value) => setNewColumnMode(value as any)}>
                <SelectTrigger id="newColumnMode" className="col-span-3">
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="newColumnDescription" className="text-right pt-2">
                説明
              </Label>
              <Textarea
                id="newColumnDescription"
                value={newColumnDescription}
                onChange={(e) => setNewColumnDescription(e.target.value)}
                className="col-span-3"
                placeholder="このカラムの用途や保存するデータについて説明"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddColumnDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddColumn}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* カラム編集ダイアログ */}
      <Dialog open={isEditColumnDialogOpen} onOpenChange={setIsEditColumnDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>カラム編集</DialogTitle>
            <DialogDescription>カラムの情報を編集します。必要な情報を入力してください。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editColumnName" className="text-right">
                カラム名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editColumnName"
                value={editColumnName}
                onChange={(e) => setEditColumnName(e.target.value)}
                className="col-span-3"
                placeholder="例: first_name, email など"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editColumnType" className="text-right">
                データ型 <span className="text-red-500">*</span>
              </Label>
              <Select value={editColumnType} onValueChange={setEditColumnType}>
                <SelectTrigger id="editColumnType" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editColumnMode" className="text-right">
                モード <span className="text-red-500">*</span>
              </Label>
              <Select value={editColumnMode} onValueChange={(value) => setEditColumnMode(value as any)}>
                <SelectTrigger id="editColumnMode" className="col-span-3">
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="editColumnDescription" className="text-right pt-2">
                説明
              </Label>
              <Textarea
                id="editColumnDescription"
                value={editColumnDescription}
                onChange={(e) => setEditColumnDescription(e.target.value)}
                className="col-span-3"
                placeholder="このカラムの用途や保存するデータについて説明"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditColumnDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEditColumn}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* カラム削除確認ダイアログ */}
      <Dialog open={isDeleteColumnDialogOpen} onOpenChange={setIsDeleteColumnDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>カラム削除の確認</DialogTitle>
            <DialogDescription>
              カラム「{currentColumn?.name}」を削除してもよろしいですか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteColumnDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteColumn}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function BigQueryManagementPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/database">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">BigQuery管理</h1>
      </div>

      <Tabs defaultValue="connection-test">
        <TabsList>
          <TabsTrigger value="connection-test">接続テスト</TabsTrigger>
          <TabsTrigger value="table-management">テーブル管理</TabsTrigger>
          <TabsTrigger value="column-management">カラム管理</TabsTrigger>
        </TabsList>
        <TabsContent value="connection-test" className="mt-6">
          <ConnectionTestForm />
        </TabsContent>
        <TabsContent value="table-management" className="mt-6">
          <TableCreationForm />
        </TabsContent>
        <TabsContent value="column-management" className="mt-6">
          <ColumnManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
