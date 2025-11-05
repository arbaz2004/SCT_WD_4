let tasks = [];
let completedTasks = [];
let currentUser = localStorage.getItem("currentUser");

const taskList = document.getElementById("taskList");
const taskStats = document.getElementById("taskStats");
const loginContainer = document.getElementById("loginContainer");
const todoContainer = document.getElementById("todoContainer");

if (currentUser) loadUserData();

// 🔐 Login
function login() {
  const username = document.getElementById("username").value.trim();
  if (!username) return showNotification("⚠️ Please enter a username!");

  localStorage.setItem("currentUser", username);
  currentUser = username;
  loadUserData();
  showNotification(`👋 Welcome, ${username}!`);
}

function loadUserData() {
  loginContainer.classList.add("hidden");
  todoContainer.classList.remove("hidden");
  const storedTasks = localStorage.getItem(`tasks_${currentUser}`);
  const storedCompleted = localStorage.getItem(`completed_${currentUser}`);
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
  completedTasks = storedCompleted ? JSON.parse(storedCompleted) : [];
  renderTasks();
}

// 🚪 Logout
function logout() {
  localStorage.removeItem("currentUser");
  showNotification("👋 Logged out!");
  setTimeout(() => location.reload(), 800);
}

// 💾 Save tasks
function saveTasks() {
  localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
  localStorage.setItem(`completed_${currentUser}`, JSON.stringify(completedTasks));
  updateStats();
}

// 🧾 Render tasks based on filter
function renderTasks(filter = "all") {
  taskList.innerHTML = "";
  let displayList = [];

  if (filter === "all") displayList = [...tasks, ...completedTasks];
  else if (filter === "completed") displayList = completedTasks;
  else if (filter === "pending") displayList = tasks;

  displayList.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
      <span><strong>${task.text}</strong> 
      <small>${task.date ? '(' + new Date(task.date).toLocaleString() + ')' : ''}</small></span>
      <div class="task-buttons">
        ${
          !task.completed
            ? `<button class="complete" title="Mark as Completed" onclick="toggleComplete(${index})">✅</button>`
            : ""
        }
        <button class="edit" title="Edit Task" onclick="editTask(${index}, '${filter}')">✏️</button>
        <button class="priority" title="Toggle Priority" onclick="togglePriority(${index}, '${filter}')">⚡</button>
        <button class="delete" title="Delete Task" onclick="deleteTask(${index}, '${filter}')">🗑️</button>
      </div>`;
    if (task.priority === "high") li.style.borderLeft = "5px solid #fdcb6e";
    taskList.appendChild(li);
  });

  updateStats();
}

// ➕ Add task
function addTask() {
  const text = document.getElementById("taskInput").value.trim();
  const date = document.getElementById("taskDate").value;
  const priority = document.getElementById("priority").value;

  if (!text) return showNotification("⚠️ Please enter a task!");
  tasks.push({ text, date, completed: false, priority });
  saveTasks();
  renderTasks();
  showNotification("✅ Task added successfully!");
  document.getElementById("taskInput").value = "";
  document.getElementById("taskDate").value = "";
}

// ✅ Mark complete → Move to completed list
function toggleComplete(index) {
  const completedTask = tasks.splice(index, 1)[0];
  completedTask.completed = true;
  completedTasks.push(completedTask);
  saveTasks();
  renderTasks();
  showNotification(`🎉 Task "${completedTask.text}" completed successfully!`);
}

// ✏️ Edit task (works for both lists)
function editTask(index, filter) {
  const list = filter === "completed" ? completedTasks : tasks;
  const newText = prompt("Edit task:", list[index].text);
  if (newText) {
    list[index].text = newText;
    saveTasks();
    renderTasks(filter);
    showNotification("✏️ Task updated successfully!");
  }
}

// 🗑️ Delete task (works for both lists)
function deleteTask(index, filter) {
  const list = filter === "completed" ? completedTasks : tasks;
  const deleted = list[index].text;
  list.splice(index, 1);
  saveTasks();
  renderTasks(filter);
  showNotification(`🗑️ Task "${deleted}" deleted!`);
}

// ⚡ Toggle priority
function togglePriority(index, filter) {
  const list = filter === "completed" ? completedTasks : tasks;
  list[index].priority = list[index].priority === "high" ? "normal" : "high";
  saveTasks();
  renderTasks(filter);
}

// 🔍 Search tasks
function searchTasks() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  const allTasks = [...tasks, ...completedTasks];
  const filtered = allTasks.filter(t => t.text.toLowerCase().includes(query));
  taskList.innerHTML = "";
  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    li.innerHTML = `<span><strong>${task.text}</strong></span>`;
    taskList.appendChild(li);
  });
}

// 🧹 Clear all
function clearAll() {
  tasks = [];
  completedTasks = [];
  saveTasks();
  renderTasks();
  showNotification("🧹 All tasks cleared!");
}

// 📊 Update Stats
function updateStats() {
  const total = tasks.length + completedTasks.length;
  const completed = completedTasks.length;
  const pending = tasks.length;
  taskStats.innerHTML = `Total: ${total} | ✅ Completed: ${completed} | ⏳ Pending: ${pending}`;
}

// 🔔 Notification
function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 3000);
}

renderTasks();
