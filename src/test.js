import { LitElement, html } from 'lit-element'; 

const names = [ "Armin", "Eren", "Mikasa", "Ervin" ];

class TodoView extends LitElement { 

  static get properties() { 
    return {
      msg: { type: String }
    };
  }

  constructor() { 
    super();
    let msg = "Hello world";
  }

        //${this.msg + ", and " + names[names.length * Math.random() | 0]}
  render() {
    return html` 
      <div class="input-layout"
        @keyup="${this.shortcutListener}">
        ${this.msg + ", and " + names[names.length * Math.random() | 0]}
    </div> 
    `;
  }

  applyFilter(todos) {
    switch (this.filter) {
      case VisibilityFilters.SHOW_ACTIVE:
        return todos.filter(todo => !todo.complete);
      case VisibilityFilters.SHOW_COMPLETED:
        return todos.filter(todo => todo.complete);
      default:
        return todos;
    }
  }

  updateTask(e) {
    this.task = e.target.value;
  }

  addTodo() {
    if (this.task) {
      this.todos.push({ 
        task: this.task,
        complete: false
      });
      this.task = '';
      console.log(this.todos);
    }
  }

  shortcutListener(e) {
    console.log("hi");
    if (e.key === 'Enter') this.render();
  }

  updateTodoStatus(updatedTodo, complete) {
    this.todos = this.todos.map(todo =>
      updatedTodo === todo ? {...updatedTodo, complete} : todo
    );
  }
  
  createRenderRoot() { return this }
}

customElements.define('todo-view', TodoView); //
