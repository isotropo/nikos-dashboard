import "../styles/Right.sass"
import InputsPage from "./pages/InputsPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import AboutPage from "./pages/AboutPage"

const Right = ({
    planInput,
    selectedInputsView,
    selectedPage,
    setPlanInput,
    setSelectedInputsView,
}) => 
{
    return <div className="Right">
        {selectedPage === "Inputs" && (
            <InputsPage
                planInput={planInput}
                selectedInputsView={selectedInputsView}
                setPlanInput={setPlanInput}
                setSelectedInputsView={setSelectedInputsView}
            />
        )}
        {selectedPage === "Analytics" && (
            <AnalyticsPage planInput={planInput} />
        )}
        {selectedPage === "About" && <AboutPage />}
    </div>   
}

export default Right
