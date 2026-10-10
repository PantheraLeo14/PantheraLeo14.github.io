# PantheraLeo 的博客 · GitHub Pages

这是一个用 Jekyll 构建的中文个人博客。文章写成 Markdown，推送到 GitHub 后会由 GitHub Actions 自动生成并发布。

## 首次发布

1. 你的 GitHub Pages 仓库是 `PantheraLeo14/PantheraLeo14.github.io`，博客网址为 `https://pantheraleo14.github.io`。
2. 在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. 将博客文件推送到仓库的 `main` 分支。之后每次推送文章，Actions 都会自动更新网站。

本地仓库已连接到你的 GitHub 仓库。提交博客文件并推送：

```sh
git add .
git commit -m "创建博客"
git push -u origin main
```

## 发布一篇 Markdown 文章

在 `_posts` 目录新建文件，文件名使用 `年-月-日-英文短标题.md`，例如：

```text
_posts/2026-10-12-a-walk-in-autumn.md
```

文件开头写上标题、日期和分类，下面直接写 Markdown 正文：

```markdown
---
title: "秋天散步记"
date: 2026-10-12 20:00:00 +0800
categories: [生活]
tags: [散步, 秋天]
summary: "一段简短的文章介绍，会显示在首页。"
---

今天沿着河边走了很久……
```

`categories` 用来设置文章栏目，可选科研、游戏、交易、减重，也可以直接写新的栏目名。需要给一篇文章设置多个栏目时，可以写成 `categories: [科研, 游戏]`。在“文章”页面点击栏目按钮，就能筛选对应文章。

保存后把文件推送到 `main` 分支，网站会自动更新。也可以在 GitHub 网页上进入 `_posts`，选择 **Add file → Create new file** 或 **Upload files** 添加文章。

## 本地预览

本地预览需要安装较新的 Ruby、Bundler 和 Jekyll。安装完成后，在博客目录运行：

```sh
gem install jekyll bundler
jekyll serve
```

然后打开终端显示的本地网址。GitHub Actions 会在发布时自动设置正确的网站路径。
