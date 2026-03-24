import "../styles/LeftButton.sass"

const LeftButton = ({ name, selectedPage, onSelectPage }) =>
{
    const _onClick = () =>
    {
        onSelectPage(name)
    }

    return <div className={`LeftButton ${selectedPage === name ? "selected" : ""}`}
        onClick={_onClick}>
        <span>{name}</span>
    </div>
}

export default LeftButton
