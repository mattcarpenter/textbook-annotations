import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import './App.css';
import 'react-tabs/style/react-tabs.css';

import Honbun from './components/Honbun';

import honbunData from './data/honbuns.json';

function App() {
  return (
    <div className="App">
      <Tabs>
        <TabList>
          {honbunData.honbuns.map(honbun => <Tab>{honbun.name}</Tab>)}
        </TabList>
        {honbunData.honbuns.map(honbun => {
          return (
            <TabPanel>
              <Honbun honbun={honbun} grammar={honbunData.grammar} vocab={honbunData.vocab}/>
            </TabPanel>
          );
        })}
      </Tabs>
    </div>
  );
}

export default App;
