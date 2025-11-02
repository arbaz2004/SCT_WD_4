const taskInput = document.getElementById("taskInput");
const taskDateTime = document.getElementById("taskDateTime");
const taskList = document.getElementById("taskList");

function addTask() {
  const taskText = taskInput.value.trim();
  const taskTime = taskDateTime.value;

  if (taskText === "") return alert("Please enter a task!");

  const li = document.createElement("li");
  li.innerHTML = `
    <span>${taskText} ${taskTime ? `📅 ${new Date(taskTime).toLocaleString()}` : ""}</span>
    <div class="actions">
      <button onclick="toggleComplete(this)">✅</button>
      <button onclick="editTask(this)">✏️</button>
      <button onclick="deleteTask(this)">🗑️</button>
    </div>
  `;

  taskList.appendChild(li);
  taskInput.value = "";
  taskDateTime.value = "";
}

function toggleComplete(btn) {
  btn.parentElement.parentElement.classList.toggle("completed");
}

function editTask(btn) {
  const li = btn.parentElement.parentElement;
  const text = prompt("Edit your task:", li.firstChild.textContent.trim());
  if (text) li.firstChild.textContent = text;
}

function deleteTask(btn) {
  btn.parentElement.parentElement.remove();
}
