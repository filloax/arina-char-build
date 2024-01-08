import './App.css';
import React from 'react';
import DynamicPdfForm from './DynamicPdfForm';

function App() {
  return (
    <div className="App">
      <DynamicPdfForm
        jsonUrl="/char_gen.json"
      />
    </div>
  );
}

export default App;
