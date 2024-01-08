import './App.css';
import React from 'react';
import DynamicForm from './DynamicForm';

function App() {
  return (
    <div className="App">
      <DynamicForm
        jsonUrl="/char_gen.json"
      />
    </div>
  );
}

export default App;
