"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  Search,
  RefreshCw,
  TableIcon,
  ArrowUpDown,
  FileText,
  Eye,
  Copy,
} from "lucide-react"

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
  rowCount: number
  status: string
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

export default function DatabaseManagementPage() {
const router = useRouter()
const { toast } = useToast()
const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking")
const [activeTab, setActiveTab] = useState("connection")
const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false)
const [isColumnManagementDialogOpen, setIsColumnManagementDialogOpen] = useState(false)
const [selectedTable, setSelectedTable] = useState<TableData | null>(null)

// 接続設定の状態
const [projectId, setProjectId] = useState("my-project-202409-436903")
const [datasetId, setDatasetId] = useState("meta_marketing")
const [region, setRegion] = useState("asia-northeast1")
const [keyFile, setKeyFile] = useState<File | null>(null)
const [isLoading, setIsLoading] = useState(false)
const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([])

// テーブル一覧の状態
const [tables, setTables] = useState<TableData[]>([])
const [isTableLoading, setIsTableLoading] = useState(true)
const [searchQuery, setSearchQuery] = useState("")
const [statusFilter, setStatusFilter] = useState("all")

// テーブル作成の状態
const [tableName, setTableName] = useState("")
const [tableDescription, setTableDescription] = useState("")
const [partitioningType, setPartitioningType] = useState("none")
const [partitioningField, setPartitioningField] = useState("")
const [partitioningTimeUnit, setPartitioningTimeUnit] = useState("DAY")
const [expirationDays, setExpirationDays] = useState("")
const [requirePartitionFilter, setRequirePartitionFilter] = useState(false)

// カラム管理の状態
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
const [showColumnForm, setShowColumnForm] = useState(false)
const [newColumnName, setNewColumnName] = useState("")
const [newColumnType, setNewColumnType] = useState("STRING")
const [newColumnMode, setNewColumnMode] = useState<"NULLABLE" | "REQUIRED" | "REPEATED">("NULLABLE")
const [newColumnDescription, setNewColumnDescription] = useState("")
const [editingColumn, setEditingColumn] = useState<Column | null>(null)
const [isDeleteColumnDialogOpen, setIsDeleteColumnDialogOpen] = useState(false)

// SQLクエリの状態
const [sqlQuery, setSqlQuery] = useState("")
const [queryResult, setQueryResult] = useState<any[] | null>(null)
const [isQueryRunning, setIsQueryRunning] = useState(false)

