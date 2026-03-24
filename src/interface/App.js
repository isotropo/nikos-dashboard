import { useState } from "react";
import "../styles/App.sass";
import Left from "./Left";
import Right from "./Right";

function App() {
  const [selectedPage, setSelectedPage] = useState("Data");

  return (
    <div className="App">
      <Left
        selectedPage={selectedPage}
        onSelectPage={setSelectedPage}
      />
      <Right selectedPage={selectedPage} />
    </div>
  );
}

export default App;
