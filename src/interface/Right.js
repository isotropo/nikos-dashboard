import { useState } from "react"
import "../styles/Right.sass"
import { APP } from "../scripts"

const Right = () => 
{
    return <div className="Right">
        {APP.Info.selectedPage}
    </div>   
}

export default Right