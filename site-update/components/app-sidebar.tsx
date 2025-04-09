"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Image,
  Link2,
  Settings,
  FileText,
  Megaphone,
  LayoutDashboard,
  Tag,
  PieChart,
  Users,
  Building,
  HelpCircle,
  Layers,
  Target,
  Briefcase,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" className="border-r">
      <SidebarContent className="overflow-auto">
        <SidebarGroup className="mb-2">
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>ダッシュボード</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/company" || pathname.startsWith("/company/")}>
                <Link href="/company">
                  <Building className="h-5 w-5" />
                  <span>企業/案件管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/projects" || pathname.startsWith("/projects/")}>
                <Link href="/projects">
                  <Briefcase className="h-5 w-5" />
                  <span>案件管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mb-2">
          <SidebarGroupLabel>広告管理</SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/campaign" || pathname.startsWith("/campaign/")}>
                <Link href="/campaign">
                  <Megaphone className="h-5 w-5" />
                  <span>キャンペーン管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/adset" || pathname.startsWith("/adset/")}>
                <Link href="/adset">
                  <Target className="h-5 w-5" />
                  <span>広告セット管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/ad" || pathname.startsWith("/ad/")}>
                <Link href="/ad">
                  <FileText className="h-5 w-5" />
                  <span>広告管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/creative" || pathname.startsWith("/creative/")}>
                <Link href="/creative">
                  <Layers className="h-5 w-5" />
                  <span>クリエイティブ管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/utm-generator"}>
                <Link href="/utm-generator">
                  <Link2 className="h-5 w-5" />
                  <span>URL作成</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mb-2">
          <SidebarGroupLabel>分析・レポート</SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/analysis" || pathname.startsWith("/analysis/")}>
                <Link href="/analysis">
                  <Tag className="h-5 w-5" />
                  <span>分析タグ管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/reports"}>
                <Link href="/reports">
                  <BarChart3 className="h-5 w-5" />
                  <span>レポート</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/job" || pathname.startsWith("/job/")}>
                <Link href="/job">
                  <PieChart className="h-5 w-5" />
                  <span>ジョブ管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mb-2">
          <SidebarGroupLabel>システム</SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/operation" || pathname.startsWith("/operation/")}>
                <Link href="/operation">
                  <FileText className="h-5 w-5" />
                  <span>運用ログ管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/media" || pathname.startsWith("/media/")}>
                <Link href="/media">
                  <Image className="h-5 w-5" />
                  <span>メディア管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/drive" || pathname.startsWith("/drive/")}>
                <Link href="/drive">
                  <FileText className="h-5 w-5" />
                  <span>Driveフォルダ管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/user" || pathname.startsWith("/user/")}>
                <Link href="/user">
                  <Users className="h-5 w-5" />
                  <span>ユーザー管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span>設定</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/help">
                <HelpCircle className="h-5 w-5" />
                <span>ヘルプ</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
