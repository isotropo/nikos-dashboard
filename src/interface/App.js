import { useState } from "react";
import { examplePlanInput } from "../domain/planModel";
import "../styles/App.sass";
import Left from "./Left";
import Right from "./Right";

function App() {
  const [selectedPage, setSelectedPage] = useState("Inputs");
  const [selectedInputsView, setSelectedInputsView] = useState("Expenses");
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
        selectedInputsView={selectedInputsView}
        setPlanInput={setPlanInput}
        setSelectedInputsView={setSelectedInputsView}
      />
    </div>
  );
}

export default App;
