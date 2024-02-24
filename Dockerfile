# 基础设置
# > 根镜像
FROM node:21
# > 参数
# > > -
ARG JB_SPACE_CLIENT_ID
# > > -
ARG JB_SPACE_CLIENT_SECRET
# > 信息
# > > 所有者
LABEL org.opencontainers.image.authors="Giant Technology, Inc."
# > > 来源
LABEL org.opencontainers.image.source="https://giant.space/p/zoo/repositories/pangolin"
# > 工作目录
WORKDIR /opt/pangolin
# > 启动命令
ENTRYPOINT [ "node", "dist/main.js" ]
# > 端口
EXPOSE 3000

# 构建程序
# > 安装依赖
# > > 配置 NPM 以便于使用私有仓库
RUN npm config set strict-ssl false; \
    npm config set registry https://registry.npmmirror.com; \
    npm config set @-:registry https://packages.giant.space/npm/p/element/npm; \
    npm config set //packages.giant.space/npm/p/element/npm/:_auth $(echo "$JB_SPACE_CLIENT_ID:$JB_SPACE_CLIENT_SECRET" | tr -d \\n | base64 | tr -d \\n);
# > > 复制依赖配置文件
COPY package.json pnpm-lock.yaml ./
# > > 安装
# > > > 安装
RUN npm install -g pnpm; \
    pnpm install;
# > 构建
# > > 复制其他文件
COPY . .
# > > 构建应用
RUN npm run build