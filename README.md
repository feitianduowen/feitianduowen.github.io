# feitianduowen.github.io

个人技术主页：使用 HTML、CSS、JavaScript 与本地 Three.js 构建的全屏三维履历空间，无需构建工具。

## 空间交互

- 开屏点击任意内容区域：文字向左、计算核心向右淡出，进入弯曲的电子河流。
- 向上滚轮前往远处，向下返回；手机向上/向下滑动，或使用底部箭头。键盘 ↑ / ↓ 与 PageUp / PageDown 同样可用，Esc 返回开屏。
- 镜头沿同一条河流移动，右侧扇形卡牌同步切换：PD 工厂与 KV 桥 → CPU 水车与农田 → RISC-V 指令城市 → FeatherDesk 羽毛笔书桌 → OpenCV 眼睛 → 联系之门。
- 河流、水车、数据包和眼睛具有动态效果；鼠标移动带来视角变化，眼睛会跟随并眨动。
- 环境动效可暂停，自动遵循“减少动态效果”设置。页面不可见时停止渲染；WebGL 不可用时显示可阅读的经历列表。
- 页面不显示滚动条。Three.js 0.170.0 随站点本地提供，许可文件位于 `vendor/THREE-LICENSE.txt`；字体不可用时使用系统字体。

## 本地预览

由于使用 ES Modules，请通过 HTTP 静态文件服务器预览，不要直接以 `file://` 打开。可在仓库目录运行：

```bash
python -m http.server 8080
```

然后访问 <http://localhost:8080>。

## 部署

将 `index.html`、`styles.css`、`script.js` 以及整个 `vendor/` 目录推送到 GitHub 仓库的 `main` 分支即可由 GitHub Pages 提供静态托管。
