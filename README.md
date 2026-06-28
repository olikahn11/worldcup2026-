# worldcup2026

世界杯预测网站。每日预测模块版式已经固定，日常只更新比赛分析数据。

## 每日预测更新规则

每天写好的预测文案只改 `src/App.jsx` 里的 `manualMatchAnalysis` 数据：

- 按 `主队 vs 客队` 增加或替换当天比赛分析。
- 可以更新 `conclusion`、`logic`、`evidence`、`news`、`probabilities`、`risk`、`final`。
- 不改 `DailyPredictionSection` 的 HTML 结构、Tailwind 样式、按钮、对齐方式和展开区模板。
- 列表右侧显示的是 `final.recommendation` 的第一个方向，例如 `西班牙胜`、`摩洛哥不败`。
- 每天下午 2 点为更新周期起点，页面自动展示北京时间 14:00 到次日 13:59 的比赛。
- 分析统一按七段展示：比赛本质判断、明确倾向、比分预测、胜平负概率、大小球判断、冷门风险、最终一句话总结。
- 淘汰赛需要额外区分 90 分钟赛果与最终晋级倾向；如提供 `qualificationProbabilities`，晋级概率显示在胜平负概率下方。

固定展示格式：checkbox / 时间 / 主队 vs 客队 / 推荐方向。`vs` 必须保持在对阵列正中，两边球队距离一致。
