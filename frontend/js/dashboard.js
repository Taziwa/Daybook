document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
  document.getElementById('user-name').textContent = user.name || 'there';

  const taskListEl = document.getElementById('task-list');
  const emptyStateEl = document.getElementById('empty-state');
  const addForm = document.getElementById('add-task-form');
  const titleInput = document.getElementById('task-title-input');
  const errorBox = document.getElementById('error-box');
  const logoutBtn = document.getElementById('logout-btn');
  const progressRing = document.getElementById('progress-ring-fill');
  const progressLabel = document.getElementById('progress-label');

  const RADIUS = 26;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  progressRing.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;

  let tasks = [];

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const fraction = total === 0 ? 0 : done / total;
    progressRing.style.strokeDashoffset = CIRCUMFERENCE - fraction * CIRCUMFERENCE;
    progressLabel.textContent = `${done}/${total}`;
  }

  function renderTasks() {
    taskListEl.innerHTML = '';
    emptyStateEl.style.display = tasks.length === 0 ? 'block' : 'none';
    emptyStateEl.textContent = 'No tasks yet — add your first one above.';

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task._id;
      li.innerHTML = `
        <button class="task-check" type="button" aria-label="Mark '${escapeHtml(task.title)}' as ${
        task.completed ? 'not done' : 'done'
      }"></button>
        <span class="task-title" contenteditable="true" tabindex="0" role="textbox" aria-label="Task title, click to edit">${escapeHtml(
          task.title
        )}</span>
        <button class="task-delete" type="button" aria-label="Delete '${escapeHtml(task.title)}'">&times;</button>
      `;
      taskListEl.appendChild(li);
    });

    updateProgress();
  }

  async function loadTasks() {
    try {
      tasks = await apiRequest('/tasks');
      renderTasks();
    } catch (error) {
      emptyStateEl.style.display = 'block';
      emptyStateEl.textContent = 'Could not load your tasks.';
      errorBox.textContent = error.message;
    }
  }

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;

    errorBox.textContent = '';

    try {
      const newTask = await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      tasks.unshift(newTask);
      titleInput.value = '';
      renderTasks();
      titleInput.focus();
    } catch (error) {
      errorBox.textContent = error.message;
    }
  });

  // One delegated listener handles clicks on every task's checkbox and delete button,
  // instead of attaching a separate listener to every single task in the list.
  taskListEl.addEventListener('click', async (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    const task = tasks.find((t) => t._id === li.dataset.id);
    if (!task) return;

    if (e.target.classList.contains('task-check')) {
      try {
        const updated = await apiRequest(`/tasks/${task._id}`, {
          method: 'PUT',
          body: JSON.stringify({ completed: !task.completed }),
        });
        Object.assign(task, updated);
        renderTasks();
      } catch (error) {
        errorBox.textContent = error.message;
      }
    }

    if (e.target.classList.contains('task-delete')) {
      try {
        await apiRequest(`/tasks/${task._id}`, { method: 'DELETE' });
        tasks = tasks.filter((t) => t._id !== task._id);
        renderTasks();
      } catch (error) {
        errorBox.textContent = error.message;
      }
    }
  });

  // Saves an edited title when the editable span loses focus.
  // blur doesn't bubble, so this listener is registered on the capturing phase instead.
  taskListEl.addEventListener(
    'blur',
    async (e) => {
      if (!e.target.classList || !e.target.classList.contains('task-title')) return;
      const li = e.target.closest('.task-item');
      const task = tasks.find((t) => t._id === li.dataset.id);
      if (!task) return;

      const newTitle = e.target.textContent.trim();

      if (!newTitle || newTitle === task.title) {
        e.target.textContent = task.title;
        return;
      }

      try {
        const updated = await apiRequest(`/tasks/${task._id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: newTitle }),
        });
        task.title = updated.title;
      } catch (error) {
        errorBox.textContent = error.message;
        e.target.textContent = task.title;
      }
    },
    true
  );

  taskListEl.addEventListener('keydown', (e) => {
    if (!e.target.classList.contains('task-title')) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }

    if (e.key === 'Escape') {
      const li = e.target.closest('.task-item');
      const task = tasks.find((t) => t._id === li.dataset.id);
      if (task) e.target.textContent = task.title;
      e.target.blur();
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'index.html';
  });

  loadTasks();
});
