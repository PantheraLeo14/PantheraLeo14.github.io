---
layout: post
title: "From Storage to Experience：Agent Memory 演进综述"
date: 2026-10-20 20:30:00 +0800
categories: [科研]
tags: [Agent Memory, ACL 2026, 综述, 论文速查表]
summary: "梳理 Agent Memory 从轨迹存储、反思到跨轨迹经验抽象的演进框架。"
mathjax: true
wide_article: true
---

> 本文为论文内容的中文结构化笔记。图表节选自原论文，版权归原作者与出版方所有。

## 第 1 页 / 共 4 页｜总览

| 项目 | 内容 |
| --- | --- |
| 论文 | From Storage to Experience: A Survey on the Evolution of LLM Agent Memory Mechanisms |
| 作者与发表 | Jinghao Luo 等；Findings of ACL 2026，页 41622–41652 |
| 原文入口 | [ACL Anthology 正式页](https://aclanthology.org/2026.findings-acl.2069/) ·  |
| 一句话结论 | 将 Agent Memory 的发展归纳为轨迹存储、轨迹反思和跨轨迹经验抽象三种层次。 |

> **核心问题：** 为什么早期记忆只保存交互记录，后续工作开始编辑轨迹，前沿工作又尝试从多条轨迹中抽象可复用策略？

> **作者框架：** 用长期一致性、动态环境和持续学习解释演进驱动，再按 Storage → Reflection → Experience 梳理机制。

**原文图 1：** 上半部对照不同记忆形态，下半部展示从存储到反思、再到经验抽象的演进路径。

![原文图 1：LLM Agent Memory 的演进概览](/assets/images/paper-cheatsheets/from-storage-to-experience-agent-memory/fig1_storage_reflection_experience.png)

**读图要点：** 三阶段描述抽象程度提升，并不意味着新阶段完全替代旧阶段；系统仍可能同时保留轨迹、反思和经验。

---

## 第 2 页 / 共 4 页｜方法地图与方法族

### 三阶段方法地图

| 阶段 | 处理单位 | 信息变化 | 面向的收益 | 典型风险 |
| --- | --- | --- | --- | --- |
| Storage | 单条轨迹 | 近似原样保存 | 回到历史证据 | 冗余、上下文过长 |
| Reflection | 单次或局部轨迹 | 评估、修正、摘要 | 过滤错误并保留有用内容 | 反思器偏差、过度压缩 |
| Experience | 多条相似轨迹 | 抽象跨轨迹规律 | 将过去结果转成未来策略 | 过度泛化、适用范围不清 |

**原文图 4：** 作者进一步按线性、向量、结构化存储，以及反思和经验子类展开分类。

![原文图 4：从存储到经验的记忆方法分类](/assets/images/paper-cheatsheets/from-storage-to-experience-agent-memory/fig4_memory_evolution_taxonomy.png)

### 经验阶段的两个前沿机制

1. **主动探索：** 智能体不只等待环境提供任务，而是通过探索获得有助于未来决策的新经验。
2. **跨轨迹抽象：** 聚合结构相近的轨迹，提炼可迁移的高层模式或策略。

### 形式化速读

$$
\tau=\langle(o_1,a_1),\ldots,(o_T,a_T)\rangle
$$

轨迹是按时间排列的观察—动作序列。Storage 累积轨迹；Reflection 对轨迹做语义变换；Experience 从相关轨迹批次提取更短的规则集合。

$$
K=F_{\mathrm{exp}}(T_{\mathrm{batch}}),\qquad
|K|\ll\sum_{\tau\in T_{\mathrm{batch}}}|\tau|
$$

---

## 第 3 页 / 共 4 页｜机制、实验与诊断

### 演进驱动与评估资源

| 驱动因素 | 记忆要解决的问题 | 对设计的影响 |
| --- | --- | --- |
| 长期一致性 | 状态、目标和行为跨时段保持连贯 | 需要持续保存并回看历史 |
| 动态环境 | 知识会过期，动作后果可能延迟 | 需要更新、时效与因果关系 |
| 持续学习 | 单次经验需要迁移到新任务 | 需要跨轨迹归纳与验证 |

**原文表 2：** 作者汇总不同阶段常用的记忆基准；该表用于说明评测覆盖范围，并非统一协议的排行榜。

![原文表 2 上半：Storage 阶段记忆基准](/assets/images/paper-cheatsheets/from-storage-to-experience-agent-memory/table2_benchmarks_part1.png)

![原文表 2 下半：Reflection 与 Experience 阶段记忆基准](/assets/images/paper-cheatsheets/from-storage-to-experience-agent-memory/table2_benchmarks_part2.png)

**论文类型与证据边界：** 本文是综述，没有新的统一实验。表中基准在数据、问题类型和指标上不同，不能直接用数字排序。

### 六类诊断

- **只保存原轨迹：** 是否因冗余而超出检索或上下文预算？
- **反思做摘要：** 是否误删因果、时间或例外条件？
- **跨轨迹抽象：** 规则是否能迁移到未见场景？
- **主动探索：** 探索结果是否真正提高未来决策效用？
- **记忆更新：** 旧经验失效后是否能撤销或降低权重？
- **评估：** 是否测量长期成功，而不只是单轮回忆？

---

## 第 4 页 / 共 4 页｜选型、决策与开放问题

### 由失败模式选择机制

| 观察到的问题 | 先考虑 | 需要验证 |
| --- | --- | --- |
| 需要核对历史原话 | Storage | 证据召回和引用准确率 |
| 历史有噪声、重复或错误 | Reflection | 压缩前后证据保留与事实一致性 |
| 多次任务重复出现同一规律 | Experience | 跨任务迁移、过度泛化和可撤销性 |
| 环境会变化、旧规则失效 | 动态更新 | 时效判断与变化后的恢复速度 |

**决策顺序：** 找不到原始证据，强化存储索引与检索；证据杂乱或过时，加反思、更新和遗忘；每次都重复学同类经验，测试跨轨迹抽象；抽象规则在新情境失效，显式建模规则的适用范围。

### 阅读路线与检查

**优先顺序：** 图 1（主线）→ §2（形式定义）→ §3（演进驱动）→ 图 4（方法地图）→ 表 2（基准覆盖）→ §5–6（前沿与开放问题）。

- [ ] 能解释三阶段各自改变了什么信息。
- [ ] 能区分单轨迹反思与跨轨迹抽象。
- [ ] 能指出“抽象更高”带来的迁移收益与过度泛化风险。

**原文入口：** [ACL Anthology 正式页](https://aclanthology.org/2026.findings-acl.2069/) · [本地 PDF](https://aclanthology.org/2026.findings-acl.2069.pdf)
