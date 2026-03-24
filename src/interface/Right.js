import "../styles/Right.sass"
import InputsPage from "./pages/InputsPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import AboutPage from "./pages/AboutPage"

const Right = ({ planInput, selectedPage, setPlanInput }) => 
{
    return <div className="Right">
        {selectedPage === "Inputs" && (
            <InputsPage
                planInput={planInput}
                setPlanInput={setPlanInput}
            />
        )}
        {selectedPage === "Analytics" && (
            <AnalyticsPage planInput={planInput} />
        )}
        {selectedPage === "About" && <AboutPage />}
    </div>   
}

export default Right
