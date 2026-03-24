import "../styles/Right.sass"
import InputsPage from "./pages/InputsPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import AboutPage from "./pages/AboutPage"

const PAGE_COMPONENTS = {
    Inputs: InputsPage,
    Analytics: AnalyticsPage,
    About: AboutPage,
}

const Right = ({ selectedPage }) => 
{
    const SelectedPage = PAGE_COMPONENTS[selectedPage] ?? InputsPage

    return <div className="Right">
        <SelectedPage />
    </div>   
}

export default Right
