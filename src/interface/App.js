import { useState } from 'react';
import logo from '../img/logo.svg';
import '../styles/App.sass';
import Left from './Left';
import Right from './Right';

function App() {
  const [_, _update] = useState(Date.now())

  const _updateState = () =>
  {
    _update(Date.now())
  }

  return (
    <div className="App">
      <Left stateUpdate={_updateState} />
      <Right stateUpdate={_updateState} />
    </div>
  );
}

export default App;
