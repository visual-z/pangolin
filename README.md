# Pangolin 项目 README

## 简介

**Pangolin** 是一个用于禅道ERP对接OIDC（OpenID Connect）的项目，主要使用了 NestJS 框架进行开发。本项目已经支持 Docker 容器化部署，并集成了 JetBrains 的 CI/CD 流程配置。

## 功能特性

- **禅道ERP 对接 OIDC**: 提供基于 OIDC 的认证和授权功能，使得禅道ERP能够与第三方身份提供商进行对接。
- **NestJS 框架**: 使用现代化的 Node.js 框架，提供高效、可扩展的开发体验。
- **Docker 支持**: 项目已配置 Dockerfile，支持快速容器化部署。
- **CI/CD 集成**: 项目根目录下包含 JetBrains 的 `.space.kts` 文件，支持 CI/CD 流程自动化。
- **Redis 集成**: 项目运行需要 Redis 作为缓存和消息中间件。

## 快速开始

### 环境准备

1. **安装 Docker**: 请确保您的系统已经安装了 Docker。
2. **安装 Redis**: 您需要运行一个 Redis 实例，可以使用 Docker 快速启动：
   ```sh
   docker run --name pangolin-redis -d redis
   ```

### 配置项目

1. **克隆项目代码**:
   ```sh
   git clone https://github.com/zyh0821/pangolin
   cd pangolin
   ```

2. **配置文件**: 
   - 进入 `resources` 目录，填写 `base.yaml` 和 `extra.yaml` 中的配置项。
   - 请删除 `.example` 文件，只保留 `base.yaml` 和 `extra.yaml`。

### 构建与运行

1. **Docker 构建和运行**:
   ```sh
   docker build -t pangolin .
   docker run -d -p 3000:3000 --name pangolin --link pangolin-redis:redis pangolin
   ```

2. **本地开发运行**:
   - 安装依赖:
     ```sh
     npm install
     ```
   - 运行项目:
     ```sh
     npm run start
     ```

### CI/CD 配置

项目根目录下的 `.space.kts` 文件已经配置好 CI/CD 流程，您可以根据需要进行修改。确保您的 JetBrains Space 项目已正确配置，并能够访问您的代码库和 Docker registry。

## 配置项说明

### `base.yaml`

该文件包含了Redis 配置

### `extra.yaml`

该文件用于zentao和OIDC配置

## 使用 Redis

Pangolin 项目依赖 Redis 进行缓存和消息处理，请确保 Redis 服务正常运行并在 `base.yaml` 中正确配置 Redis 连接信息。

## 支持与反馈

如在使用过程中遇到任何问题或有任何建议，欢迎提交 Issue 或 Pull Request。我们会尽快进行处理。

---

感谢您使用 Pangolin 项目，希望它能为您的禅道ERP与 OIDC 对接带来便利。

---

© 2024 Visual

