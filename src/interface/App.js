import { useState } from "react";
import { examplePlanInput } from "../domain/planModel";
import "../styles/App.sass";
import Left from "./Left";
import Right from "./Right";

function App() {
  const [selectedPage, setSelectedPage] = useState("Inputs");
  const [planInput, setPlanInput] = useState(examplePlanInput);

  return (
    <div className="App">
      <Left
        selectedPage={selectedPage}
        onSelectPage={setSelectedPage}
      />
      <Right
        planInput={planInput}
        selectedPage={selectedPage}
        setPlanInput={setPlanInput}
      />
    </div>
  );
}

export default App;
