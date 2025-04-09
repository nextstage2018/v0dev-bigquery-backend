"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  Image,
  FileText,
  ExternalLink,
  Copy,
  FolderOpen,
  Upload,
  Eye,
  Layers,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// サンプルクリエイティブデータ
const sampleCreatives = [
  {
    id: "cr-1",
    name: "夏季セール_メイン画像01",
    type: "image",
    publicationType: "feed",
    groupId: "grp-1",
    folderId: "cl00001_pr00001_fd00001_ca00001_as00001_ad00001",
    mainImageUrl: "/placeholder.svg?height=200&width=200&text=夏季セール01",
    headingText: "夏の大セール開催中！",
    detailText: "最大50%オフ、期間限定のお得なキャンペーン",
    linkUrl: "https://example.com/summer-sale",
    status: "active",
    createdAt: "2023-05-15",
    updatedAt: "2023-05-15",
  },
  {
    id: "cr-2",
    name: "夏季セール_メイン画像02",
    type: "image",
    publicationType: "feed",
    groupId: "grp-1",
    folderId: "cl00001_pr00001_fd00001_ca00001_as00001_ad00001",
    mainImageUrl: "/placeholder.svg?height=200&width=200&text=夏季セール02",
    headingText: "夏のファッションアイテム",
    detailText: "トレンドアイテムが勢揃い、今すぐチェック",
    linkUrl: "https://example.com/summer-fashion",
    status: "active",
    createdAt: "2023-05-15",
    updatedAt: "2023-05-15",
  },
  {
    id: "cr-3",
    name: "新商品_カルーセル01",
    type: "carousel",
    publicationType: "feed",
    groupId: "grp-2",
    folderId: "cl00001_pr00001_fd00001_ca00002_as00001_ad00001",
    mainImageUrl: "/placeholder.svg?height=200&width=200&text=新商品01",
    headingText: "新商品のご紹介",
    detailText: "この夏おすすめの新商品ラインナップ",
    linkUrl: "https://example.com/new-products",
    status: "active",
    createdAt: "2023-06-01",
    updatedAt: "2023-06-01",
  },
  {
    id: "cr-4",
    name: "ブランド認知_動画01",
    type: "video",
    publicationType: "story",
    groupId: "grp-3",
    folderId: "cl00001_pr00001_fd00001_ca00003_as00001_ad00001",
    mainImageUrl: "/placeholder.svg?height=200&width=200&text=ブランド動画",
    headingText: "ブランドストーリー",
    detailText: "私たちのこだわりをご紹介",
    linkUrl: "https://example.com/brand-story",
    status: "pending",
    createdAt: "2023-06-15",
    updatedAt: "2023-06-15",
  },
  {
    id: "cr-5",
    name: "リターゲティング_バナー01",
    type: "image",
    publicationType: "banner",
    groupId: "grp-4",
    folderId: "cl00001_pr00001_fd00001_ca00004_as00001_ad00001",
    mainImageUrl: "/placeholder.svg?height=200&width=200&text=リターゲティング",
    headingText: "あなたにおすすめ",
    detailText: "チェックした商品が今なら10%オフ",
    linkUrl: "https://example.com/recommended",
    status: "active",
    createdAt: "2023-07-01",
    updatedAt: "2023-07-01",
  },
]

// クリエイティブステータスに応じたバッジを返す関数
function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500">有効</Badge>
    case "pending":
      return <Badge className="bg-amber-500">審査中</Badge>
    case "rejected":
      return <Badge className="bg-red-500">却下</Badge>
    case "draft":
      return <Badge variant="outline">下書き</Badge>
    default:
      return <Badge variant="outline">不明</Badge>
  }
}

// クリエイティブタイプに応じたアイコンを返す関数
function getTypeIcon(type: string) {
  switch (type) {
    case "image":
      return <Image className="h-4 w-4" />
    case "video":
      return <FileText className="h-4 w-4" />
    case "carousel":
      return <Layers className="h-4 w-4" />
    default:
      return <Image className="h-4 w-4" />
  }
}

