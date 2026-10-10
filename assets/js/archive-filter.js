(() => {
  const filters = document.querySelector("[data-archive-filters]");
  if (!filters) return;

  const buttons = Array.from(filters.querySelectorAll("[data-category]"));
  const rows = Array.from(document.querySelectorAll(".archive-row[data-categories]"));
  const yearGroups = Array.from(document.querySelectorAll("[data-year-group]"));
  const status = document.querySelector("#archive-status");
  const emptyState = document.querySelector("#archive-filter-empty");

  const applyFilter = (selectedCategory) => {
    let visibleCount = 0;

    rows.forEach((row) => {
      const categories = (row.dataset.categories || "")
        .split("|")
        .map((category) => category.trim());
      const matches = selectedCategory === "all" || categories.includes(selectedCategory);
      row.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    yearGroups.forEach((group) => {
      group.hidden = !group.querySelector(".archive-row:not([hidden])");
    });

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.category === selectedCategory));
    });

    emptyState.hidden = visibleCount > 0;
    status.textContent = selectedCategory === "all"
      ? `全部栏目 · ${visibleCount} 篇文章`
      : `栏目：${selectedCategory} · ${visibleCount} 篇文章`;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.category));
  });

  applyFilter("all");
})();
