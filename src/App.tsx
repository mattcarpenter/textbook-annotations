import React from 'react';
import './App.css';

import Honbun from './components/Honbun';

import honbunData from './data/honbuns.json';

function App() {
  return (
    <div className="App">
      <Honbun honbun={honbunData.honbuns[0]} grammar={honbunData.grammar}/>
    </div>
  );
}

export default App;
