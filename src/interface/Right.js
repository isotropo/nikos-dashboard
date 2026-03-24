import "../styles/Right.sass"
import DataPage from "./pages/DataPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import AboutPage from "./pages/AboutPage"

const PAGE_COMPONENTS = {
    Data: DataPage,
    Analytics: AnalyticsPage,
    About: AboutPage,
}

const Right = ({ selectedPage }) => 
{
    const SelectedPage = PAGE_COMPONENTS[selectedPage] ?? DataPage

    return <div className="Right">
        <SelectedPage />
    </div>   
}

export default Right
