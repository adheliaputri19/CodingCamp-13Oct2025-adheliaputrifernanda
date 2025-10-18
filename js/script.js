const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const dateInput = document.getElementById('dateInput');
const filterSelect = document.getElementById('filterSelect');
const todoList = document.getElementById('todoList');
const taskError = document.getElementById('taskError');
const dateError = document.getElementById('dateError');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

document.addEventListener('DOMContentLoaded', function() {
    todoForm.addEventListener('submit', addTodo);
    filterSelect.addEventListener('change', filterTodos);
    renderTodos();
});

function addTodo(e) {
    e.preventDefault();
    
    resetErrors();

    const task = todoInput.value.trim();
    const date = dateInput.value;
    
    let isValid = true;
    
    if (task === '') {
        taskError.style.display = 'block';
        isValid = false;
    }
    
    if (date === '') {
        dateError.style.display = 'block';
        isValid = false;
    }
    
    if (!isValid) return;
    
    const newTodo = {
        id: Date.now(),
        task: task,
        date: date,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    
    saveTodos();
    
    renderTodos();
    
    todoForm.reset();
}

function deleteTodo(id) {

    todos = todos.filter(todo => todo.id !== id);
    
    saveTodos();
    
    renderTodos();
}

function toggleComplete(id) {

    const todo = todos.find(todo => todo.id === id);
    
    
    if (todo) {
        todo.completed = !todo.completed;
        
        saveTodos();

        renderTodos();
    }
}

function filterTodos() {
    renderTodos();
}

function renderTodos() {

    todoList.innerHTML = '';
    
    const filter = filterSelect.value;
    
    let filteredTodos = [...todos];
    
    if (filter === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed && !isOverdue(todo.date));
    } else if (filter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else if (filter === 'overdue') {
        filteredTodos = todos.filter(todo => !todo.completed && isOverdue(todo.date));
    }
    
    filteredTodos.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 16H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 12H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 16H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>No tasks found</h3>
            <p>Add a new task using the form above</p>
        `;
        todoList.appendChild(emptyState);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        if (todo.completed) {
            li.classList.add('completed');
        } else if (isOverdue(todo.date)) {
            li.classList.add('overdue');
        }
        
        const formattedDate = formatDate(todo.date);
        
        li.innerHTML = `
            <div class="todo-content">
                <div class="todo-title">${todo.task}</div>
                <div class="todo-date">Due: ${formattedDate}</div>
            </div>
            <div class="todo-actions">
                <button class="btn" onclick="toggleComplete(${todo.id})">
                    ${todo.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

function isOverdue(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function resetErrors() {
    taskError.style.display = 'none';
    dateError.style.display = 'none';
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}