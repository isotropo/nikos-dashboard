import "../styles/Left.sass"
import LeftButton from "./LeftButton"

const Left = ({ selectedPage, onSelectPage }) => 
{
    return <div className="Left">
        <div className="Left--buttons">
            <LeftButton name={"Inputs"} 
                selectedPage={selectedPage}
                onSelectPage={onSelectPage} />
            <LeftButton name={"Analytics"} 
                selectedPage={selectedPage}
                onSelectPage={onSelectPage} />
            <LeftButton name={"About"} 
                selectedPage={selectedPage}
                onSelectPage={onSelectPage} />
        </div>
    </div>   
}

export default Left
