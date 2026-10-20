---
layout: post
title: "MemCoE：两阶段记忆优化论文速查表"
date: 2026-10-20 20:00:00 +0800
categories: [科研]
tags: [Agent Memory, ACL 2026, MemCoE, 论文速查表]
summary: "拆解 MemCoE 如何分别优化记忆组织指南与长期记忆更新策略。"
mathjax: true
wide_article: true
---

> 本文为论文内容的中文结构化笔记。图表节选自原论文，版权归原作者与出版方所有。

## 第 1 页 / 共 4 页｜总览

| 项目 | 内容 |
| --- | --- |
| 论文 | Learning How and What to Memorize: Cognition-Inspired Two-Stage Optimization for Evolving Memory |
| 作者与发表 | Derong Xu 等；ACL 2026 Long Papers，页 44987–45011 |
| 原文入口 | [ACL Anthology 正式页](https://aclanthology.org/2026.acl-long.2084/) · [代码仓库](https://github.com/Applied-Machine-Learning-Lab/ACL2026_MemCoE) |
| 一句话结论 | 把记忆更新拆为“先学怎样组织记忆的文字指南，再学按指南更新什么记忆”的两阶段优化。 |

> **核心问题：** 结果奖励很稀疏时，Agent 怎样稳定学习长期保留、修改和遗忘哪些用户信息？

> **方法主线：** MGI 学习记忆更新指南；GMPO 固定指南并通过多轮 RL 优化记忆演化策略。

**原文图 2：** 左侧是文字指南的对比反馈优化，右侧是按指南奖励记忆策略。

![原文图 2：MemCoE 两阶段框架](/assets/images/paper-cheatsheets/memcoe-evolving-memory/fig2_memcoe_framework.png)

**读图要点：** 第一步更新的是自然语言指南；第二步才用奖励和 GRPO 训练记忆演化策略。不要把两阶段都概括成“微调记忆文本”。

---

## 第 2 页 / 共 4 页｜方法地图与方法族

### 两阶段方法矩阵

| 阶段 | 输入与信号 | 更新对象 | 产物 |
| --- | --- | --- | --- |
| MGI：Memory Guideline Induction | 历史、查询、正确/次优轨迹 | 自然语言指南 | 记忆组织和更新原则 |
| GMPO：Guideline-Aligned Memory Policy Optimization | 固定指南、记忆轨迹、格式与答案反馈 | 记忆演化策略参数 | 多轮记忆更新策略 |

### MGI：把对比反馈变成文字梯度

对同一历史和问题采样多条轨迹，挑出正确轨迹与次优轨迹；反馈模型指出差异，再聚合多个样本的共性错误，迭代改写指南。这里的“梯度”是自然语言反馈，不是对权重求导。

### GMPO：在指南约束下学更新动作

- **指南奖励：** 检查更新是否遵守指南规定的结构和字段。
- **答案奖励：** 检查多轮记忆演化后的回答是否正确。
- **策略优化：** 采样轨迹组，使用组相对优势更新策略。

$$
R(\tau)=(1-\lambda)R_S(\tau;S^\star)+\lambda R_{\mathrm{ans}}(\tau)
$$

R_S 衡量指南保真度，R_{ans} 衡量最终回答正确性；λ 控制两类目标的权重。

### 与相邻方法的差别

| 方法族 | 更新重点 | 和 MemCoE 的差别 |
| --- | --- | --- |
| 固定规则记忆库 | 手写如何合并、更新 | 指南不随数据自动改进 |
| 记忆库 RAG | 取回相关片段 | 主要改读取，不一定学记忆如何演化 |
| 单阶段 RL Agent | 直接用任务回报更新策略 | 稀疏结果信号难说明哪种记忆编辑更好 |
| MemCoE | 先学指南，再用指南奖励训练策略 | 用文字规则提供更密集的过程监督 |

---

## 第 3 页 / 共 4 页｜机制、实验与诊断

### 数据流与训练配置

1. **训练输入：** 历史对话和查询；训练样本来自 PersonaMem。
2. **MGI：** 使用正确轨迹和负轨迹生成对比反馈，更新指南。
3. **GMPO：** 以指南奖励和答案奖励评估轨迹，执行多轮策略优化。
4. **推理：** 将完整历史提供给记忆演化流程，按指南逐轮处理记忆。

| 配置项 | 论文报告 |
| --- | --- |
| 基座模型 | 主要使用 Qwen2.5-7B-Instruct；MEM-α 使用 Qwen3-4B |
| 基准 | PersonaMem、PrefEval、PersonaBench |
| 检索 | all-MiniLM-L6-v2，Top-10 |
| 训练数据 | 从 PersonaMem 采样 300 个训练样例 |
| 硬件 | 4 张 A6000 |
| 每轮记忆块 | 4K tokens |

**原文表 1：** MemCoE 在八种基准设置上的 Overall 为 52.02，表中高于其他比较方法；该数值是论文定义下的汇总列。

![原文表 1：八种评估设置的总体比较](/assets/images/paper-cheatsheets/memcoe-evolving-memory/table1_main_results.png)

**原文表 2：** 去掉 MGI 或 GMPO 会造成明显下降；去掉对比反馈或指南奖励也会带来较小但一致的退化。

![原文表 2：两阶段组件消融](/assets/images/paper-cheatsheets/memcoe-evolving-memory/table2_ablation.png)

**原文图 3：** 在 PersonaMem 32K 设置下比较构建时间与性能。

![原文图 3：性能与记忆构建时间](/assets/images/paper-cheatsheets/memcoe-evolving-memory/fig3_efficiency.png)

### 结果审计

- **强证据：** 表 1 中，MemCoE 在 PersonaMem、PrefEval 和 PersonaBench 的八个设置上均列出最佳结果。
- **消融证据：** 删除 MGI 对 PrefEval 偏好保持影响明显；删除 GMPO 对 PersonaMem 长历史跟踪影响明显。
- **限制：** 指南奖励由 LLM 评分；每轮预算和演化轮数需要调参，更新错误可能跨轮累积。
- **复现提醒：** 论文报告的训练使用 4×A6000；单卡 3090 能否完整复现，不能只凭 7B 参数量判断。

---

## 第 4 页 / 共 4 页｜选型、决策与开放问题

### 适用场景

| 现象 | MemCoE 可提供的思路 | 仍需测什么 |
| --- | --- | --- |
| 不同用户需要不同更新规则 | 从轨迹反馈归纳全局指南 | 指南跨用户、跨域迁移 |
| 结果奖励太稀疏 | 增加指南一致性过程奖励 | 过程奖励是否和真实效用一致 |
| 多轮更新容易漂移 | 指南固定后学习策略 | 长历史上的错误累积和遗忘 |
| 更新结构混乱 | 奖励格式、字段和操作约束 | 结构合规是否真的改善答案 |

**决策顺序：** 如果记忆更新违反预期规则，先查指南质量；指南正确但结果不好，查策略优化、预算和回答反馈；短期改进但长程退化，查更新误差累积与目标冲突。

### 阅读路线与检查

**优先顺序：** 图 2 → §4.1（MGI）→ §4.2（GMPO）→ 表 1/2 → 图 3 与预算敏感性分析。

- [ ] 能说明 MGI 的文本梯度是什么、与参数梯度有什么不同。
- [ ] 能说明 GMPO 的两类奖励如何作用于轨迹。
- [ ] 能区分指南文本变化与策略参数更新。

**原文入口：** [ACL 正式页与附件](https://aclanthology.org/2026.acl-long.2084/) · [本地 PDF](https://aclanthology.org/2026.acl-long.2084.pdf)
