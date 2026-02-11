# Community Trips 数据同步说明

## 问题

**为什么团队成员看不到我创建的 Community Trips？**

本项目使用 **SQLite 数据库**（`prisma/dev.db`），这是一个**本地文件数据库**。每个开发者的数据库文件是独立的，不会自动同步。

## 解决方案

### 选项 1：运行种子脚本（推荐）

在拉取最新代码后，运行以下命令创建示例数据：

```bash
# 1. 确保数据库迁移最新
npx prisma migrate dev

# 2. 生成 Prisma Client
npx prisma generate

# 3. 运行种子脚本
npm run db:seed
```

这会创建两个示例 Community Trips：
- Shanghai to Auckland Adventure
- Shanghai to Tokyo Adventure

### 选项 2：手动创建数据

1. 启动开发服务器：`npm run dev`
2. 访问 Community Journeys 页面
3. 点击 "Share Your Journey" 创建新的 Trip

### 选项 3：使用共享数据库（生产环境）

在生产环境，应该使用共享数据库（PostgreSQL、MySQL 等），而不是 SQLite。

修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"  // 或 "mysql"
  url      = env("DATABASE_URL")
}
```

并设置 `.env` 文件：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/weave_db"
```

## 技术说明

### SQLite 的特点
- ✅ 简单易用，无需安装数据库服务器
- ✅ 适合本地开发和原型
- ❌ 数据存储在本地文件，不支持多人共享
- ❌ 不适合生产环境

### 数据库文件位置
- `prisma/dev.db` - 主数据库文件
- `prisma/dev.db-journal` - SQLite 日志文件（临时）

### Git 处理
数据库文件 (`*.db`) 已提交到 Git，但每次拉取代码后，需要确保：
1. 运行最新的数据库迁移
2. 重新生成测试数据（通过种子脚本或手动创建）

## 常见错误

### "Failed to fetch trip details"

**原因**：数据库中没有对应的 Trip 数据

**解决**：运行 `npm run db:seed` 创建示例数据

### "Table does not exist"

**原因**：数据库迁移未运行

**解决**：运行 `npx prisma migrate dev`
