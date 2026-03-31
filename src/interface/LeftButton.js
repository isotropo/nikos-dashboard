import "../styles/LeftButton.sass"

const LeftButton = ({ name, selectedPage, onSelectPage }) =>
{
    const _onClick = () =>
    {
        onSelectPage(name)
    }

    return <button
        className={`LeftButton ${selectedPage === name ? "selected" : ""}`}
        onClick={_onClick}
        type="button">
        <span>{name}</span>
    </button>
}

export default LeftButton
