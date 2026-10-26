# DWparts

[English](README.md) | **简体中文**

DWparts 是手机游戏《地牢深处》（Dungeon Within）的非官方资料站。该游戏由 Game Coaster 开发并发行。本站收录魔物、属性、伤害类型及相关游戏数据，并提供标签筛选功能以缩小检索范围。

本站为静态文档，由一个 HTML 页面、一份项目样式表、一份筛选器样式表、一个筛选器脚本以及一份 jQuery 副本组成。不涉及构建步骤、包管理器或服务端组件。所有引用均为相对路径，因此既可由任意静态 HTTP 服务器提供，也可直接从文件系统打开，两种方式均可正常工作。

本项目与 Game Coaster 无隶属、授权或赞助关系。授权是分层且不统一的：[LICENSE](LICENSE) 中的 MIT 许可仅适用于原创 HTML 与 CSS，不延伸至游戏素材或第三方代码。本仓库各类文件的适用条款见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

## 仓库结构

| 路径 | 内容 | 授权 |
| --- | --- | --- |
| `index.html` | Wiki 文档，入口页面 | MIT |
| `wiki_style.css` | 项目样式表 | MIT |
| `filter/filter.css` | 标签筛选器样式 | MIT |
| `filter/ft_tag.js` | 标签筛选器逻辑 | CC BY-NC-SA 3.0 |
| `filter/jquery-3.7.1.min.js` | jQuery 3.7.1，未修改 | MIT |
| `img/common/` | 图标与界面素材，无损 WebP，页面引用的即此目录（47 个文件） | © Game Coaster |
| `img/characters/` | 角色立绘，无损 WebP，页面引用的即此目录（78 个文件） | © Game Coaster |
| `img/raw/` | 上述文件的 PNG 原始件，页面不引用（125 个文件） | © Game Coaster |
| `CNAME` | GitHub Pages 自定义域名 | — |

## 本地运行

```bash
git clone https://github.com/EpicRojas/DWparts.git
cd DWparts
python3 -m http.server 8000
```

访问 `http://localhost:8000`。其他等效的静态服务器亦可。

## 文件约定

以下条目属于结构性约束，非风格偏好；违反者不予接受。

- `img/` 下的文件名在 GitHub Pages 上区分大小写。HTML 中的引用须与磁盘上的大小写完全一致；`img/common/AC.webp` 与 `img/common/ac.webp` 指代不同文件。
- 图片为带透明通道的无损 WebP。不得改用有损编码；图标为像素画，在显示尺寸下会出现可见失真。
- `img/raw/` 存放 PNG 原始件，是唯一新增图片的位置。`img/common/` 与 `img/characters/` 下的 WebP 属于构建产物，不得手工编辑或新增。
- 页面只引用 `img/common/` 与 `img/characters/`。HTML 中不得引用 `img/raw/` 下的任何文件。
- 本站保持无依赖。不接受前端框架与构建工具。

## 参与贡献

接受 Issue 与 Pull Request。改动应范围明确，且不得变更授权条款。若改动引入第三方代码或素材，须在同一提交内更新 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) 中的对应条目。

站点文本为中文，界面用语与游戏术语以中文版本为准。

## 授权

以下为摘要，权威文本见 [LICENSE](LICENSE) 与 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

| 类别 | 权利人 | 授权 | 可否商用 |
| --- | --- | --- | --- |
| 原创 HTML 与 CSS | EpicRojas 及贡献者 | MIT | 可以 |
| `filter/ft_tag.js` | 克鲁赛德战记 wiki（biligame） | CC BY-NC-SA 3.0 | 禁止 |
| `filter/jquery-3.7.1.min.js` | OpenJS Foundation | MIT | 可以 |
| `img/`、游戏内文本与数据 | Game Coaster | 保留所有权利 | 禁止 |

由于 `filter/ft_tag.js` 含非商业条款，尽管原创代码采用 MIT 许可，本仓库整体不得用于商业用途。

## 免责声明

《地牢深处》及其相关素材为 Game Coaster 的财产。本仓库收录的游戏内容仅用于资料整理与评述目的。权利人如要求移除任何内容，可提交 Issue。
