const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value
                break

            case 'checkbox':
                value = target.checked
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity, labels, sortBy, sortDir } = filterByToEdit
    return (
        <form className="bug-filter" onSubmit={onSubmitFilter}>
            <p>Filter</p>

            <label htmlFor="txt">Text: </label>
            <input value={txt} onChange={handleChange} type="text" placeholder="Search title / desc." id="txt" name="txt" />

            <label htmlFor="minSeverity">Min Severity: </label>
            <input value={minSeverity || ''} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

            <label htmlFor="labels">Labels: </label>
            <input value={labels || ''} onChange={handleChange} type="text" placeholder="critical, need-CR" id="labels" name="labels" />

            <label htmlFor="sortBy">Sort: </label>
            <select value={sortBy || ''} onChange={handleChange} id="sortBy" name="sortBy">
                <option value="">Default</option>
                <option value="title">Title</option>
                <option value="severity">Severity</option>
                <option value="createdAt">Created date</option>
            </select>
            <select value={sortDir || 1} onChange={handleChange} aria-label="Sort direction" name="sortDir">
                <option value="1">Ascending</option>
                <option value="-1">Descending</option>
            </select>
        </form>
    )
}