// 接続状態をチェック
useEffect(() => {
  const checkConnection = async () => {
    setConnectionStatus("checking")
    try {
      // 接続テスト履歴から最新の結果を取得
      const savedTests = localStorage.getItem("connectionTests")
      if (savedTests) {
        const tests = JSON.parse(savedTests) as ConnectionTest[]
        if (tests.length > 0 && tests[0].status === "success") {
          setConnectionStatus("connected")
          // 最新の接続情報を設定
          const latestTest = tests[0]
          setProjectId(latestTest.projectId)
          setDatasetId(latestTest.datasetId)
          setRegion(latestTest.region)

          // 接続済みの場合はテーブル一覧タブをアクティブに
          setActiveTab("tables")

          // テーブル一覧を取得
          fetchTables(latestTest.projectId, latestTest.datasetId)
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

// テーブル一覧を取得
const fetchTables = async (projectId = "", datasetId = "") => {
  setIsTableLoading(true)
  try {
    const response = await fetch(
      `/api/database/bigquery/tables?projectId=${projectId || ""}&datasetId=${datasetId || ""}`,
    )
    const data = await response.json()

    if (data.success) {
      setTables(data.tables)
    } else {
      toast({
        title: "エラー",
        description: data.message || "テーブル一覧の取得に失敗しました。",
        variant: "destructive",
      })
      setTables([])
    }
  } catch (error) {
    console.error("テーブル一覧取得エラー:", error)
    toast({
      title: "エラー",
      description: "テーブル一覧の取得に失敗しました。",
      variant: "destructive",
    })
    setTables([])
  } finally {
    setIsTableLoading(false)
  }
}

// 接続テスト実行
const handleConnectionTest = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setConnectionStatus("checking")

  try {
    // APIを呼び出して接続テスト
    const response = await fetch("/api/database/bigquery/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        datasetId,
        region,
      }),
    })

    // レスポンスのステータスコードを確認
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`サーバーエラー (${response.status}): ${errorText.substring(0, 100)}...`)
    }

    // レスポンスのContent-Typeを確認
    const contentType = response.headers.get("Content-Type")
    if (!contentType || !contentType.includes("application/json")) {
      const textData = await response.text()
      throw new Error(`無効なレスポンス形式: ${textData.substring(0, 100)}...`)
    }

    const data = await response.json()

    if (data.success) {
      // 成功を記録
      const newTest: ConnectionTest = {
        id: `test-${Date.now()}`,
        projectId,
        datasetId,
        region,
        keyFileName: keyFile?.name || null,
        timestamp: new Date().toISOString(),
        status: "success",
        message: data.message || "接続テストに成功しました。",
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

      // テーブル一覧を取得
      fetchTables(projectId, datasetId)

      // テーブル一覧タブに切り替え
      setActiveTab("tables")
    } else {
      // 失敗を記録
      const newTest: ConnectionTest = {
        id: `test-${Date.now()}`,
        projectId,
        datasetId,
        region,
        keyFileName: keyFile?.name || null,
        timestamp: new Date().toISOString(),
        status: "failure",
        message: data.error || "接続テストに失敗しました。",
      }

      // 接続テスト履歴に追加
      saveConnectionTests([newTest, ...connectionTests])

      // 接続状態を更新
      setConnectionStatus("disconnected")

      toast({
        title: "接続テスト失敗",
        description: data.message || "BigQueryへの接続テストに失敗しました。",
        variant: "destructive",
      })
    }
  } catch (error: any) {
    console.error("接続テストエラー:", error)

    // 失敗を記録
    const newTest: ConnectionTest = {
      id: `test-${Date.now()}`,
      projectId,
      datasetId,
      region,
      keyFileName: keyFile?.name || null,
      timestamp: new Date().toISOString(),
      status: "failure",
      message: error.message || "接続テストに失敗しました。ネットワークエラーが発生しました。",
    }

    // 接続テスト履歴に追加
    saveConnectionTests([newTest, ...connectionTests])

    // 接続状態を更新
    setConnectionStatus("disconnected")

    toast({
      title: "接続テスト失敗",
      description: error.message || "BigQueryへの接続テストに失敗しました。",
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
  }
}

// 接続テスト履歴削除
const handleDeleteTest = (id: string) => {
  const updatedTests = connectionTests.filter((test) => test.id !== id)
  saveConnectionTests(updatedTests)

  toast({
    title: "削除完了",
    description: "接続テスト履歴を削除しました。",
    variant: "default",
  })
}

// テーブルの検索とフィルタリング
const filteredTables = tables.filter((table) => {
  const matchesSearch =
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.description.toLowerCase().includes(searchQuery.toLowerCase())
  const matchesStatus = statusFilter === "all" || table.status === statusFilter

  return matchesSearch && matchesStatus
})

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

  toast({
    title: "カラム追加",
    description: `カラム「${newColumnName}」を追加しました。`,
    variant: "default",
  })
}

// カラム編集処理
const handleEditColumn = () => {
  if (!editingColumn) return

  if (!newColumnName.trim()) {
    toast({
      title: "入力エラー",
      description: "カラム名は必須です。",
      variant: "destructive",
    })
    return
  }

  const updatedColumns = columns.map((col) =>
    col.id === editingColumn.id
      ? {
          ...col,
          name: newColumnName,
          type: newColumnType,
          mode: newColumnMode,
          description: newColumnDescription,
        }
      : col,
  )

  setColumns(updatedColumns)
  setEditingColumn(null)
  setShowColumnForm(false)

  // フォームをリセット
  setNewColumnName("")
  setNewColumnType("STRING")
  setNewColumnMode("NULLABLE")
  setNewColumnDescription("")

  toast({
    title: "カラム更新",
    description: `カラム「${newColumnName}」を更新しました。`,
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

// カラム編集モード開始
const startEditColumn = (column: Column) => {
  setEditingColumn(column)
  setNewColumnName(column.name)
  setNewColumnType(column.type)
  setNewColumnMode(column.mode)
  setNewColumnDescription(column.description)
  setShowColumnForm(true)
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
    // APIを呼び出してテーブル作成
    const response = await fetch("/api/database/bigquery/tables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        datasetId,
        tableName,
        description: tableDescription,
        columns,
        partitioningType,
        partitioningField,
        partitioningTimeUnit,
        expirationDays,
        requirePartitionFilter,
      }),
    })

    // レスポンスのステータスコードを確認
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`サーバーエラー (${response.status}): ${errorText.substring(0, 100)}...`)
    }

    // レスポンスのContent-Typeを確認
    const contentType = response.headers.get("Content-Type")
    if (!contentType || !contentType.includes("application/json")) {
      const textData = await response.text()
      throw new Error(`無効なレスポンス形式: ${textData.substring(0, 100)}...`)
    }

    const data = await response.json()

    if (data.success) {
      // テーブル一覧に追加
      if (data.table) {
        setTables([...tables, data.table])
      } else {
        // テーブル一覧を再取得
        fetchTables(projectId, datasetId)
      }

      setIsCreateTableDialogOpen(false)

      // フォームをリセット
      setTableName("")
      setTableDescription("")
      setColumns([
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
      setPartitioningType("none")
      setPartitioningField("")
      setPartitioningTimeUnit("DAY")
      setExpirationDays("")
      setRequirePartitionFilter(false)

      toast({
        title: "テーブル作成成功",
        description: data.message || `テーブル「${tableName}」が正常に作成されました。`,
        variant: "default",
      })
    } else {
      toast({
        title: "テーブル作成エラー",
        description: data.message || "テーブルの作成に失敗しました。",
        variant: "destructive",
      })
    }
  } catch (error: any) {
    console.error("テーブル作成エラー:", error)
    toast({
      title: "エラー",
      description: error.message || "テーブルの作成に失敗しました。ネットワークエラーが発生しました。",
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
  }
}

// テーブル削除処理
const handleDeleteTable = async (table: TableData) => {
  try {
    // APIを呼び出してテーブル削除
    const response = await fetch(
      `/api/database/bigquery/tables/${table.name}?projectId=${projectId}&datasetId=${datasetId}`,
      {
        method: "DELETE",
      },
    )

    const data = await response.json()

    if (data.success) {
      // テーブル一覧から削除
      setTables(tables.filter((t) => t.id !== table.id))

      toast({
        title: "テーブル削除成功",
        description: data.message || `テーブル「${table.name}」が正常に削除されました。`,
        variant: "default",
      })
    } else {
      toast({
        title: "テーブル削除エラー",
        description: data.message || "テーブルの削除に失敗しました。",
        variant: "destructive",
      })
    }
  } catch (error) {
    console.error("テーブル削除エラー:", error)
    toast({
      title: "エラー",
      description: "テーブルの削除に失敗しました。ネットワークエラーが発生しました。",
      variant: "destructive",
    })
  }
}

// カラム管理ダイアログを開く
const openColumnManagementDialog = (table: TableData) => {
  setSelectedTable(table)
  setIsColumnManagementDialogOpen(true)
}

// SQLクエリ実行
const executeQuery = async () => {
  if (!sqlQuery.trim()) return

  setIsQueryRunning(true)
  setQueryResult(null)

  try {
    // APIを呼び出してクエリ実行
    const response = await fetch("/api/database/bigquery/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        datasetId,
        query: sqlQuery,
      }),
    })

    // レスポンスのステータスコードを確認
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`サーバーエラー (${response.status}): ${errorText.substring(0, 100)}...`)
    }

    // レスポンスのContent-Typeを確認
    const contentType = response.headers.get("Content-Type")
    if (!contentType || !contentType.includes("application/json")) {
      const textData = await response.text()
      throw new Error(`無効なレスポンス形式: ${textData.substring(0, 100)}...`)
    }

    const data = await response.json()

    if (data.success) {
      setQueryResult(data.results)

      toast({
        title: "クエリ実行完了",
        description: `${data.totalRows}件のデータを取得しました。実行時間: ${data.executionTime.toFixed(2)}秒`,
        variant: "default",
      })
    } else {
      toast({
        title: "クエリエラー",
        description: data.message || "クエリの実行に失敗しました。",
        variant: "destructive",
      })
      setQueryResult([])
    }
  } catch (error: any) {
    console.error("クエリ実行エラー:", error)
    toast({
      title: "クエリエラー",
      description: error.message || "クエリの実行中にエラーが発生しました。",
      variant: "destructive",
    })
    setQueryResult([])
  } finally {
    setIsQueryRunning(false)
  }
}