// クリエイティブ作成・編集ダイアログ
function CreativeDialog({
  isOpen,
  onClose,
  creative = null,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  creative?: any
  onSave: (creative: any) => void
}) {
  const isEditing = !!creative
  const [name, setName] = useState(creative?.name || "")
  const [type, setType] = useState(creative?.type || "image")
  const [publicationType, setPublicationType] = useState(creative?.publicationType || "feed")
  const [headingText, setHeadingText] = useState(creative?.headingText || "")
  const [detailText, setDetailText] = useState(creative?.detailText || "")
  const [linkUrl, setLinkUrl] = useState(creative?.linkUrl || "")
  const [status, setStatus] = useState(creative?.status || "draft")

  const handleSave = () => {
    const newCreative = {
      id: creative?.id || `cr-${Date.now()}`,
      name,
      type,
      publicationType,
      groupId: creative?.groupId || "grp-1",
      folderId: creative?.folderId || "cl00001_pr00001_fd00001_ca00001_as00001_ad00001",
      mainImageUrl: creative?.mainImageUrl || "/placeholder.svg?height=200&width=200&text=新規クリエイティブ",
      headingText,
      detailText,
      linkUrl,
      status,
      createdAt: creative?.createdAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    onSave(newCreative)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "クリエイティブを編集" : "新規クリエイティブ作成"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "クリエイティブの詳細を編集します。"
              : "新しいクリエイティブを作成します。必要な情報を入力してください。"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                クリエイティブ名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 夏季セール_メイン画像01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">クリエイティブタイプ</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">画像</SelectItem>
                  <SelectItem value="video">動画</SelectItem>
                  <SelectItem value="carousel">カルーセル</SelectItem>
                  <SelectItem value="collection">コレクション</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publicationType">掲載タイプ</Label>
              <Select value={publicationType} onValueChange={setPublicationType}>
                <SelectTrigger id="publicationType">
                  <SelectValue placeholder="掲載タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">フィード</SelectItem>
                  <SelectItem value="story">ストーリー</SelectItem>
                  <SelectItem value="banner">バナー</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">リンクURL</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="例: https://example.com/landing-page"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headingText">見出しテキスト</Label>
            <Input
              id="headingText"
              value={headingText}
              onChange={(e) => setHeadingText(e.target.value)}
              placeholder="例: 夏の大セール開催中！"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailText">詳細テキスト</Label>
            <Textarea
              id="detailText"
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
              placeholder="例: 最大50%オフ、期間限定のお得なキャンペーン"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>メイン画像/動画</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2 font-medium">クリエイティブをアップロード</p>
              <p className="text-sm text-muted-foreground mb-4">または</p>
              <Button variant="outline" size="sm">
                ファイルを選択
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">推奨サイズ: 1200 x 628px (画像), 16:9 (動画)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>ステータス</Label>
            <RadioGroup value={status} onValueChange={setStatus} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft" className="cursor-pointer">
                  下書き
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="cursor-pointer">
                  有効
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="cursor-pointer">
                  審査中
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            {isEditing ? "更新" : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// クリエイティブ詳細ダイアログ
function CreativeDetailDialog({
  isOpen,
  onClose,
  creative,
  onEdit,
}: {
  isOpen: boolean
  onClose: () => void
  creative: any
  onEdit: () => void
}) {
  if (!creative) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>クリエイティブ詳細</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{creative.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {getTypeIcon(creative.type)}
                  <span className="text-sm text-muted-foreground">
                    {creative.type === "image" ? "画像" : creative.type === "video" ? "動画" : "カルーセル"}
                  </span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {creative.publicationType === "feed"
                    ? "フィード"
                    : creative.publicationType === "story"
                      ? "ストーリー"
                      : "バナー"}
                </span>
              </div>
            </div>
            {getStatusBadge(creative.status)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">プレビュー</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <img
                  src={creative.mainImageUrl || "/placeholder.svg"}
                  alt={creative.name}
                  className="w-full max-w-[300px] h-auto rounded-md object-cover"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">テキスト情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">見出しテキスト</Label>
                  <p className="text-sm font-medium">{creative.headingText}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">詳細テキスト</Label>
                  <p className="text-sm">{creative.detailText}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">リンクURL</Label>
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    <a
                      href={creative.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary"
                    >
                      {creative.linkUrl}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">管理情報</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">フォルダID</Label>
                <p className="text-sm font-mono">{creative.folderId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">グループID</Label>
                <p className="text-sm font-mono">{creative.groupId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">作成日</Label>
                <p className="text-sm">{creative.createdAt}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">更新日</Label>
                <p className="text-sm">{creative.updatedAt}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
          <Button onClick={onEdit}>編集</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 削除確認ダイアログ
function DeleteConfirmDialog({
  isOpen,
  onClose,
  creativeName,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  creativeName: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>クリエイティブを削除</DialogTitle>
          <DialogDescription>{creativeName}を削除してもよろしいですか？この操作は元に戻せません。</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            削除すると、関連するデータもすべて削除されます。この操作は取り消せません。
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CreativePage() {
  // 状態管理
  const [creatives, setCreatives] = useState(sampleCreatives)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  // ダイアログの状態
  const [creativeDialogOpen, setCreativeDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editingCreative, setEditingCreative] = useState<any>(null)
  const [selectedCreative, setSelectedCreative] = useState<any>(null)

  // クリエイティブ作成・編集
  const handleOpenCreativeDialog = (creative = null) => {
    setEditingCreative(creative)
    setCreativeDialogOpen(true)
  }

  const handleSaveCreative = (creative: any) => {
    if (editingCreative) {
      // 編集
      setCreatives(creatives.map((c) => (c.id === creative.id ? creative : c)))
    } else {
      // 新規作成
      setCreatives([...creatives, creative])
    }
  }

  // クリエイティブ詳細表示
  const handleOpenDetailDialog = (creative: any) => {
    setSelectedCreative(creative)
    setDetailDialogOpen(true)
  }

  // クリエイティブ削除
  const handleDelete = (creative: any) => {
    setSelectedCreative(creative)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedCreative) return
    setCreatives(creatives.filter((c) => c.id !== selectedCreative.id))
    setDeleteDialogOpen(false)
    setSelectedCreative(null)
  }

  // 検索とフィルタリング
  const filteredCreatives = creatives.filter((creative) => {
    const matchesSearch = creative.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || creative.type === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">クリエイティブ管理</h1>
          <p className="text-muted-foreground">広告クリエイティブの作成、編集、管理を行います。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            フィルター
          </Button>
          <Button onClick={() => handleOpenCreativeDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新規クリエイティブ
          </Button>
        </div>
      </div>

      {/* 広告アカウント選択セクション */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">広告アカウント</div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="アカウントを検索..." className="pl-8" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
              <div
                className={`flex items-center space-x-2 border rounded-md p-2 cursor-pointer ${
                  selectedAccount === "Google広告" || selectedAccount === null
                    ? "bg-primary/5 border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedAccount(selectedAccount === "Google広告" ? null : "Google広告")}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xs font-bold">G</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Google広告</p>
                  <p className="text-xs text-muted-foreground">ID: 123-456-789</p>
                </div>
                {(selectedAccount === "Google広告" || selectedAccount === null) && <Badge>選択中</Badge>}
              </div>
              <div
                className={`flex items-center space-x-2 border rounded-md p-2 cursor-pointer ${
                  selectedAccount === "Meta広告" ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedAccount(selectedAccount === "Meta広告" ? null : "Meta広告")}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xs font-bold">M</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Meta広告</p>
                  <p className="text-xs text-muted-foreground">ID: 234-567-890</p>
                </div>
                {selectedAccount === "Meta広告" && <Badge>選択中</Badge>}
              </div>
              <div
                className={`flex items-center space-x-2 border rounded-md p-2 cursor-pointer ${
                  selectedAccount === "Twitter広告" ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedAccount(selectedAccount === "Twitter広告" ? null : "Twitter広告")}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-xs font-bold">T</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Twitter広告</p>
                  <p className="text-xs text-muted-foreground">ID: 345-678-901</p>
                </div>
                {selectedAccount === "Twitter広告" && <Badge>選択中</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">グリッド表示</TabsTrigger>
            <TabsTrigger value="list">リスト表示</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="クリエイティブを検索..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="タイプ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="image">画像</SelectItem>
                <SelectItem value="video">動画</SelectItem>
                <SelectItem value="carousel">カルーセル</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* グリッド表示タブ */}
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCreatives.map((creative) => (
              <Card key={creative.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={creative.mainImageUrl || "/placeholder.svg"}
                    alt={creative.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">{getStatusBadge(creative.status)}</div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(creative.type)}
                      <span className="text-xs text-muted-foreground">
                        {creative.type === "image" ? "画像" : creative.type === "video" ? "動画" : "カルーセル"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{creative.publicationType}</span>
                  </div>
                  <h3 className="font-medium truncate" title={creative.name}>
                    {creative.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-1" title={creative.headingText}>
                    {creative.headingText}
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDetailDialog(creative)}>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      詳細
                    </Button>
                    <Button size="sm" onClick={() => handleOpenCreativeDialog(creative)}>
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      編集
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* リスト表示タブ */}
        <TabsContent value="list" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">クリエイティブ一覧</CardTitle>
              <Button onClick={() => handleOpenCreativeDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                新規クリエイティブ
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>プレビュー</TableHead>
                    <TableHead>クリエイティブ名</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead>掲載タイプ</TableHead>
                    <TableHead>見出しテキスト</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>更新日</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCreatives.map((creative) => (
                    <TableRow key={creative.id}>
                      <TableCell>
                        <img
                          src={creative.mainImageUrl || "/placeholder.svg"}
                          alt={creative.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{creative.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(creative.type)}
                          <span>
                            {creative.type === "image" ? "画像" : creative.type === "video" ? "動画" : "カルーセル"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{creative.publicationType}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={creative.headingText}>
                        {creative.headingText}
                      </TableCell>
                      <TableCell>{getStatusBadge(creative.status)}</TableCell>
                      <TableCell>{creative.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetailDialog(creative)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>詳細</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenCreativeDialog(creative)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>編集</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              <span>複製</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FolderOpen className="mr-2 h-4 w-4" />
                              <span>フォルダを開く</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(creative)}>
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
      </Tabs>

      {/* ダイアログ */}
      <CreativeDialog
        isOpen={creativeDialogOpen}
        onClose={() => setCreativeDialogOpen(false)}
        creative={editingCreative}
        onSave={handleSaveCreative}
      />

      <CreativeDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        creative={selectedCreative}
        onEdit={() => {
          setDetailDialogOpen(false)
          handleOpenCreativeDialog(selectedCreative)
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        creativeName={selectedCreative?.name || ""}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
