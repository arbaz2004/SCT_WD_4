let tasks = [];
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
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
  renderTasks();
}

// 🚪 Logout
function logout() {
  localStorage.removeItem("currentUser");
  showNotification("👋 Logged out!");
  setTimeout(() => location.reload(), 800);
}

// 💾 Save tasks under the current user's account
function saveTasks() {
  localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
  updateStats();
}

function renderTasks(filter = "all") {
  taskList.innerHTML = "";
  const filtered = tasks.filter(
    t => filter === "all" || (filter === "completed" && t.completed) || (filter === "pending" && !t.completed)
  );

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task`;
    li.innerHTML = `
      <span><strong>${task.text}</strong> 
      <small>${task.date ? '(' + new Date(task.date).toLocaleString() + ')' : ''}</small></span>
      <div class="task-buttons">
        <button class="complete" title="Mark as Completed" onclick="toggleComplete(${index})">✅</button>
        <button class="edit" title="Edit Task" onclick="editTask(${index})">✏️</button>
        <button class="priority" title="Toggle Priority" onclick="togglePriority(${index})">⚡</button>
        <button class="delete" title="Delete Task" onclick="deleteTask(${index})">🗑️</button>
      </div>`;
    if (task.priority === "high") li.style.borderLeft = "5px solid #fdcb6e";
    taskList.appendChild(li);
  });
  updateStats();
}

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

// ✅ Updated: Remove task when completed
function toggleComplete(index) {
  const completedTask = tasks.splice(index, 1)[0];
  saveTasks();
  renderTasks();
  showNotification(`🎉 Task "${completedTask.text}" completed successfully!`);
}

function editTask(index) {
  const newText = prompt("Edit task:", tasks[index].text);
  if (newText) {
    tasks[index].text = newText;
    saveTasks();
    renderTasks();
    showNotification("✏️ Task updated successfully!");
  }
}

function deleteTask(index) {
  const deleted = tasks[index].text;
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  showNotification(`🗑️ Task "${deleted}" deleted!`);
}

function togglePriority(index) {
  tasks[index].priority = tasks[index].priority === "high" ? "normal" : "high";
  saveTasks();
  renderTasks();
}

function filterTasks(type) {
  renderTasks(type);
}

function clearAll() {
  tasks = [];
  saveTasks();
  renderTasks();
  showNotification("🧹 All tasks cleared!");
}

function searchTasks() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  const filtered = tasks.filter(t => t.text.toLowerCase().includes(query));
  taskList.innerHTML = "";
  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = "task";
    li.innerHTML = `<span><strong>${task.text}</strong></span>`;
    taskList.appendChild(li);
  });
}

function updateStats() {
  const total = tasks.length;
  const completed = 0; // no longer tracked since we delete completed
  const pending = total;
  taskStats.innerHTML = `Total: ${total} | ✅ Completed: ${completed} | ⏳ Pending: ${pending}`;
}

function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 3000);
}

renderTasks();
