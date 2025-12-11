'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  BookOpen,
  RefreshCw,
  ArrowLeft,
  Filter
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ContentFile {
  slug: string
  path: string
  title: string
  category: string
  subcategory?: string
  difficulty?: string
  duration?: number
  published: boolean
  mbtiTypes: string[]
  tags: string[]
  hasErrors: boolean
  errors: string[]
  warnings: string[]
  wordCount: number
  lastModified: string
}

interface ContentStats {
  totalFiles: number
  publishedFiles: number
  draftFiles: number
  filesWithErrors: number
  filesWithWarnings: number
  byCategory: Record<string, number>
  byDifficulty: Record<string, number>
  byMbtiType: Record<string, number>
  averageDuration: number
  averageWordCount: number
  totalWordCount: number
  files: ContentFile[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function ContentDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings' | 'drafts'>('all')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/content-stats')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        if (response.status === 403) {
          setError('Требуются права администратора')
          return
        }
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Ошибка загрузки статистики')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredFiles = () => {
    if (!stats) return []

    switch (filter) {
      case 'errors':
        return stats.files.filter(f => f.hasErrors)
      case 'warnings':
        return stats.files.filter(f => f.warnings.length > 0)
      case 'drafts':
        return stats.files.filter(f => !f.published)
      default:
        return stats.files
    }
  }

  const categoryData = stats
    ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }))
    : []

  const difficultyData = stats
    ? Object.entries(stats.byDifficulty).map(([name, value]) => ({ name, value }))
    : []

  const mbtiData = stats
    ? Object.entries(stats.byMbtiType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : []

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-lg font-medium">{error}</p>
              <Button onClick={() => router.push('/admin')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Quality Dashboard</h1>
          <p className="text-muted-foreground">Мониторинг и валидация контента</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadStats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Админ-панель
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего файлов</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">MDX статей</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Опубликовано</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.publishedFiles}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.publishedFiles / stats.totalFiles) * 100)}% от всех
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Черновики</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.draftFiles}</div>
            <p className="text-xs text-muted-foreground">не опубликовано</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">С ошибками</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.filesWithErrors}</div>
            <p className="text-xs text-muted-foreground">требуют исправления</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">С предупреждениями</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.filesWithWarnings}</div>
            <p className="text-xs text-muted-foreground">рекомендуется проверить</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время чтения</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDuration} мин</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее кол-во слов</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageWordCount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего слов</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWordCount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="files">Файлы ({stats.totalFiles})</TabsTrigger>
          <TabsTrigger value="issues">
            Проблемы ({stats.filesWithErrors + stats.filesWithWarnings})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>По категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>По сложности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* MBTI Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Топ MBTI типов</CardTitle>
                <CardDescription>Статьи с указанным типом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mbtiData} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={50} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Все файлы</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    Все
                  </Button>
                  <Button
                    variant={filter === 'errors' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('errors')}
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Ошибки ({stats.filesWithErrors})
                  </Button>
                  <Button
                    variant={filter === 'warnings' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('warnings')}
                    className={filter === 'warnings' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Предупреждения ({stats.filesWithWarnings})
                  </Button>
                  <Button
                    variant={filter === 'drafts' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('drafts')}
                    className={filter === 'drafts' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  >
                    <BookOpen className="mr-1 h-3 w-3" />
                    Черновики ({stats.draftFiles})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Файл</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Сложность</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Слов</TableHead>
                    <TableHead>Проблемы</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredFiles().map((file) => (
                    <TableRow key={file.path}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{file.title}</p>
                          <p className="text-xs text-muted-foreground">{file.path}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{file.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {file.difficulty && (
                          <Badge
                            variant={
                              file.difficulty === 'beginner' ? 'default' :
                              file.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                            }
                          >
                            {file.difficulty}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {file.published ? (
                          <Badge className="bg-green-500">Опубликовано</Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            Черновик
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{file.wordCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {file.hasErrors && (
                            <Badge variant="destructive" className="text-xs">
                              {file.errors.length} ошибок
                            </Badge>
                          )}
                          {file.warnings.length > 0 && (
                            <Badge className="bg-yellow-500 text-xs">
                              {file.warnings.length} предупр.
                            </Badge>
                          )}
                          {!file.hasErrors && file.warnings.length === 0 && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <div className="space-y-4">
            {/* Errors */}
            {stats.files.filter(f => f.hasErrors).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Ошибки (требуют исправления)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.files.filter(f => f.hasErrors).map((file) => (
                      <div key={file.path} className="border rounded-lg p-4">
                        <p className="font-medium">{file.title}</p>
                        <p className="text-sm text-muted-foreground mb-2">{file.path}</p>
                        <ul className="list-disc list-inside space-y-1">
                          {file.errors.map((err, i) => (
                            <li key={i} className="text-sm text-red-600">{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {stats.files.filter(f => f.warnings.length > 0).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="h-5 w-5" />
                    Предупреждения (рекомендуется проверить)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.files.filter(f => f.warnings.length > 0).slice(0, 20).map((file) => (
                      <div key={file.path} className="border rounded-lg p-4">
                        <p className="font-medium">{file.title}</p>
                        <p className="text-sm text-muted-foreground mb-2">{file.path}</p>
                        <ul className="list-disc list-inside space-y-1">
                          {file.warnings.map((warn, i) => (
                            <li key={i} className="text-sm text-yellow-600">{warn}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {stats.files.filter(f => f.warnings.length > 0).length > 20 && (
                      <p className="text-muted-foreground">
                        ... и ещё {stats.files.filter(f => f.warnings.length > 0).length - 20} файлов с предупреждениями
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.filesWithErrors === 0 && stats.filesWithWarnings === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-lg font-medium">Отлично! Проблем не обнаружено</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
