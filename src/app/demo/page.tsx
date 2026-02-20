"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  Label,
  Select,
  Switch,
  FileUpload,
  Badge,
  Avatar,
  Icon,
  Alert,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Container,
  Grid,
  Stack,
  Divider,
  Header,
  Sidebar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  StatCard,
} from "@/components/ui";

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarActive, setSidebarActive] = useState("dashboard");

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Icon name="menu" size="md" />,
    },
    {
      id: "posts",
      label: "Posts",
      icon: <Icon name="bookmark" size="md" />,
      badge: 24,
    },
    {
      id: "editor",
      label: "Editor",
      icon: <Icon name="plus" size="md" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Icon name="person" size="md" />,
    },
  ];

  const categoryOptions = [
    { value: "case-study", label: "Case Study" },
    { value: "product-design", label: "Product Design" },
    { value: "ux", label: "User Experience" },
    { value: "branding", label: "Branding" },
    { value: "tutorial", label: "Tutorial" },
  ];

  const postsData = [
    {
      id: 1,
      title: "Modern Architectural Design",
      description: "Exploring the minimalism in urban environments...",
      date: "Oct 24, 2023",
      status: "Published",
    },
    {
      id: 2,
      title: "Brand Identity 2024",
      description: "Complete design system for the new digital age...",
      date: "Nov 12, 2023",
      status: "Draft",
    },
    {
      id: 3,
      title: "Mobile App Redesign",
      description: "Case study on UX improvements for fintech...",
      date: "Dec 05, 2023",
      status: "Published",
    },
    {
      id: 4,
      title: "Urban Landscapes",
      description: "A collection of street photography from 2023...",
      date: "Jan 15, 2024",
      status: "Published",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header / Jumbotron */}
      <Header
        size="lg"
        align="center"
        title="UI Component Library"
        subtitle="Stitch에서 가져온 디자인을 기반으로 구축한 재사용 가능한 컴포넌트 모음입니다."
        backgroundVariant="gradient"
      />

      <Container size="xl" className="py-12">
        {/* Button Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Button
          </h2>
          <Card>
            <CardContent>
              <Stack direction="col" gap="lg">
                <div>
                  <Label className="mb-3">Variants</Label>
                  <Stack direction="row" gap="sm" wrap>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </Stack>
                </div>

                <Divider />

                <div>
                  <Label className="mb-3">Sizes</Label>
                  <Stack direction="row" gap="sm" align="center" wrap>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <Icon name="plus" size="md" />
                    </Button>
                  </Stack>
                </div>

                <Divider />

                <div>
                  <Label className="mb-3">States</Label>
                  <Stack direction="row" gap="sm" wrap>
                    <Button disabled>Disabled</Button>
                    <Button isLoading={isLoading} onClick={handleLoadingDemo}>
                      {isLoading ? "Loading..." : "Click to Load"}
                    </Button>
                    <Button leftIcon={<Icon name="arrow-left" size="sm" />}>
                      Back
                    </Button>
                    <Button rightIcon={<Icon name="arrow-right" size="sm" />}>
                      Next
                    </Button>
                  </Stack>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </section>

        {/* Form Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Form Components
          </h2>
          <Grid cols={1} colsMd={2} gap="lg">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>텍스트 입력 필드</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Input label="이메일" placeholder="you@example.com" />
                  <Input
                    label="비밀번호"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Icon name="lock" size="sm" />}
                  />
                  <Input
                    label="에러 상태"
                    error="이메일 형식이 올바르지 않습니다."
                    defaultValue="invalid-email"
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>드롭다운 선택 (Admin Editor 기반)</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Select
                    label="Category"
                    options={categoryOptions}
                    placeholder="Select a category"
                  />
                  <Select
                    label="Status"
                    options={[
                      { value: "draft", label: "Draft" },
                      { value: "published", label: "Published" },
                      { value: "archived", label: "Archived" },
                    ]}
                    defaultValue="draft"
                  />
                  <Select
                    label="에러 상태"
                    options={categoryOptions}
                    error="카테고리를 선택해주세요."
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Textarea</CardTitle>
                <CardDescription>여러 줄 텍스트 입력</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Textarea
                    label="메시지"
                    placeholder="내용을 입력하세요..."
                    rows={4}
                  />
                  <Textarea
                    label="에러 상태"
                    error="내용은 10자 이상 입력해주세요."
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkbox & Label</CardTitle>
                <CardDescription>체크박스와 레이블</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Checkbox label="30일 동안 기억하기" />
                  <Checkbox label="뉴스레터 구독" defaultChecked />
                  <Checkbox label="비활성화 상태" disabled />
                  <Label required>필수 항목 레이블</Label>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </section>

        {/* Tabs Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Tabs (Editor Toolbar Style)
          </h2>
          <Card>
            <CardContent>
              <Tabs defaultValue="formatting">
                <TabsList>
                  <TabsTrigger value="formatting">Formatting</TabsTrigger>
                  <TabsTrigger value="lists">Lists</TabsTrigger>
                  <TabsTrigger value="insert">Insert</TabsTrigger>
                </TabsList>
                <TabsContent value="formatting">
                  <Stack direction="row" gap="sm">
                    <Button variant="ghost" size="icon">
                      <span className="font-bold">B</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <span className="italic">I</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <span className="underline">U</span>
                    </Button>
                  </Stack>
                </TabsContent>
                <TabsContent value="lists">
                  <Stack direction="row" gap="sm">
                    <Button variant="ghost" size="icon">
                      <Icon name="menu" size="md" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="menu" size="md" />
                    </Button>
                  </Stack>
                </TabsContent>
                <TabsContent value="insert">
                  <Stack direction="row" gap="sm">
                    <Button variant="ghost" size="sm" leftIcon={<Icon name="plus" size="sm" />}>
                      Link
                    </Button>
                    <Button variant="ghost" size="sm" leftIcon={<Icon name="plus" size="sm" />}>
                      Image
                    </Button>
                  </Stack>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Display Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Display Components
          </h2>
          <Grid cols={1} colsMd={2} gap="lg">
            <Card>
              <CardHeader>
                <CardTitle>Badge</CardTitle>
                <CardDescription>카테고리, 상태 표시용 배지</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <div>
                    <Label className="mb-3">Variants</Label>
                    <Stack direction="row" gap="sm" wrap>
                      <Badge variant="default">Default</Badge>
                      <Badge variant="primary">Primary</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="error">Error</Badge>
                    </Stack>
                  </div>
                  <Divider />
                  <div>
                    <Label className="mb-3">Dashboard Status Badges</Label>
                    <Stack direction="row" gap="sm" wrap>
                      <Badge variant="success">Published</Badge>
                      <Badge variant="warning">Draft</Badge>
                      <Badge variant="error">Archived</Badge>
                    </Stack>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>사용자 프로필 이미지</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <div>
                    <Label className="mb-3">Sizes</Label>
                    <Stack direction="row" gap="md" align="center">
                      <Avatar size="xs" alt="XS" />
                      <Avatar size="sm" alt="SM" />
                      <Avatar size="md" alt="MD" />
                      <Avatar size="lg" alt="LG" />
                      <Avatar size="xl" alt="XL" />
                    </Stack>
                  </div>
                  <Divider />
                  <div>
                    <Label className="mb-3">With Fallback</Label>
                    <Stack direction="row" gap="md" align="center">
                      <Avatar alt="John Doe" />
                      <Avatar alt="Jane Smith" fallback="JS" />
                      <Avatar alt="Admin User" fallback="A" />
                    </Stack>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>StatCard (Admin Dashboard)</CardTitle>
                <CardDescription>통계 카드 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent>
                <Grid cols={1} colsSm={2} colsLg={3} gap="md">
                  <StatCard
                    icon={<Icon name="search" size="lg" />}
                    label="Total Views"
                    value={12842}
                    change={{ value: 12, type: "increase" }}
                    variant="primary"
                  />
                  <StatCard
                    icon={<Icon name="check" size="lg" />}
                    label="Published Posts"
                    value={18}
                    change={{ value: 3, type: "increase" }}
                    variant="success"
                  />
                  <StatCard
                    icon={<Icon name="bookmark" size="lg" />}
                    label="Drafts"
                    value={6}
                    variant="warning"
                  />
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </section>

        {/* Table & Pagination Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Table & Pagination (Admin Dashboard)
          </h2>
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Post Management</CardTitle>
              <CardDescription>관리자 게시글 목록</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow isHoverable={false}>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Post Title</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postsData.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="w-16 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {post.title}
                          </p>
                          <p className="text-xs text-zinc-500 truncate max-w-xs">
                            {post.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            post.status === "Published" ? "success" : "warning"
                          }
                          size="sm"
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" gap="xs">
                          <Button variant="ghost" size="sm">
                            <Icon name="bookmark" size="sm" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Icon name="close" size="sm" />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
                <Stack direction="row" justify="between" align="center">
                  <p className="text-sm text-zinc-500">
                    Showing 1 to 4 of 24 results
                  </p>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={6}
                    onPageChange={setCurrentPage}
                    showFirstLast={false}
                  />
                </Stack>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sidebar Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Sidebar (Admin Navigation)
          </h2>
          <Card padding="none" className="overflow-hidden">
            <div className="flex h-[400px]">
              <Sidebar
                items={sidebarItems}
                activeId={sidebarActive}
                onItemClick={(item) => setSidebarActive(item.id)}
                header={
                  <Stack direction="row" gap="sm" align="center">
                    <Avatar size="sm" alt="Admin" fallback="A" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Admin Panel
                    </span>
                  </Stack>
                }
                footer={
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Icon name="arrow-left" size="sm" />
                    <span className="ml-2">Logout</span>
                  </Button>
                }
              />
              <div className="flex-1 p-6 bg-zinc-50 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  {sidebarItems.find((i) => i.id === sidebarActive)?.label} Content
                </h3>
                <p className="text-zinc-500">
                  Selected: <Badge variant="primary">{sidebarActive}</Badge>
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Admin Editor Preview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Admin Post Editor Preview
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>New Post</CardTitle>
              <CardDescription>Stitch Admin Editor 기반 레이아웃</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack gap="lg">
                <Grid cols={1} colsMd={2} gap="md">
                  <Input label="Post Title" placeholder="Enter post title..." />
                  <Select
                    label="Category"
                    options={categoryOptions}
                    placeholder="Select category"
                  />
                </Grid>

                <Input
                  label="Permalink"
                  placeholder="portfolio.com/posts/your-post-slug"
                  leftIcon={<Icon name="share" size="sm" />}
                />

                <div>
                  <Label className="mb-2">Content</Label>
                  <Card variant="bordered" padding="none">
                    <div className="p-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                      <Stack direction="row" gap="xs">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="font-bold text-sm">B</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="italic text-sm">I</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="underline text-sm">U</span>
                        </Button>
                        <Divider orientation="vertical" className="mx-1 h-6" />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Icon name="menu" size="sm" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Icon name="bookmark" size="sm" />
                        </Button>
                        <Divider orientation="vertical" className="mx-1 h-6" />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Icon name="share" size="sm" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Icon name="plus" size="sm" />
                        </Button>
                      </Stack>
                    </div>
                    <Textarea
                      placeholder="Start typing your story here..."
                      rows={8}
                      className="border-0 rounded-none focus:ring-0"
                    />
                  </Card>
                </div>

                <div>
                  <Label className="mb-2">Featured Image</Label>
                  <Card
                    variant="bordered"
                    className="border-dashed hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <Stack align="center" gap="sm" className="py-8">
                      <Icon name="plus" size="xl" className="text-zinc-400" />
                      <p className="text-sm text-zinc-500">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-zinc-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </Stack>
                  </Card>
                </div>

                <Divider />

                <Stack direction="row" justify="end" gap="sm">
                  <Button variant="outline">Save as Draft</Button>
                  <Button variant="primary">Publish Post</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </section>

        {/* Admin Profile Settings */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Admin Profile & Site Settings
          </h2>
          <Stack gap="lg">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>프로필 정보를 수정합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="lg">
                  <FileUpload
                    variant="avatar"
                    label="Profile Picture"
                    description="JPG, GIF or PNG. Max 2MB."
                    accept="image/jpeg,image/png,image/gif"
                    maxSize={2 * 1024 * 1024}
                  />

                  <Grid cols={1} colsMd={2} gap="md">
                    <Input label="First Name" placeholder="John" />
                    <Input label="Last Name" placeholder="Doe" />
                  </Grid>

                  <Textarea
                    label="Bio"
                    placeholder="Tell us about yourself..."
                    defaultValue="Digital designer and content creator based in San Francisco, focused on minimalist web experiences."
                    rows={3}
                  />

                  <div>
                    <Label className="mb-3">Social Media Links</Label>
                    <Stack gap="sm">
                      <Input
                        placeholder="Website URL"
                        leftIcon={<Icon name="search" size="sm" />}
                      />
                      <Input
                        placeholder="Portfolio Link"
                        leftIcon={<Icon name="share" size="sm" />}
                      />
                    </Stack>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>계정 보안 설정을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="admin@example.com"
                  />
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <Grid cols={1} colsMd={2} gap="md">
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            {/* Site Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>사이트 전역 설정을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="lg">
                  <Input
                    label="Portfolio Title"
                    placeholder="My Portfolio"
                  />

                  <FileUpload
                    label="Site Logo"
                    description="PNG, SVG recommended. Max 1MB."
                    accept="image/png,image/svg+xml"
                    maxSize={1024 * 1024}
                  />

                  <Input
                    label="Footer Text"
                    placeholder="© 2024 Your Name. All rights reserved."
                  />

                  <Divider />

                  <div>
                    <Label className="mb-3">Display Options</Label>
                    <Stack gap="md">
                      <Switch
                        label="Dark Mode"
                        description="Enable dark theme for the admin panel"
                      />
                      <Switch
                        label="Show Comments"
                        description="Allow visitors to leave comments on posts"
                        defaultChecked
                      />
                      <Switch
                        label="Maintenance Mode"
                        description="Temporarily disable the public site"
                      />
                    </Stack>
                  </div>

                  <Alert variant="info" title="Pro Tip">
                    These settings affect your public website globally. Changes will be visible to all visitors immediately after saving.
                  </Alert>

                  <Stack direction="row" justify="end" gap="sm">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="primary">Save Changes</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </section>

        {/* New Components Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Alert, Switch & FileUpload
          </h2>
          <Grid cols={1} colsMd={2} gap="lg">
            <Card>
              <CardHeader>
                <CardTitle>Alert</CardTitle>
                <CardDescription>알림/메시지 표시 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Alert variant="info" title="Information">
                    This is an informational message.
                  </Alert>
                  <Alert variant="success" title="Success">
                    Your changes have been saved successfully.
                  </Alert>
                  <Alert variant="warning" title="Warning">
                    Please review your settings before continuing.
                  </Alert>
                  <Alert variant="error" title="Error">
                    Something went wrong. Please try again.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Switch</CardTitle>
                <CardDescription>토글 스위치 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Switch label="Basic Switch" />
                  <Switch label="Default On" defaultChecked />
                  <Switch
                    label="With Description"
                    description="This is a helpful description for the switch"
                  />
                  <Switch label="Disabled" disabled />
                </Stack>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>FileUpload</CardTitle>
                <CardDescription>파일 업로드 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent>
                <Grid cols={1} colsMd={2} gap="lg">
                  <div>
                    <Label className="mb-3">Avatar Style</Label>
                    <FileUpload
                      variant="avatar"
                      label="Profile Picture"
                      description="JPG, PNG. Max 2MB."
                    />
                  </div>
                  <div>
                    <Label className="mb-3">Default Style</Label>
                    <FileUpload
                      label="Upload File"
                      description="Drag and drop or click to upload"
                    />
                  </div>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </section>

        {/* Layout Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Layout Components
          </h2>
          <Grid cols={1} colsMd={2} gap="lg">
            <Card>
              <CardHeader>
                <CardTitle>Stack</CardTitle>
                <CardDescription>Flexbox 기반 정렬 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <div>
                    <Label className="mb-3">Direction: Row</Label>
                    <Stack
                      direction="row"
                      gap="sm"
                      className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded" />
                      <div className="w-12 h-12 bg-blue-500 rounded" />
                      <div className="w-12 h-12 bg-blue-500 rounded" />
                    </Stack>
                  </div>
                  <div>
                    <Label className="mb-3">Justify: Space Between</Label>
                    <Stack
                      direction="row"
                      justify="between"
                      className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-green-500 rounded" />
                      <div className="w-12 h-12 bg-green-500 rounded" />
                      <div className="w-12 h-12 bg-green-500 rounded" />
                    </Stack>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grid</CardTitle>
                <CardDescription>반응형 그리드 레이아웃</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <div>
                    <Label className="mb-3">3 Columns</Label>
                    <Grid cols={3} gap="sm">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                          key={n}
                          className="h-12 bg-orange-500 rounded flex items-center justify-center text-white font-bold"
                        >
                          {n}
                        </div>
                      ))}
                    </Grid>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </section>

        {/* Card Portfolio Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Card Grid (Portfolio Style)
          </h2>
          <Grid cols={1} colsSm={2} colsLg={3} gap="lg">
            {[
              {
                category: "UI/UX",
                title: "The Future of Minimalist Design in 2025",
                description:
                  "How decreasing visual noise leads to increased user retention.",
                readTime: "3 min read",
              },
              {
                category: "Strategy",
                title: "Sustainable Digital Products",
                description:
                  "Exploring ecological responsibility in the digital age.",
                readTime: "5 min read",
              },
              {
                category: "Technology",
                title: "Building Scalable Design Systems",
                description:
                  "A deep dive into utility-first CSS frameworks.",
                readTime: "12 min read",
              },
            ].map((item, index) => (
              <Card
                key={index}
                variant="bordered"
                padding="none"
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20" />
                <div className="p-6">
                  <Stack direction="row" gap="sm" className="mb-3">
                    <Badge variant="primary">{item.category}</Badge>
                    <Badge variant="default">{item.readTime}</Badge>
                  </Stack>
                  <CardTitle className="mb-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </Card>
            ))}
          </Grid>
        </section>
      </Container>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-12">
        <Container>
          <Stack align="center" gap="sm">
            <p className="text-sm">
              Built with Next.js, Tailwind CSS, and components inspired by Stitch
            </p>
            <Stack direction="row" gap="md">
              <Icon name="heart" size="sm" className="text-red-500" />
              <span className="text-sm">Made for Sephinote Portfolio</span>
            </Stack>
          </Stack>
        </Container>
      </footer>
    </div>
  );
}
