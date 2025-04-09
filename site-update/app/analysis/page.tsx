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
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Calendar,
  Download,
  FileText,
  Tag,
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

// サンプル分析タグデータ
const sampleAnalysisTags = [
  {
    id: "analysis-1",
    date: "2023-07-15",
    accountId: "acc-123",
    projectId: "cl00001_pr00001",
    campaignId: "cl00001_pr00001_ca00001",
    adsetId: "cl00001_pr00001_ca00001_as00001",
    adId: "cl00001_pr00001_ca00001_as00001_ad00001",
    creativeItemId: "cr-1",
    appealTarget: "20-30代女性",
    emphasisTheme: "夏季セール",
    appealContent: "価格訴求",
    designStructure: "シンプル画像+テキスト",
    targetDate: "2023-07-01",
    goalEvent: "購入",
    goalValue: 15000,
    performance: {
      impressions: 125000,
      clicks: 4200,
      ctr: 3.36,
      conversions: 85,
      conversionRate: 2.02,
      costPerConversion: 588,
    },
    createdAt: "2023-07-15",
    updatedAt: "2023-07-15",
  },
  {
    id: "analysis-2",
    date: "2023-07-15",
    accountId: "acc-123",
    projectId: "cl00001_pr00001",
    campaignId: "cl00001_pr00001_ca00001",
    adsetId: "cl00001_pr00001_ca00001_as00002",
    adId: "cl00001_pr00001_ca00001_as00002_ad00001",
    creativeItemId: "cr-2",
    appealTarget: "30-40代女性",
    emphasisTheme: "夏季セール",
    appealContent: "商品特徴訴求",
    designStructure: "モデル画像+テキスト",
    targetDate: "2023-07-01",
    goalEvent: "購入",
    goalValue: 15000,
    performance: {
      impressions: 98000,
      clicks: 3100,
      ctr: 3.16,
      conversions: 62,
      conversionRate: 2.0,
      costPerConversion: 645,
    },
    createdAt: "2023-07-15",
    updatedAt: "2023-07-15",
  },
  {
    id: "analysis-3",
    date: "2023-07-15",
    accountId: "acc-456",
    projectId: "cl00001_pr00001",
    campaignId: "cl00001_pr00001_ca00002",
    adsetId: "cl00001_pr00001_ca00002_as00001",
    adId: "cl00001_pr00001_ca00002_as00001_ad00001",
    creativeItemId: "cr-3",
    appealTarget: "20-40代男性",
    emphasisTheme: "新商品",
    appealContent: "機能訴求",
    designStructure: "カルーセル",
    targetDate: "2023-07-01",
    goalEvent: "資料請求",
    goalValue: 500,
    performance: {
      impressions: 75000,
      clicks: 2800,
      ctr: 3.73,
      conversions: 120,
      conversionRate: 4.29,
      costPerConversion: 292,
    },
    createdAt: "2023-07-15",
    updatedAt: "2023-07-15",
  },
  {
    id: "analysis-4",
    date: "2023-07-15",
    accountId: "acc-456",
    projectId: "cl00001_pr00001",
    campaignId: "cl00001_pr00001_ca00003",
    adsetId: "cl00001_pr00001_ca00003_as00001",
    adId: "cl00001_pr00001_ca00003_as00001_ad00001",
    creativeItemId: "cr-4",
    appealTarget: "全年齢層",
    emphasisTheme: "ブランド認知",
    appealContent: "ブランドストーリー",
    designStructure: "動画",
    targetDate: "2023-07-01",
    goalEvent: "動画視聴",
    goalValue: 10000,
    performance: {
      impressions: 150000,
      clicks: 4500,
      ctr: 3.0,
      conversions: 8500,
      conversionRate: 5.67,
      costPerConversion: 35,
    },
    createdAt: "2023-07-15",
    updatedAt: "2023-07-15",
  },
  {
    id: "analysis-5",
    date: "2023-07-15",
    accountId: "acc-789",
    projectId: "cl00001_pr00001",
    campaignId: "cl00001_pr00001_ca00004",
    adsetId: "cl00001_pr00001_ca00004_as00001",
    adId: "cl00001_pr00001_ca00004_as00001_ad00001",
    creativeItemId: "cr-5",
    appealTarget: "過去サイト訪問者",
    emphasisTheme: "リマインダー",
    appealContent: "特典訴求",
    designStructure: "シンプル画像+テキスト",
    targetDate: "2023-07-01",
    goalEvent: "購入",
    goalValue: 20000,
    performance: {
      impressions: 45000,
      clicks: 2200,
      ctr: 4.89,
      conversions: 110,
      conversionRate: 5.0,
      costPerConversion: 273,
    },
    createdAt: "2023-07-15",
    updatedAt: "2023-07-15",
  },
]

