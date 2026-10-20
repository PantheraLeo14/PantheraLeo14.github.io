---
layout: post
title: "PAMU：偏好感知记忆更新论文速查表"
date: 2026-10-20 20:00:00 +0800
categories: [科研]
tags: [Agent Memory, ACL 2026, PAMU, 论文速查表]
summary: "介绍 PAMU 如何结合短期窗口与长期趋势跟踪偏好变化并更新记忆提示。"
mathjax: true
wide_article: true
---

> 本文为论文内容的中文结构化笔记。图表节选自原论文，版权归原作者与出版方所有。

## 第 1 页 / 共 4 页｜总览

| 项目 | 内容 |
| --- | --- |
| 论文 | Preference-Aware Memory Update for Long-Term LLM Agents |
| 作者与发表 | Haoran Sun、Zekun Zhang、Shaoning Zeng；Findings of ACL 2026，页 783–793 |
| 原文入口 | [ACL Anthology 正式页](https://aclanthology.org/2026.findings-acl.38/) |
| 一句话结论 | 用短期滑动窗口和长期指数移动平均跟踪多维偏好；检测到变化后，更新偏好向量并把控制提示附加到生成输入。 |

> **核心问题：** 用户偏好会变化；只保存一份静态画像会过时，只看最近反馈又会对噪声过度反应。

> **方法主线：** 提取多维偏好 → 并行估计短期与长期趋势 → 检测变化 → 动态调整偏好提示。

**原文图 1：** 偏好抽取器输出多个维度，短期与长期估计经 SW 和 EMA 融合后形成偏好向量，再注入提示。

![原文图 1：PAMU 偏好更新框架](/assets/images/paper-cheatsheets/pamu-preference-aware-memory-update/fig1_pamu_framework.png)

**读图要点：** 论文强调模块化集成：在实验基线原有记忆机制外追加偏好控制信号，不重写其检索/存储算法。

---

## 第 2 页 / 共 4 页｜方法地图与方法族

### 五维偏好表示

| 偏好维度 | 论文使用的信号示例 |
| --- | --- |
| 语气与风格 | 预定义语气类别及分类概率 |
| 情感基调 | 情感类别与置信度 |
| 回复长度 | 近期生成长度的归一化统计 |
| 信息密度 | 每单位文本抽取的结构化信息量 |
| 正式程度 | 对话风格类别或强度 |

### 双时间尺度更新

短期窗口描述最近偏好，EMA 平滑长期趋势；二者融合以兼顾快速变化和稳定性。

$$
p_t^{\mathrm{SW}}=\frac{1}{W}\sum_{i=t-W+1}^{t}p_i
$$

$$
p_t^{\mathrm{EMA}}=\beta p_{t-1}^{\mathrm{EMA}}+(1-\beta)p_t
$$

$$
p_t^{\mathrm{fused}}=\lambda p_t^{\mathrm{SW}}+(1-\lambda)p_t^{\mathrm{EMA}}
$$

短期和长期估计的偏差超过阈值时，触发偏好/提示更新；权重平衡响应速度与稳定性。论文报告中等范围的 λ 和 β 较稳健。

### 它解决什么、没有直接解决什么

| PAMU 负责 | PAMU 不直接替代 |
| --- | --- |
| 跟踪用户表达与偏好风格变化 | 原记忆系统的事实存储和检索 |
| 把当前偏好变成显式提示条件 | 选择当前问题需要的全部历史证据 |
| 可插入多个现有记忆基线 | 判断一条旧事实在当前情境是否真实适用 |

---

## 第 3 页 / 共 4 页｜机制、实验与诊断

### 实验设置

| 项目 | 论文报告 |
| --- | --- |
| 数据集 | LoCoMo：50 段对话，平均约 300 轮，最多 35 个会话 |
| 任务 | 单跳 2,705、多跳 1,104、时间推理 1,547 个问题 |
| 基线记忆系统 | ReadAgent、MemoryBank、MemGPT、A-MEM 等 |
| 模型 | Qwen2.5-1.5B/3B、Llama 3.2-1.5B/3B、Llama-7B/30B |
| 评估 | F1 与 BLEU-1；结果为 3 次运行平均并进行配对 t 检验 |

**原文表 1–3：** 结果均按“加入 PAMU 前 / 后”报告，分别覆盖单跳、多跳和时间推理。

![原文表 1：单跳任务结果](/assets/images/paper-cheatsheets/pamu-preference-aware-memory-update/table1_single_hop.png)

![原文表 2：多跳任务结果](/assets/images/paper-cheatsheets/pamu-preference-aware-memory-update/table2_multi_hop.png)

![原文表 3：时间推理结果](/assets/images/paper-cheatsheets/pamu-preference-aware-memory-update/table3_temporal_reasoning.png)

### 一项可读的结果

以时间推理中的 A-MEM + LLaMA-7B 为例，F1 从 17.55 提升至 23.23，BLEU-1 从 14.67 提升至 21.46。其他基线也报告了类似的质量提升；不同模型规模和任务上的数值不能混为一列。

**原文表 5：** 去掉 SW、EMA、变化检测或提示注入等模块，综合表现均低于完整 PAMU。

![原文表 5：PAMU 消融实验](/assets/images/paper-cheatsheets/pamu-preference-aware-memory-update/table5_ablation.png)

### 结果审计

- **贡献范围：** PAMU 是偏好建模和提示控制模块，论文把它插入多种记忆系统做前后对比。
- **解释限制：** F1/BLEU-1 衡量答案质量，不直接度量偏好抽取准确率或旧偏好误用率。
- **实现依赖：** 多维偏好由分类器、长度统计和信息抽取器生成；这些提取器的误差会传入更新信号。
- **部署成本：** 论文使用多个分类/抽取组件，需把它们的推理延迟和错误率纳入复现。

---

## 第 4 页 / 共 4 页｜选型、决策与开放问题

### 适用场景

| 观察到的问题 | PAMU 的对应机制 | 必须核查 |
| --- | --- | --- |
| 用户最近改变回复长度/语气 | SW 快速捕捉近期变化 | 变化信号是否源自真实反馈 |
| 长期倾向稳定但偶有波动 | EMA 平滑长期趋势 | EMA 是否让变化响应过慢 |
| 多个偏好维度同时变化 | 多维向量和偏差检测 | 不同维度是否被错误合并 |
| 旧画像覆盖新偏好 | 动态重写偏好提示 | 是否保留变化时间和适用情境 |

**决策顺序：** 先验证偏好抽取器，再单测短期/长期估计和阈值触发；最后固定基线记忆系统，比较增加 PAMU 前后的答案质量、偏好一致性和误用率。

### 阅读路线与检查

**优先顺序：** 图 1 → §3.1（五维偏好抽取）→ §3.2（SW/EMA 与变化检测）→ 表 1–3（主结果）→ 表 5（消融）→ 限制。

- [ ] 能解释 SW 与 EMA 分别代表什么时间尺度。
- [ ] 能指出 PAMU 改的是偏好控制信号，而非原记忆检索器。
- [ ] 能区分回答质量指标与偏好变化检测指标。

**原文入口：** [ACL Anthology 正式页](https://aclanthology.org/2026.findings-acl.38/) · [本地 PDF](https://aclanthology.org/2026.findings-acl.38.pdf)
