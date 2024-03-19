import React from "react";

export default function ContentEditableElement({ tag, value, onFocusLost, className, allowEditable, card, render, setRender, editWhat, setCurrentTextOnEditor, suppressContentEditableWarning }) {
    let previousValue = value;

    const applyChanges = (e) => {
        if (e.target.textContent === previousValue) {
            e.target.contentEditable = false;
            return;
        }
        value = e.target.textContent;
        previousValue = value;

        e.target.contentEditable = false;

        if (typeof editWhat === "string") {
            card[editWhat] = e.target.textContent;
        }
        if (Array.isArray(editWhat)) {
            card[editWhat[0]][editWhat[1]] = e.target.textContent;
            console.log(editWhat);
        }

        setRender(JSON.stringify(render));
        setCurrentTextOnEditor(JSON.stringify(render));
    }

    const onBlur = (e) => {
        e.target.contentEditable = false;
        applyChanges(e);
        onFocusLost && onFocusLost();
    }
    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            console.log(e);
            applyChanges(e);
        }
    }
    const onDoubleClick = (e) => {
        if (allProperties) {
            e.target.contentEditable = true;
            e.target.focus()
        }
    }

    const allProperties = {
        onBlur: onBlur,
        onKeyDown: onKeyDown,
        onDoubleClick: onDoubleClick,
        contentEditable: false,
        className: className,
        style: allowEditable ? { cursor: "copy" } : { cursor: "auto" },
    }

    const tags = {
        h1: (<h1 {...allProperties} >{value}</h1>),
        h2: (<h2 {...allProperties} >{value}</h2>),
        h3: (<h3 {...allProperties} >{value}</h3>),
        h4: (<h4 {...allProperties} >{value}</h4>),
        h5: (<h5 {...allProperties} >{value}</h5>),
        p: (<p {...allProperties} >{value}</p>)
    }

    return (tags[tag ?? "p"])
}