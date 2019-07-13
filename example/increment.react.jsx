import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val: 0
    };
  }

  increment = () => {
    this.setState({ val: this.state.val + 1 });
  }
  decrement = () => {
    this.setState({ val: this.state.val - 1 });
  }

  render() {
    return (
      <div>
        { this.state.val }
        <button onClick={this.increment}>Click to increment by 1</button>
        <button onClick={this.decrement}>Click to decrease by 1</button>
      </div>
    );
  }
}

export default App;