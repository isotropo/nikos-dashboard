import { useState } from "react"
import "../styles/Left.sass"
import LeftButton from "./LeftButton"
import { APP } from "../scripts"
import DataPage from "./pages/DataPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import AboutPage from "./pages/AboutPage"

const Left = ({stateUpdate}) => 
{
    const _updateState = (name) =>
    {
        APP.Info.leftButtonSelected = name
        
        stateUpdate()
    }

    return <div className="Left">
        <div className="Left--buttons">
            <LeftButton name={"Data"} 
                page={<DataPage />} 
                stateUpdate={_updateState} />
            <LeftButton name={"Analytics"} 
                page={<AnalyticsPage />}
                stateUpdate={_updateState} />
            <LeftButton name={"About"} 
                page={<AboutPage />}
                stateUpdate={_updateState} />
        </div>
    </div>   
}

export default Left