return (
  <div className="space-y-6 p-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">BigQueryデータベース管理</h1>
        <p className="text-muted-foreground">接続設定、テーブル管理、SQLクエリを一元的に行います。</p>
      </div>
    </div>
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
        <AlertDescription>BigQueryに接続されていません。接続設定を行ってください。</AlertDescription>
      </Alert>
    )}
    {connectionStatus === "connected" && (
      <Alert variant="default" className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle>接続済み</AlertTitle>
        <AlertDescription>
          BigQuery ({projectId}.{datasetId}) に正常に接続されています。
        </AlertDescription>
      </Alert>
    )}
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="connection">接続設定</TabsTrigger>
        <TabsTrigger value="tables">テーブル管理</TabsTrigger>
        <TabsTrigger value="query">SQLクエリ</TabsTrigger>
      </TabsList>
      {/* 接続設定タブ */}
      <TabsContent value="connection" className="space-y-6">
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
                  <Input
                    id="keyFile"
                    type="file"
                    onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                    accept="application/json"
                  />
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
      </TabsContent>
      {/* テーブル管理タブ */}
      <TabsContent value="tables" className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="テーブルを検索..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">アクティブ</SelectItem>
                <SelectItem value="inactive">非アクティブ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchTables(projectId, datasetId)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              更新
            </Button>
            <Button onClick={() => setIsCreateTableDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新規テーブル作成
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isTableLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : connectionStatus !== "connected" ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Database className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="text-lg font-medium">BigQueryに接続されていません</h3>
                  <p className="text-sm text-muted-foreground">
                    テーブル管理を行うには、まず「接続設定」タブからBigQueryに接続してください。
                  </p>
                </div>
              </div>
            ) : tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Database className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="text-lg font-medium">テーブルがありません</h3>
                  <p className="text-sm text-muted-foreground">
                    「新規テーブル作成」ボタンからテーブルを作成してください。
                  </p>
                </div>
                <Button onClick={() => setIsCreateTableDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新規テーブル作成
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center">
                        テーブル名
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead className="text-center">カラム数</TableHead>
                    <TableHead className="text-center">レコード数</TableHead>
                    <TableHead className="text-center">ステータス</TableHead>
                    <TableHead className="text-center">作成日</TableHead>
                    <TableHead className="text-center">更新日</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <TableIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {table.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{table.description}</TableCell>
                      <TableCell className="text-center">{table.columnCount}</TableCell>
                      <TableCell className="text-center">{table.rowCount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={table.status === "active" ? "default" : "secondary"}>
                          {table.status === "active" ? "アクティブ" : "非アクティブ"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{table.createdAt}</TableCell>
                      <TableCell className="text-center">{table.updatedAt}</TableCell>
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
                                <Eye className="mr-2 h-4 w-4" />
                                <span>詳細</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openColumnManagementDialog(table)}>
                              <Database className="mr-2 h-4 w-4" />
                              <span>カラム管理</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>編集</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              <span>複製</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>SQLを表示</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteTable(table)}>
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
      </TabsContent>
      ;
      <TabsContent value="query" className="space-y-6">
        {connectionStatus !== "connected" ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Database className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">BigQueryに接続されていません</h3>
              <p className="text-sm text-muted-foreground">
                SQLクエリを実行するには、まず「接続設定」タブからBigQueryに接続してください。
              </p>
            </div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>SQLクエリエディタ</CardTitle>
                <CardDescription>SQLクエリを実行して結果を確認できます。</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t p-4">
                  <textarea
                    className="w-full h-[150px] p-4 font-mono text-sm bg-muted/20 border rounded-md"
                    placeholder={`-- 例: SELECT * FROM \`${projectId}.${datasetId}.テーブル名\` LIMIT 10;`}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                  ></textarea>
                </div>
                <div className="p-4 flex justify-end">
                  <Button onClick={executeQuery} disabled={!sqlQuery.trim() || isQueryRunning}>
                    {isQueryRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        実行中...
                      </>
                    ) : (
                      "実行"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>クエリ結果</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isQueryRunning ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-16 w-16 text-muted-foreground mb-4 animate-spin" />
                      <p className="text-muted-foreground">クエリを実行中...</p>
                    </div>
                  </div>
                ) : queryResult ? (
                  queryResult.length > 0 ? (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(queryResult[0] || {}).map((key) => (
                              <TableHead key={key}>{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queryResult.map((row, i) => (
                            <TableRow key={i}>
                              {Object.values(row).map((value, j) => (
                                <TableCell key={j}>{String(value)}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <Info className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">クエリは正常に実行されましたが、結果はありません。</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">クエリを実行すると結果がここに表示されます</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>
    </Tabs>
    ;
    <Dialog open={isCreateTableDialogOpen} onOpenChange={setIsCreateTableDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規テーブル作成</DialogTitle>
          <DialogDescription>BigQueryに新しいテーブルを作成します。必要な情報を入力してください。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateTable} className="space-y-6 py-4">
          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">基本情報</h3>
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
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => startEditColumn(column)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveColumn(column.id)}
                            disabled={columns.length <= 1}
                          >
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
                カラムがありません。「カラム追加」ボタンからカラムを追加してください。
              </div>
            )}

            {/* カラム追加/編集フォーム */}
            {showColumnForm && (
              <div className="mt-4 border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{editingColumn ? "カラム編集" : "新規カラム追加"}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowColumnForm(false)
                      setEditingColumn(null)
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
                  <Button type="button" onClick={editingColumn ? handleEditColumn : handleAddColumn}>
                    {editingColumn ? "更新" : "追加"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* パーティショニング設定 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">パーティショニング設定（オプション）</h3>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateTableDialogOpen(false)}>
              キャンセル
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    ;
    <Dialog open={isColumnManagementDialogOpen} onOpenChange={setIsColumnManagementDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedTable?.name} - カラム管理</DialogTitle>
          <DialogDescription>テーブルのカラムを管理します。</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">カラム一覧</h3>
            <Button onClick={() => setShowColumnForm(true)}>
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
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => startEditColumn(column)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveColumn(column.id)}
                          disabled={columns.length <= 1}
                        >
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
              カラムがありません。「カラム追加」ボタンからカラムを追加してください。
            </div>
          )}

          {/* カラム追加/編集フォーム */}
          {showColumnForm && (
            <div className="mt-4 border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{editingColumn ? "カラム編集" : "新規カラム追加"}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowColumnForm(false)
                    setEditingColumn(null)
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
                    </SelectContent\
