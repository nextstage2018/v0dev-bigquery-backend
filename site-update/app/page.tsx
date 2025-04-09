"use client"
import BigQueryForm from "@/components/bigquery-form"

export default function BigQueryPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">BigQueryデータベース管理</h1>
          <p className="text-muted-foreground">BigQueryへの接続テストとテーブル作成を行います。</p>
        </div>

        <BigQueryForm />
      </div>
    </div>
  )
}
