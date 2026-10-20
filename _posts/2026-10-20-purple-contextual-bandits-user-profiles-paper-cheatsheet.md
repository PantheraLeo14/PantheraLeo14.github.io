---
layout: post
title: "PURPLE：上下文老虎机优化用户画像"
date: 2026-10-20 20:00:00 +0800
categories: [科研]
tags: [Agent Memory, ACL 2026, PURPLE, 论文速查表]
summary: "解析 PURPLE 如何使用上下文老虎机，从候选历史记录中选择并排序用户画像。"
mathjax: true
wide_article: true
---

> 本文为论文内容的中文结构化笔记。图表节选自原论文，版权归原作者与出版方所有。

## 第 1 页 / 共 4 页｜总览

| 项目 | 内容 |
| --- | --- |
| 论文 | Optimizing User Profiles via Contextual Bandits for Retrieval-Augmented LLM Personalization |
| 作者与发表 | Linfeng Du 等；ACL 2026 Long Papers |
| 原文入口 | [ACL Anthology 正式页](https://aclanthology.org/2026.acl-long.1467/) |
| 一句话结论 | 语义相似不等于个性化有用；PURPLE 把用户画像构建作为上下文老虎机策略，用下游参考答案似然训练选择与排序。 |

> **核心问题：** 当前查询相关的历史记录，未必能提高回答质量；冗余或冲突记录甚至会伤害生成。

> **方法主线：** 先用检索器取候选记录，再学习从中选哪些记录、按什么顺序组成画像。

**原文图 2：** 训练时采样有序画像并计算奖励；推理时取倾向分最高的 Top-K 记录。

![原文图 2：PURPLE 的训练与推理流程](/assets/images/paper-cheatsheets/purple-contextual-bandits-user-profiles/fig2_purple_workflow.png)

**读图要点：** 排序不仅决定哪条记录进入画像，顺序本身也会影响冻结 LLM 的条件上下文。

---

## 第 2 页 / 共 4 页｜方法地图与方法族

### 上下文老虎机建模

| 组成 | PURPLE 中的定义 |
| --- | --- |
| 上下文 | 用户历史与当前查询 |
| 动作 | 从候选历史中选取 K 条并排列成画像 |
| 策略 | 用户记录编码器为记录计算倾向分 |
| 奖励 | 冻结 LLM 对参考个性化答案的对数似然 |

$$
P=\langle p_1,\ldots,p_K\rangle,\qquad
R(P,x,y)=\log p_\phi(y\mid P,x)
$$

动作 P 是有序画像；奖励越高表示参考回答在该画像条件下越可能被生成。

### 关键模块

1. **候选召回：** Contriever 从用户历史中取 20 条候选。
2. **记录编码：** 对查询与记录做后期交互，生成查询相关的记录表示。
3. **记录间依赖：** Transformer 在记录级别建模画像内部关系。
4. **Plackett–Luce 策略：** 按倾向分无放回采样有序画像，避免穷举所有排列。
5. **策略梯度：** 对采样画像计算奖励并用 REINFORCE 更新。

### 与常规 Top-K RAG 的区别

| 常规 RAG | PURPLE |
| --- | --- |
| 按查询—文档相关性选择 | 用下游生成效用训练选择策略 |
| 记录通常独立评分 | 显式建模画像内记录依赖 |
| Top-K 多为静态启发式 | 训练中探索有序画像 |
| 常以相关性作目标 | 参考答案似然作为语义奖励 |

---

## 第 3 页 / 共 4 页｜机制、实验与诊断

### 实验设置

| 项目 | 论文报告 |
| --- | --- |
| 任务 | LaMP 上 9 项个性化任务，覆盖分类、回归、短文本和长文本生成 |
| 冻结生成模型 | Phi-4-Mini-Instruct、Llama-3-8B-Instruct，并扩展到 Llama-3-70B-Instruct |
| 候选与画像 | Contriever 取 20 条，PURPLE 选择 5 条组成画像 |
| 训练采样 | 每个样本采样 32 个画像估计策略梯度 |
| 评估 | 分类/回归用任务指标，生成任务用 ROUGE、METEOR 等 |

**原文表 1：** LaMP 多任务结果；作者报告 PURPLE 在不同任务上稳定超过多类启发式和 RAG 基线。

![原文表 1：LaMP 基准结果](/assets/images/paper-cheatsheets/purple-contextual-bandits-user-profiles/table1_lamp_results.png)

**原文图 3：** News 任务上的 ROUGE-1 与吞吐率比较，展示效用—速度折中。

![原文图 3：News 任务质量与吞吐率](/assets/images/paper-cheatsheets/purple-contextual-bandits-user-profiles/fig3_quality_throughput.png)

### 结果审计

- **论文报告：** PURPLE 在 9 项任务上整体优于启发式、LLM 重排和检索增强基线；系统保持生成 LLM 冻结。
- **机制证据：** 论文通过消融比较 Transformer 记录交互和对数似然奖励，说明画像内依赖建模与奖励设计均影响表现。
- **限制：** 训练依赖高质量参考个性化答案；实际用户反馈常为隐式、稀疏或嘈杂信号。
- **迁移限制：** 当前策略按任务训练，尚未证明能直接迁移到未见任务或领域。

### 常见失效

- 相关候选池本身漏掉关键历史。
- 参考答案质量不足，奖励把画像带向错误记录。
- 画像排序优化提升参考似然，却不一定提升真实用户满意度。
- 20→5 的硬筛选可能过早丢弃边界情境下有用的记录。

---

## 第 4 页 / 共 4 页｜选型、决策与开放问题

### 何时选画像优化

| 条件 | 适合考虑 PURPLE | 主要检查 |
| --- | --- | --- |
| 候选历史已经召回，但筛选不准 | 是 | 参考答案是否能提供可信训练奖励 |
| 当前目标是个性化文本生成 | 是 | 参考文本是否代表真实偏好 |
| 线上无高质量标注 | 有条件 | 能否替换为点击、编辑或明确反馈 |
| 关键证据常在候选池之外 | 否，先补召回 | 候选召回率与检索预算 |

**决策顺序：** 金标准不在 20 条候选中，先改召回；金标准已在候选但画像没选中，评估画像策略；画像正确但输出错误，固定画像后检查生成器。

### 阅读路线与检查

**优先顺序：** 图 2 → §3.1（上下文、动作、奖励）→ PL 策略 → 表 1 → §5.2 消融 → 图 3 效率。

- [ ] 能解释为什么动作是有序画像，而非无序集合。
- [ ] 能说出 log-likelihood 奖励如何把检索选择和生成效用关联。
- [ ] 能区分候选召回失败与候选内排序失败。

**原文入口：** [ACL Anthology 正式页](https://aclanthology.org/2026.acl-long.1467/) · [本地 PDF](https://aclanthology.org/2026.acl-long.1467.pdf)
