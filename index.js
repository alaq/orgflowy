import React from 'react'
import ReactDOM from 'react-dom'

import './style.css'

const { parse } = require(`orga`)

const org = `
#+TITLE: org web view todo list
#+TODO: TODO WAITING | DONE CANCELLED

* Display
** DONE display basic text
** DONE display links
** TODO display code blocks
** TODO display multiline correctly
** WAITING limit paragraphs to two lines unless clicked
** TODO toggle for display/hidding
** TODO collapse nodes
* Manage State
** DONE have parser do its work when mounting
* Styling
** TODO styling of dates, schedule, deadlines
** TODO change colors of task state
* Editing
** Keyword editing
- [X] toggle task state on tap/click
- [X] have the toggle select the next state
- [ ] remove TODO, or toggle over
** DONE use contendEditable
** TODO generate org file after edits
** TODO link editing
* Mobile
** TODO Mobile drag and drop
Atlassian's [[https://github.com/atlassian/react-beautiful-dnd][react-beautiful-dnd]]
This is a second line
* Dropbox Compatibility
Using [[https://github.com/dropbox/dropbox-sdk-js/][the Dropbox JS SDK]]
* Bugs
** Double mounting of the component during initialization
`

const rand = () =>
  Math.random()
    .toString(36)
    .replace('0.', '')

let ast
let flatAst = {}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: 'Loading...',
      org: ''
    }
    this.keywordOnClick = this.keywordOnClick.bind(this)
    this.updateTitle = this.updateTitle.bind(this)
  }

  processNodes(nodes) {
    return nodes.map(node => {
      const key = rand()
      flatAst[key] = node
      switch (node.type) {
        case 'root':
          console.log('generating tree')
          flatAst = {}
          return (
            <div contentEditable="true" value={this.state.title} className="root">
              {this.processNodes(node.children)}
            </div>
          )
        case 'text':
          return node.value
        case 'link':
          return (
            <a key={key} contentEditable="false" className="links" href={node.uri.raw}>
              {node.desc}
            </a>
          )
        case 'headline':
          let keyword
          if (node.keyword) {
            keyword = node.keyword
          }
          return (
            <div key={key} className={node.type}>
              {' '}
              -{' '}
              <div key={key} onClick={() => this.keywordOnClick(key)} contentEditable="false" className="keyword">
                {keyword}
              </div>{' '}
              {this.processNodes(node.children)}
            </div>
          )
        default:
          return (
            <div key={key} className={node.type}>
              {this.processNodes(node.children)}
            </div>
          )
      }
    })
  }

  keywordOnClick(key) {
    flatAst[key].keyword = this.state.todos[this.state.todos.indexOf(flatAst[key].keyword) + 1]
    this.setState({ org: ast })
  }

  nodeWrapper(tree) {
    return this.processNodes([tree])
  }

  componentDidMount() {
    console.log('mounting component')
    ast = parse(org)
    console.log('AST\n---\n', ast)
    this.setState({
      title: ast.meta.title,
      org: ast,
      todos: ast.meta.todos
    })
  }

  updateTitle(e) {
    this.setState({ title: e.target.innerHTML })
  }

  render() {
    document.title = this.state.title || ast.meta.title
    return (
      <div className="App">
        <h1 contentEditable="true" onInput={this.updateTitle} className="App-Title">
          {this.state.title}
        </h1>
        {this.state.org && this.nodeWrapper(this.state.org)}
        <input type="radio" name="completed" checked /><label for="huey">Show Completed</label>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))

// Hot Module Replacement
if (module.hot) {
  module.hot.accept()
}
