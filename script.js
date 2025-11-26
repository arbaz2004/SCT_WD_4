// ----- Data -----
const STORAGE_KEY = "advanced_todo_tasks_v1";

let tasks = loadTasks();
let currentFilter = "all";
let currentSearch = "";
let currentSort = "created-desc";

// ----- Elements -----
const taskTitleInput = document.getElementById("task-title");
const taskDateInput = document.getElementById("task-date");
const taskPrioritySelect = document.getElementById("task-priority");
const addBtn = document.getElementById("add-btn");
const taskListEl = document.getElementById("task-list");
const filterChips = document.querySelectorAll(".filter-chip");
const searchBox = document.getElementById("search-box");
const sortSelect = document.getElementById("sort-select");
const clearCompletedBtn = document.getElementById("clear-completed");
const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");

// ----- Init -----
render();

// ----- Event Listeners -----
addBtn.addEventListener("click", handleAddTask);

taskTitleInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") handleAddTask();
});

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentFilter = chip.dataset.filter;
    render();
  });
});

searchBox.addEventListener("input", () => {
  currentSearch = searchBox.value.toLowerCase();
  render();
});

sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  render();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  render();
});

// Event delegation for list actions
taskListEl.addEventListener("click", (e) => {
  const row = e.target.closest(".task-row");
  if (!row) return;
  const id = row.dataset.id;

  if (e.target.matches(".task-checkbox")) {
    toggleComplete(id);
  } else if (e.target.matches(".icon-btn.delete")) {
    deleteTask(id);
  } else if (e.target.matches(".icon-btn.edit")) {
    startInlineEdit(row, id);
  }
});

taskListEl.addEventListener("dblclick", (e) => {
  const titleEl = e.target.closest(".task-title");
  if (!titleEl) return;
  const row = e.target.closest(".task-row");
  const id = row.dataset.id;
  startInlineEdit(row, id);
});

// ----- Functions -----
function handleAddTask() {
  const title = taskTitleInput.value.trim();
  const date = taskDateInput.value; // yyyy-mm-dd
  const priority = taskPrioritySelect.value;

  if (!title) {
    taskTitleInput.focus();
    return;
  }

  const now = new Date().toISOString();

  const newTask = {
    id: Date.now().toString(),
    title,
    due: date || null,       // store date string
    priority,
    completed: false,
    createdAt: now
  };

  tasks.unshift(newTask);
  saveTasks();
  render();

  taskTitleInput.value = "";
  taskDateInput.value = "";
  taskPrioritySelect.value = "medium";
  taskTitleInput.focus();
}

function toggleComplete(id) {
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function startInlineEdit(rowEl, id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const titleEl = rowEl.querySelector(".task-title");
  if (!titleEl) return;

  const current = task.title;
  const input = document.createElement("input");
  input.type = "text";
  input.value = current;
  input.style.width = "100%";
  input.style.borderRadius = "999px";
  input.style.border = "1px solid rgba(148,163,184,0.8)";
  input.style.background = "#020617";
  input.style.color = "#e5e7eb";
  input.style.fontSize = "0.8rem";
  input.style.padding = "0.2rem 0.45rem";

  titleEl.replaceWith(input);
  input.focus();
  input.select();

  const finish = (save) => {
    const newTitle = input.value.trim();
    let finalTitle = current;
    if (save && newTitle) {
      finalTitle = newTitle;
      tasks = tasks.map((t) =>
        t.id === id ? { ...t, title: finalTitle } : t
      );
      saveTasks();
    }
    render();
  };

  input.addEventListener("blur", () => finish(true));
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") finish(true);
    else if (e.key === "Escape") finish(false);
  });
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filtered = tasks.filter((t) => {
    if (currentFilter === "active" && t.completed) return false;
    if (currentFilter === "completed" && !t.completed) return false;
    if (currentFilter === "overdue") {
      if (!t.due) return false;
      if (t.completed) return false;
      const d = parseDateOnly(t.due);
      if (!d || d >= today) return false;
    }
    if (currentSearch) {
      return t.title.toLowerCase().includes(currentSearch);
    }
    return true;
  });

  filtered.sort((a, b) => {
    switch (currentSort) {
      case "created-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "created-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "due-asc":
        return (a.due || "").localeCompare(b.due || "");
      case "due-desc":
        return (b.due || "").localeCompare(a.due || "");
      case "priority-desc":
        return priorityWeight(b.priority) - priorityWeight(a.priority);
      case "priority-asc":
        return priorityWeight(a.priority) - priorityWeight(b.priority);
      default:
        return 0;
    }
  });

  if (!filtered.length) {
    taskListEl.innerHTML = `
      <div class="empty-state">
        <span>📝</span>
        No tasks here. Add something you want to get done today!
      </div>
    `;
  } else {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    taskListEl.innerHTML = filtered
      .map((t) => taskRowTemplate(t, now))
      .join("");
  }

  statTotal.textContent = tasks.length;
  statCompleted.textContent = tasks.filter((t) => t.completed).length;
}

function taskRowTemplate(task, today) {
  const d = task.due ? parseDateOnly(task.due) : null;
  const isOverdue = d && !task.completed && d < today;
  const dueLabel = formatDue(task.due, isOverdue);

  const rowClasses = [
    "task-row",
    task.completed ? "completed" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <article class="${rowClasses}" data-id="${task.id}">
      <input type="checkbox" class="task-checkbox" ${
        task.completed ? "checked" : ""
      } />
      <div class="task-main">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          Created ${formatRelative(task.createdAt)}
          ${
            isOverdue
              ? ' • <span style="color:#f97373">Overdue</span>'
              : ""
          }
        </div>
      </div>
      <div class="task-due">${dueLabel}</div>
      <div class="task-priority ${priorityClass(task.priority)}">
        ${task.priority}
      </div>
      <div class="task-actions">
        <button class="icon-btn edit" title="Edit task">✏</button>
        <button class="icon-btn delete" title="Delete task">🗑</button>
      </div>
    </article>
  `;
}

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function priorityWeight(p) {
  if (p === "high") return 3;
  if (p === "medium") return 2;
  return 1;
}

function priorityClass(p) {
  if (p === "high") return "priority-high";
  if (p === "medium") return "priority-medium";
  return "priority-low";
}

function formatDue(due, isOverdue) {
  if (!due) return '<span style="color:#6b7280">No deadline</span>';
  const d = parseDateOnly(due);
  if (!d) return "—";

  const label = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const color = isOverdue ? "#fecaca" : "#e5e7eb";
  return `<span style="color:${color}">${label}</span>`;
}

function formatRelative(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return diffMin + " mins ago";
  const diffH = Math.round(diffMin / 60);
  if (diffH === 1) return "1 hour ago";
  if (diffH < 24) return diffH + " hours ago";
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return "1 day ago";
  if (diffD < 7) return diffD + " days ago";
  const diffW = Math.round(diffD / 7);
  if (diffW === 1) return "1 week ago";
  return diffW + " weeks ago";
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
