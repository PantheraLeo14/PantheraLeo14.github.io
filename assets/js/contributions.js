(() => {
  const dataElement = document.getElementById("contribution-posts");
  const section = document.getElementById("contributions");
  const yearSelect = document.getElementById("contribution-year");
  const summary = document.getElementById("contribution-summary");
  const monthLabels = document.getElementById("contribution-months");
  const grid = document.getElementById("contribution-grid");

  if (!dataElement || !section || !yearSelect || !summary || !monthLabels || !grid) return;

  let posts = [];
  try {
    posts = JSON.parse(dataElement.textContent || "[]");
  } catch (error) {
    summary.textContent = "文章数据暂时无法读取。";
    return;
  }

  const currentYear = Number(section.dataset.currentYear) || new Date().getFullYear();
  const postCounts = new Map();
  posts.forEach((post) => {
    if (!post || !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) return;
    const entry = postCounts.get(post.date) || { count: 0, titles: [] };
    entry.count += 1;
    if (post.title) entry.titles.push(post.title);
    postCounts.set(post.date, entry);
  });

  const years = new Set([currentYear]);
  postCounts.forEach((_, date) => years.add(Number(date.slice(0, 4))));
  [...years].sort((a, b) => b - a).forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = `${year} 年`;
    yearSelect.append(option);
  });

  const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const levelFor = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  };

  const renderYear = (year) => {
    const start = new Date(year, 0, 1);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(year, 11, 31);
    end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
    const dayCount = Math.round((end - start) / 86400000) + 1;
    const weekCount = dayCount / 7;
    const fragment = document.createDocumentFragment();
    const byYear = [...postCounts.entries()].filter(([date]) => Number(date.slice(0, 4)) === year);
    const activeDays = byYear.filter(([, item]) => item.count > 0).length;
    const articleCount = byYear.reduce((total, [, item]) => total + item.count, 0);
    summary.textContent = `${year} 年发布 ${articleCount} 篇文章，分布在 ${activeDays} 天。`;

    monthLabels.replaceChildren();
    monthLabels.style.setProperty("--week-count", weekCount);
    for (let month = 0; month < 12; month += 1) {
      const monthStart = new Date(year, month, 1);
      const week = Math.floor((monthStart - start) / 86400000 / 7);
      const label = document.createElement("span");
      label.textContent = `${month + 1}月`;
      label.style.gridColumnStart = String(week + 1);
      monthLabels.append(label);
    }

    for (let offset = 0; offset < dayCount; offset += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      const key = dateKey(date);
      const entry = postCounts.get(key) || { count: 0, titles: [] };
      const cell = document.createElement("span");
      const inYear = date.getFullYear() === year;
      cell.className = `contribution-day contribution-level-${levelFor(entry.count)}${inYear ? "" : " contribution-outside"}`;
      cell.setAttribute("aria-hidden", "true");
      if (inYear) {
        const countText = entry.count === 1 ? "1 篇文章" : `${entry.count} 篇文章`;
        const titleText = entry.titles.length ? `：${entry.titles.join("、")}` : "";
        cell.title = `${year}年${date.getMonth() + 1}月${date.getDate()}日 · ${countText}${titleText}`;
      }
      fragment.append(cell);
    }

    grid.replaceChildren(fragment);
    grid.style.setProperty("--week-count", weekCount);
    grid.setAttribute("aria-label", `${year} 年发布 ${articleCount} 篇文章，分布在 ${activeDays} 天。`);
  };

  yearSelect.value = String(currentYear);
  yearSelect.addEventListener("change", () => renderYear(Number(yearSelect.value)));
  renderYear(currentYear);
})();
