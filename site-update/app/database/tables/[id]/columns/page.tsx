"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Edit, MoreHorizontal, Plus, Search, Trash2, ArrowUpDown, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// サンプルテーブル情報
const tableInfo = {
  id: "table-1",
  name: "users",
  description: "ユーザー情報を管理するテーブル",
  columnCount: 8,
  rowCount: 1250,
  createdAt: "2023-01-15",
  updatedAt: "2023-06-22",
  status: "active",
}

// サンプルカラム情報
const columns = [
  {
    id: "col-1",
    name: "id",
    type: "uuid",
    nullable: false,
    default: "gen_random_uuid()",
    isPrimaryKey: true,
    description: "ユーザーの一意識別子",
    order: 1,
  },
  {
    id: "col-2",
    name: "email",
    type: "varchar(255)",
    nullable: false,
    default: null,
    isPrimaryKey: false,
    description: "ユーザーのメールアドレス",
    order: 2,
  },
  {
    id: "col-3",
    name: "password_hash",
    type: "varchar(255)",
    nullable: false,
    default: null,
    isPrimaryKey: false,
    description: "ハッシュ化されたパスワード",
    order: 3,
  },
  {
    id: "col-4",
    name: "first_name",
    type: "varchar(100)",
    nullable: true,
    default: null,
    isPrimaryKey: false,
    description: "ユーザーの名",
    order: 4,
  },
  {
    id: "col-5",
    name: "last_name",
    type: "varchar(100)",
    nullable: true,
    default: null,
    isPrimaryKey: false,
    description: "ユーザーの姓",
    order: 5,
  },
  {
    id: "col-6",
    name: "role_id",
    type: "uuid",
    nullable: true,
    default: null,
    isPrimaryKey: false,
    description: "ユーザーのロールID",
    order: 6,
  },
  {
    id: "col-7",
    name: "created_at",
    type: "timestamp with time zone",
    nullable: false,
    default: "now()",
    isPrimaryKey: false,
    description: "レコード作成日時",
    order: 7,
  },
  {
    id: "col-8",
    name: "updated_at",
    type: "timestamp with time zone",
    nullable: false,
    default: "now()",
    isPrimaryKey: false,
    description: "レコード更新日時",
    order: 8,
  },
]

// データ型オプション
const dataTypes = [
  { value: "uuid", label: "UUID" },
  { value: "varchar", label: "VARCHAR" },
  { value: "text", label: "TEXT" },
  { value: "integer", label: "INTEGER" },
  { value: "bigint", label: "BIGINT" },
  { value: "decimal", label: "DECIMAL" },
  { value: "boolean", label: "BOOLEAN" },
  { value: "date", label: "DATE" },
  { value: "time", label: "TIME" },
  { value: "timestamp", label: "TIMESTAMP" },
  { value: "timestamp with time zone", label: "TIMESTAMP WITH TIME ZONE" },
  { value: "json", label: "JSON" },
  { value: "jsonb", label: "JSONB" },
  { value: "array", label: "ARRAY" },
]

