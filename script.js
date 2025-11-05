const taskList = document.getElementById('taskList');
const taskStats = document.getElementById('taskStats');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  updateStats();
}

function renderTasks(filter = 'all') {
  taskList.innerHTML = '';
  const filtered = tasks.filter(
    t => filter === 'all' || 
    (filter === 'completed' && t.completed) || 
    (filter === 'pending' && !t.completed)
  );

  filtered.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span><strong>${task.text}</strong> 
      <small>${task.date ? '(' + new Date(task.date).toLocaleString() + ')' : ''}</small></span>
      <div class="task-buttons">
        <button class="complete" title="Mark as Completed" onclick="toggleComplete(${index})">✅</button>
        <button class="edit" title="Edit Task" onclick="editTask(${index})">✏️</button>
        <button class="priority" title="Toggle Priority" onclick="togglePriority(${index})">⚡</button>
        <button class="delete" title="Delete Task" onclick="deleteTask(${index})">🗑️</button>
      </div>`;
    if (task.priority === 'high') li.style.borderLeft = '5px solid #fdcb6e';
    taskList.appendChild(li);
  });
  updateStats();
}

function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const date = document.getElementById('taskDate').value;
  const priority = document.getElementById('priority').value;
  if (!text) {
    showNotification('⚠️ Please enter a task!');
    return;
  }
  tasks.push({ text, date, completed: false, priority });
  saveTasks();
  renderTasks();
  showNotification('✅ Task added successfully!');
  document.getElementById('taskInput').value = '';
  document.getElementById('taskDate').value = '';
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function editTask(index) {
  const newText = prompt('Edit task:', tasks[index].text);
  if (newText) {
    tasks[index].text = newText;
    saveTasks();
    renderTasks();
    showNotification('✏️ Task updated successfully!');
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  showNotification('🗑️ Task deleted!');
}

function togglePriority(index) {
  tasks[index].priority = tasks[index].priority === 'high' ? 'normal' : 'high';
  saveTasks();
  renderTasks();
}

function filterTasks(type) {
  renderTasks(type);
}

// ✅ Replaced the confirm() popup with a custom modal
function clearAll() {
  const modal = document.createElement('div');
  modal.className = 'confirm-modal';
  modal.innerHTML = `
    <div class="confirm-box">
      <p>🧹 Are you sure you want to clear all tasks?</p>
      <div class="confirm-actions">
        <button class="yes" onclick="confirmClear(true)">Yes</button>
        <button class="no" onclick="confirmClear(false)">No</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function confirmClear(confirm) {
  const modal = document.querySelector('.confirm-modal');
  if (confirm) {
    tasks = [];
    saveTasks();
    renderTasks();
    showNotification('🧼 All tasks cleared!');
  }
  modal.remove();
}

function searchTasks() {
  const query = document.getElementById('searchBox').value.toLowerCase();
  const filtered = tasks.filter(t => t.text.toLowerCase().includes(query));
  taskList.innerHTML = '';
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `<span><strong>${task.text}</strong></span>`;
    taskList.appendChild(li);
  });
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  taskStats.innerHTML = `Total: ${total} | ✅ Completed: ${completed} | ⏳ Pending: ${pending}`;
}

function showNotification(message) {
  const note = document.getElementById('notification');
  note.textContent = message;
  note.classList.add('show');
  setTimeout(() => note.classList.remove('show'), 3000);
}

renderTasks();