// 分析タグ作成・編集ダイアログ
function AnalysisTagDialog({
  isOpen,
  onClose,
  analysisTag = null,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  analysisTag?: any
  onSave: (analysisTag: any) => void
}) {
  const isEditing = !!analysisTag
  const [appealTarget, setAppealTarget] = useState(analysisTag?.appealTarget || "")
  const [emphasisTheme, setEmphasisTheme] = useState(analysisTag?.emphasisTheme || "")
  const [appealContent, setAppealContent] = useState(analysisTag?.appealContent || "")
  const [designStructure, setDesignStructure] = useState(analysisTag?.designStructure || "")
  const [targetDate, setTargetDate] = useState(analysisTag?.targetDate || "")
  const [goalEvent, setGoalEvent] = useState(analysisTag?.goalEvent || "")
  const [goalValue, setGoalValue] = useState(analysisTag?.goalValue?.toString() || "")

  const handleSave = () => {
    const newAnalysisTag = {
      id: analysisTag?.id || `analysis-${Date.now()}`,
      date: analysisTag?.date || new Date().toISOString().split("T")[0],
      accountId: analysisTag?.accountId || "acc-123",
      projectId: analysisTag?.projectId || "cl00001_pr00001",
      campaignId: analysisTag?.campaignId || "cl00001_pr00001_ca00001",
      adsetId: analysisTag?.adsetId || "cl00001_pr00001_ca00001_as00001",
      adId: analysisTag?.adId || "cl00001_pr00001_ca00001_as00001_ad00001",
      creativeItemId: analysisTag?.creativeItemId || "cr-1",
      appealTarget,
      emphasisTheme,
      appealContent,
      designStructure,
      targetDate,
      goalEvent,
      goalValue: Number.parseFloat(goalValue),
      performance: analysisTag?.performance || {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        conversionRate: 0,
        costPerConversion: 0,
      },
      createdAt: analysisTag?.createdAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    onSave(newAnalysisTag)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "分析タグを編集" : "新規分析タグ作成"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "分析タグの詳細を編集します。" : "新しい分析タグを作成します。必要な情報を入力してください。"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appealTarget">
                訴求対象者 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="appealTarget"
                value={appealTarget}
                onChange={(e) => setAppealTarget(e.target.value)}
                placeholder="例: 20-30代女性"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emphasisTheme">
                強調テーマ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emphasisTheme"
                value={emphasisTheme}
                onChange={(e) => setEmphasisTheme(e.target.value)}
                placeholder="例: 夏季セール"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appealContent">訴求内容</Label>
              <Select value={appealContent} onValueChange={setAppealContent}>
                <SelectTrigger id="appealContent">
                  <SelectValue placeholder="訴求内容を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="価格訴求">価格訴求</SelectItem>
                  <SelectItem value="商品特徴訴求">商品特徴訴求</SelectItem>
                  <SelectItem value="機能訴求">機能訴求</SelectItem>
                  <SelectItem value="ブランドストーリー">ブランドストーリー</SelectItem>
                  <SelectItem value="特典訴求">特典訴求</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designStructure">デザイン構成</Label>
              <Select value={designStructure} onValueChange={setDesignStructure}>
                <SelectTrigger id="designStructure">
                  <SelectValue placeholder="デザイン構成を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="シンプル画像+テキスト">シンプル画像+テキスト</SelectItem>
                  <SelectItem value="モデル画像+テキスト">モデル画像+テキスト</SelectItem>
                  <SelectItem value="カルーセル">カルーセル</SelectItem>
                  <SelectItem value="動画">動画</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetDate">対象日付</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetDate"
                  type="date"
                  className="pl-8"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalEvent">目標イベント</Label>
              <Select value={goalEvent} onValueChange={setGoalEvent}>
                <SelectTrigger id="goalEvent">
                  <SelectValue placeholder="目標イベントを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="購入">購入</SelectItem>
                  <SelectItem value="資料請求">資料請求</SelectItem>
                  <SelectItem value="会員登録">会員登録</SelectItem>
                  <SelectItem value="問い合わせ">問い合わせ</SelectItem>
                  <SelectItem value="動画視聴">動画視聴</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalValue">目標値</Label>
              <Input
                id="goalValue"
                type="number"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                placeholder="例: 10000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>関連クリエイティブ</Label>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">クリエイティブを選択</p>
                    <p className="text-sm text-muted-foreground">分析対象のクリエイティブを選択してください。</p>
                  </div>
                  <Button variant="outline">選択</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!appealTarget || !emphasisTheme}>
            {isEditing ? "更新" : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 分析タグ詳細ダイアログ
function AnalysisTagDetailDialog({
  isOpen,
  onClose,
  analysisTag,
  onEdit,
}: {
  isOpen: boolean
  onClose: () => void
  analysisTag: any
  onEdit: () => void
}) {
  if (!analysisTag) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>分析タグ詳細</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{analysisTag.emphasisTheme}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{analysisTag.appealTarget}</Badge>
                <Badge variant="outline">{analysisTag.appealContent}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">分析日: {analysisTag.date}</p>
              <p className="text-sm text-muted-foreground">対象日: {analysisTag.targetDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">訴求対象者</Label>
                    <p className="text-sm font-medium">{analysisTag.appealTarget}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">強調テーマ</Label>
                    <p className="text-sm font-medium">{analysisTag.emphasisTheme}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">訴求内容</Label>
                    <p className="text-sm font-medium">{analysisTag.appealContent}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">デザイン構成</Label>
                    <p className="text-sm font-medium">{analysisTag.designStructure}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">目標</Label>
                  <p className="text-sm font-medium">
                    {analysisTag.goalEvent}: {analysisTag.goalValue.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">パフォーマンス</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">インプレッション</Label>
                    <p className="text-sm font-medium">{analysisTag.performance.impressions.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">クリック数</Label>
                    <p className="text-sm font-medium">{analysisTag.performance.clicks.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">CTR</Label>
                    <p className="text-sm font-medium">{analysisTag.performance.ctr}%</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">コンバージョン数</Label>
                    <p className="text-sm font-medium">{analysisTag.performance.conversions.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">コンバージョン率</Label>
                    <p className="text-sm font-medium">{analysisTag.performance.conversionRate}%</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">CPA</Label>
                    <p className="text-sm font-medium">¥{analysisTag.performance.costPerConversion.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">関連情報</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">プロジェクトID</Label>
                <p className="text-sm font-mono">{analysisTag.projectId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">キャンペーンID</Label>
                <p className="text-sm font-mono">{analysisTag.campaignId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">広告セットID</Label>
                <p className="text-sm font-mono">{analysisTag.adsetId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">広告ID</Label>
                <p className="text-sm font-mono">{analysisTag.adId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">クリエイティブID</Label>
                <p className="text-sm font-mono">{analysisTag.creativeItemId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">アカウントID</Label>
                <p className="text-sm font-mono">{analysisTag.accountId}</p>
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
  tagName,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  tagName: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>分析タグを削除</DialogTitle>
          <DialogDescription>{tagName}を削除してもよろしいですか？この操作は元に戻せません。</DialogDescription>
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

export default function AnalysisPage() {
  // 状態管理
  const [analysisTags, setAnalysisTags] = useState(sampleAnalysisTags)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [contentFilter, setContentFilter] = useState("all")

  // ダイアログの状態
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [selectedTag, setSelectedTag] = useState<any>(null)

  // 分析タグ作成・編集
  const handleOpenTagDialog = (tag = null) => {
    setEditingTag(tag)
    setTagDialogOpen(true)
  }

  const handleSaveTag = (tag: any) => {
    if (editingTag) {
      // 編集
      setAnalysisTags(analysisTags.map((t) => (t.id === tag.id ? tag : t)))
    } else {
      // 新規作成
      setAnalysisTags([...analysisTags, tag])
    }
  }

  // 分析タグ詳細表示
  const handleOpenDetailDialog = (tag: any) => {
    setSelectedTag(tag)
    setDetailDialogOpen(true)
  }

  // 分析タグ削除
  const handleDelete = (tag: any) => {
    setSelectedTag(tag)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedTag) return
    setAnalysisTags(analysisTags.filter((t) => t.id !== selectedTag.id))
    setDeleteDialogOpen(false)
    setSelectedTag(null)
  }

  // 検索とフィルタリング
  const filteredTags = analysisTags.filter((tag) => {
    const matchesSearch =
      tag.emphasisTheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.appealTarget.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesContent = contentFilter === "all" || tag.appealContent === contentFilter

    return matchesSearch && matchesContent
  })

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">分析タグ管理</h1>
          <p className="text-muted-foreground">クリエイティブの検証結果と分析タグを管理します。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            フィルター
          </Button>
          <Button onClick={() => handleOpenTagDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新規分析タグ
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

      <Tabs defaultValue="table">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="table">テーブル表示</TabsTrigger>
            <TabsTrigger value="chart">チャート表示</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="検索..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={contentFilter} onValueChange={setContentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="訴求内容" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="価格訴求">価格訴求</SelectItem>
                <SelectItem value="商品特徴訴求">商品特徴訴求</SelectItem>
                <SelectItem value="機能訴求">機能訴求</SelectItem>
                <SelectItem value="ブランドストーリー">ブランドストーリー</SelectItem>
                <SelectItem value="特典訴求">特典訴求</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* テーブル表示タブ */}
        <TabsContent value="table" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">分析タグ一覧</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  エクスポート
                </Button>
                <Button onClick={() => handleOpenTagDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  新規分析タグ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>強調テーマ</TableHead>
                    <TableHead>訴求対象者</TableHead>
                    <TableHead>訴求内容</TableHead>
                    <TableHead>デザイン構成</TableHead>
                    <TableHead>目標イベント</TableHead>
                    <TableHead>インプレッション</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>コンバージョン率</TableHead>
                    <TableHead>分析日</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">{tag.emphasisTheme}</TableCell>
                      <TableCell>{tag.appealTarget}</TableCell>
                      <TableCell>{tag.appealContent}</TableCell>
                      <TableCell>{tag.designStructure}</TableCell>
                      <TableCell>{tag.goalEvent}</TableCell>
                      <TableCell>{tag.performance.impressions.toLocaleString()}</TableCell>
                      <TableCell>{tag.performance.ctr}%</TableCell>
                      <TableCell>{tag.performance.conversionRate}%</TableCell>
                      <TableCell>{tag.date}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetailDialog(tag)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              <span>詳細</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenTagDialog(tag)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>編集</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="mr-2 h-4 w-4" />
                              <span>タグ追加</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(tag)}>
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

        {/* チャート表示タブ */}
        <TabsContent value="chart" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>訴求内容別パフォーマンス</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">チャートはここに表示されます</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>デザイン構成別コンバージョン率</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">チャートはここに表示されます</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>訴求対象者別CTR推移</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">チャートはここに表示されます</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>目標達成率</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Target className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">チャートはここに表示されます</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ダイアログ */}
      <AnalysisTagDialog
        isOpen={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        analysisTag={editingTag}
        onSave={handleSaveTag}
      />

      <AnalysisTagDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        analysisTag={selectedTag}
        onEdit={() => {
          setDetailDialogOpen(false)
          handleOpenTagDialog(selectedTag)
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        tagName={selectedTag?.emphasisTheme || ""}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