// カラム作成・編集ダイアログ
function ColumnDialog({
  isOpen,
  onClose,
  column = null,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  column?: any
  onSave: (column: any) => void
}) {
  const isEditing = !!column
  const [name, setName] = useState(column?.name || "")
  const [type, setType] = useState(column?.type || "")
  const [nullable, setNullable] = useState(column?.nullable ?? false)
  const [defaultValue, setDefaultValue] = useState(column?.default || "")
  const [isPrimaryKey, setIsPrimaryKey] = useState(column?.isPrimaryKey ?? false)
  const [description, setDescription] = useState(column?.description || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newColumn = {
      id: column?.id || `col-${Date.now()}`,
      name,
      type,
      nullable,
      default: defaultValue || null,
      isPrimaryKey,
      description,
      order: column?.order || columns.length + 1,
    }
    onSave(newColumn)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "カラムを編集" : "新規カラム作成"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "カラムの詳細を編集します。" : "新しいカラムを作成します。必要な情報を入力してください。"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                カラム名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="例: first_name, email など"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                データ型 <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 flex gap-2">
                <Select value={type.split("(")[0]} onValueChange={(value) => setType(value)} required>
                  <SelectTrigger id="type" className="flex-1">
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
                {(type.startsWith("varchar") ||
                  type.startsWith("char") ||
                  type.startsWith("numeric") ||
                  type.startsWith("decimal")) && (
                  <Input
                    placeholder="サイズ"
                    className="w-24"
                    value={type.match(/$$([^)]+)$$/)?.at(1) || ""}
                    onChange={(e) => setType(`${type.split("(")[0]}(${e.target.value})`)}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="default" className="text-right">
                デフォルト値
              </Label>
              <Input
                id="default"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                className="col-span-3"
                placeholder="例: now(), 0, 'デフォルト値' など"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label>制約</Label>
              </div>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="nullable" checked={nullable} onCheckedChange={(checked) => setNullable(!!checked)} />
                  <Label htmlFor="nullable">NULL許可</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="primaryKey"
                    checked={isPrimaryKey}
                    onCheckedChange={(checked) => setIsPrimaryKey(!!checked)}
                  />
                  <Label htmlFor="primaryKey">プライマリキー</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                説明
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="このカラムの用途や保存するデータについて説明"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!name || !type}>
              {isEditing ? "更新" : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// 削除確認ダイアログ
function DeleteConfirmDialog({
  isOpen,
  onClose,
  columnName,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  columnName: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>カラムを削除</DialogTitle>
          <DialogDescription>
            カラム「{columnName}」を削除してもよろしいですか？この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            このカラムを削除すると、関連するデータもすべて削除されます。この操作は取り消せません。
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ColumnsPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<any>(null)
  const [selectedColumn, setSelectedColumn] = useState<any>(null)
  const [columnsList, setColumnsList] = useState(columns)

  // 検索フィルタリング
  const filteredColumns = columnsList.filter((column) => {
    return (
      column.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      column.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // カラム作成・編集
  const handleOpenColumnDialog = (column = null) => {
    setEditingColumn(column)
    setColumnDialogOpen(true)
  }

  const handleSaveColumn = (column: any) => {
    if (editingColumn) {
      // 編集
      setColumnsList(columnsList.map((c) => (c.id === column.id ? column : c)))
    } else {
      // 新規作成
      setColumnsList([...columnsList, column])
    }
  }

  // カラム削除
  const handleDelete = (column: any) => {
    setSelectedColumn(column)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedColumn) return
    setColumnsList(columnsList.filter((c) => c.id !== selectedColumn.id))
    setDeleteDialogOpen(false)
    setSelectedColumn(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/database/tables/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{tableInfo.name} - カラム管理</h1>
      </div>

      <p className="text-muted-foreground">{tableInfo.description}</p>

      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="カラムを検索..."
            className="w-[250px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            更新
          </Button>
          <Button size="sm" onClick={() => handleOpenColumnDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            カラム追加
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>カラム一覧</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <div className="flex items-center">
                    #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[200px]">カラム名</TableHead>
                <TableHead>データ型</TableHead>
                <TableHead className="text-center">NULL許可</TableHead>
                <TableHead>デフォルト値</TableHead>
                <TableHead>説明</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColumns.map((column) => (
                <TableRow key={column.id}>
                  <TableCell>{column.order}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {column.name}
                      {column.isPrimaryKey && (
                        <Badge variant="outline" className="ml-2">
                          PK
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{column.type}</TableCell>
                  <TableCell className="text-center">{column.nullable ? "YES" : "NO"}</TableCell>
                  <TableCell>
                    {column.default !== null ? (
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">{column.default}</code>
                    ) : (
                      <span className="text-muted-foreground">NULL</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{column.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenColumnDialog(column)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>編集</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(column)}>
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
        </CardContent>
      </Card>

      {/* ダイアログ */}
      <ColumnDialog
        isOpen={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        column={editingColumn}
        onSave={handleSaveColumn}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        columnName={selectedColumn?.name || ""}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
