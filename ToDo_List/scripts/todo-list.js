let todoList = JSON.parse(localStorage.getItem('todoList')) || [{
  name:'make dinner',
  dueDate: '2027-12-22',
  priority: 'Medium'
}]

renderTodoList();

function renderTodoList(){

  let todoListHtml = ''
    
  todoList.forEach((todoObject, index) =>{
    const {name, dueDate, priority} = todoObject
    const priorityColor = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
    const html = `
      <div class="todo-item">
        <div class="todo-name">${name}</div>
        <div class="todo-date">${dueDate}</div>
        <div class="todo-priority" style="color: ${priorityColor}; font-weight: bold;">${priority}</div>
        <button class="delete-todo-button js-delete-todo-button">Delete</button> 
       </div>
    `
    todoListHtml += html   
  });

  document.querySelector('.js-todo-list')
    .innerHTML = todoListHtml;

  document.querySelectorAll('.js-delete-todo-button')
  .forEach((deleteButton, index) => {
    deleteButton.addEventListener('click', () => {
      todoList.splice(index, 1);
      saveToLocalStorage();
      renderTodoList();
    }) 
  });

  enableEditing();

  enableDragAndDrop();
}


document.querySelector('.js-add-todo-button')
  .addEventListener('click', () => {
    validateDate();
});

document.querySelector('.js-name-input').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    validateDate();
  }
});

document.querySelector('.js-order-button').addEventListener('click', () =>{
  orderByPriorityAndDate()
});

document.querySelector('.js-clear-button').addEventListener('click', () => {
  clearList()
})

function orderByPriorityAndDate(){
  
  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
  todoList.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  saveToLocalStorage();
  renderTodoList();

}

function saveToLocalStorage() {
  localStorage.setItem('todoList', JSON.stringify(todoList));
}

function addTodo() {
  const inputElement = document.querySelector('.js-name-input');
  const name = inputElement.value;

  const dateInputElement = document.querySelector('.js-due-date-input');
  const dueDate = dateInputElement.value;

  const priority = document.querySelector('.js-priority-input').value;

  todoList.push({
    name: name,
    dueDate: dueDate,
    priority: priority
  });

  inputElement.value = '';
  saveToLocalStorage();
  renderTodoList();
}

function validateDate() {
  const dateInputElement = document.querySelector('.js-due-date-input');
  const errorMessage = document.querySelector('.js-date-error');

  const selectedDate = new Date(dateInputElement.value);
  const today = new Date();
  today.setHours(0,0,0,0);

  const input = document.querySelector('.js-name-input');

  console.log(selectedDate)
  if (input.value === '' || !dateInputElement.value || selectedDate < today) {
    errorMessage.textContent = 'Error: Date cannot be in the past! Or Input text empty';
    errorMessage.style.display = 'block';
  } else {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    addTodo()
  }

}

document.querySelector('.js-dark-mode-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

function enableEditing() {
  document.querySelectorAll('.todo-name').forEach((taskElement, index) => {
    taskElement.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = taskElement.textContent;
      input.classList.add('edit-input');

      taskElement.replaceWith(input);
      input.focus();

      input.addEventListener('blur', () => saveEdit(input, index));
      input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') saveEdit(input, index);
      });
    });
  });
}

function saveEdit(input, index) {
  todoList[index].name = input.value;
  saveToLocalStorage();
  renderTodoList();
}

function enableDragAndDrop() {
  const listItems = document.querySelectorAll('.todo-item');

  listItems.forEach((item, index) => {
    item.draggable = true;

    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = e.dataTransfer.getData('text/plain');
      const toIndex = index;
      reorderTasks(fromIndex, toIndex);
    });
  });
}

function reorderTasks(fromIndex, toIndex) {
  const movedItem = todoList.splice(fromIndex, 1)[0];
  todoList.splice(toIndex, 0, movedItem);
  saveToLocalStorage();
  renderTodoList();
}

function clearList() {
  const popup = document.getElementById("confirm-popup");
  popup.classList.add("show");

  document.getElementById("confirm-delete").onclick = function () {
    todoList = [];
    saveToLocalStorage();
    renderTodoList();
    popup.classList.remove("show");
  };

  document.getElementById("cancel-delete").onclick = function () {
    popup.classList.remove("show");
  };
}

