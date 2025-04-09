"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Database,
  Edit,
  FileText,
  Key,
  MoreHorizontal,
  Search,
  Settings,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react"
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
  database: "production",
  schema: "public",
  primaryKey: "id",
  indexes: [
    { name: "users_pkey", columns: ["id"], unique: true },
    { name: "users_email_idx", columns: ["email"], unique: true },
    { name: "users_created_at_idx", columns: ["created_at"], unique: false },
  ],
  foreignKeys: [
    { name: "users_role_id_fkey", columns: ["role_id"], referencedTable: "roles", referencedColumns: ["id"] },
  ],
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
  },
  {
    id: "col-2",
    name: "email",
    type: "varchar(255)",
    nullable: false,
    default: null,
    isPrimaryKey: false,
    description: "ユーザーのメールアドレス",
  },
  {
    id: "col-3",
    name: "password_hash",
    type: "varchar(255)",
    nullable: false,
    default: null,
    isPrimaryKey: false,
    description: "ハッシュ化されたパスワード",
  },
  {
    id: "col-4",
    name: "first_name",
    type: "varchar(100)",
    nullable: true,
    default: null,
    isPrimaryKey: false,
    description: "ユーザーの名",
  },
  {
    id: "col-5",
    name: "last_name",
    type: "varchar(100)",
    nullable: true,
    default: null,
    isPrimaryKey: false,
    description: "ユーザーの姓",
  },
  {
    id: "col-6",
    name: "role_id",
    type: "uuid",
    nullable: true,
    default: null,
    isPrimaryKey: false,
    description: "ユーザーのロールID",
  },
  {
    id: "col-7",
    name: "created_at",
    type: "timestamp with time zone",
    nullable: false,
    default: "now()",
    isPrimaryKey: false,
    description: "レコード作成日時",
  },
  {
    id: "col-8",
    name: "updated_at",
    type: "timestamp with time zone",
    nullable: false,
    default: "now()",
    isPrimaryKey: false,
    description: "レコード更新日時",
  },
]

// サンプルデータ
const sampleData = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "john.doe@example.com",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    first_name: "John",
    last_name: "Doe",
    role_id: "223e4567-e89b-12d3-a456-426614174001",
    created_at: "2023-01-15T08:30:00Z",
    updated_at: "2023-06-22T14:20:00Z",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    email: "jane.smith@example.com",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    first_name: "Jane",
    last_name: "Smith",
    role_id: "323e4567-e89b-12d3-a456-426614174002",
    created_at: "2023-01-16T10:15:00Z",
    updated_at: "2023-06-20T09:45:00Z",
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    email: "robert.johnson@example.com",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    first_name: "Robert",
    last_name: "Johnson",
    role_id: "223e4567-e89b-12d3-a456-426614174001",
    created_at: "2023-01-18T14:20:00Z",
    updated_at: "2023-06-21T16:30:00Z",
  },
  {
    id: "423e4567-e89b-12d3-a456-426614174003",
    email: "emily.davis@example.com",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    first_name: "Emily",
    last_name: "Davis",
    role_id: "223e4567-e89b-12d3-a456-426614174001",
    created_at: "2023-01-20T09:10:00Z",
    updated_at: "2023-06-19T11:25:00Z",
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174004",
    email: "michael.wilson@example.com",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    first_name: "Michael",
    last_name: "Wilson",
    role_id: "323e4567-e89b-12d3-a456-426614174002",
    created_at: "2023-01-22T16:45:00Z",
    updated_at: "2023-06-18T08:50:00Z",
  },
]

export default function TableDetailPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("")

  // 検索フィルタリング
  const filteredColumns = columns.filter((column) => {
    return (
      column.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      column.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/database">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{tableInfo.name}</h1>
        <Badge variant={tableInfo.status === "active" ? "default" : "secondary"}>
          {tableInfo.status === "active" ? "アクティブ" : "非アクティブ"}
        </Badge>
      </div>

      <p className="text-muted-foreground">{tableInfo.description}</p>

      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[250px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">基本情報</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">データベース:</dt>
              <dd>{tableInfo.database}</dd>
              <dt className="text-muted-foreground">スキーマ:</dt>
              <dd>{tableInfo.schema}</dd>
              <dt className="text-muted-foreground">プライマリキー:</dt>
              <dd>{tableInfo.primaryKey}</dd>
              <dt className="text-muted-foreground">カラム数:</dt>
              <dd>{tableInfo.columnCount}</dd>
              <dt className="text-muted-foreground">レコード数:</dt>
              <dd>{tableInfo.rowCount.toLocaleString()}</dd>
              <dt className="text-muted-foreground">作成日:</dt>
              <dd>{tableInfo.createdAt}</dd>
              <dt className="text-muted-foreground">更新日:</dt>
              <dd>{tableInfo.updatedAt}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[250px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">インデックス</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {tableInfo.indexes.map((index, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Key className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{index.name}</p>
                    <p className="text-muted-foreground">
                      カラム: {index.columns.join(", ")}
                      {index.unique && <span className="ml-2 text-xs">(ユニーク)</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[250px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">外部キー</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {tableInfo.foreignKeys.map((fk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Database className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{fk.name}</p>
                    <p className="text-muted-foreground">
                      {fk.columns.join(", ")} → {fk.referencedTable}({fk.referencedColumns.join(", ")})
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/database/tables/${params.id}/columns`}>カラム管理</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/database/tables/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              テーブル編集
            </Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            SQLを表示
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            詳細設定
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      <Tabs defaultValue="columns">
        <TabsList>
          <TabsTrigger value="columns">カラム</TabsTrigger>
          <TabsTrigger value="data">データ</TabsTrigger>
          <TabsTrigger value="sql">SQL</TabsTrigger>
        </TabsList>

        {/* カラムタブ */}
        <TabsContent value="columns" className="space-y-4">
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
              <Button size="sm" asChild>
                <Link href={`/database/tables/${params.id}/columns/new`}>カラム追加</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
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
                            <DropdownMenuItem asChild>
                              <Link href={`/database/tables/${params.id}/columns/${column.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>編集</span>
                              </Link>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* データタブ */}
        <TabsContent value="data" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="データを検索..." className="w-[250px] pl-8" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                エクスポート
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                更新
              </Button>
              <Button size="sm">データ追加</Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.id}>{column.name}</TableHead>
                    ))}
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.map((row, i) => (
                    <TableRow key={i}>
                      {columns.map((column) => (
                        <TableCell key={column.id} className="max-w-[200px] truncate">
                          {row[column.name as keyof typeof row]?.toString() || ""}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* SQLタブ */}
        <TabsContent value="sql" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>テーブル作成SQL</CardTitle>
              <CardDescription>このテーブルを作成するためのSQL文です。</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {`CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  first_name varchar(100),
  last_name varchar(100),
  role_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);
CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);

ALTER TABLE public.users
ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);

COMMENT ON TABLE public.users IS 'ユーザー情報を管理するテーブル';
COMMENT ON COLUMN public.users.id IS 'ユーザーの一意識別子';
COMMENT ON COLUMN public.users.email IS 'ユーザーのメールアドレス';
COMMENT ON COLUMN public.users.password_hash IS 'ハッシュ化されたパスワード';
COMMENT ON COLUMN public.users.first_name IS 'ユーザーの名';
COMMENT ON COLUMN public.users.last_name IS 'ユーザーの姓';
COMMENT ON COLUMN public.users.role_id IS 'ユーザーのロールID';
COMMENT ON COLUMN public.users.created_at IS 'レコード作成日時';
COMMENT ON COLUMN public.users.updated_at IS 'レコード更新日時';`}
              \
