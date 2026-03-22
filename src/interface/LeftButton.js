import { useState } from "react"
import "../styles/LeftButton.sass"
import { APP } from "../scripts"

const LeftButton = ({name, page, stateUpdate}) =>
{
    const _onClick = () =>
    {
        APP.Info.selectedPage = page
        
        stateUpdate(name)
    }

    return <div className={`LeftButton ${APP.Info.leftButtonSelected === name ? "selected" : ""}`}
        onClick={_onClick}>
        <span>{name}</span>
    </div>
}

export default LeftButton