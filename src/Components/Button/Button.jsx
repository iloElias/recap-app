import React from "react";
import "./Button.css"

export default function Button({ children, className, style, id, onClick }) {
    return (
        <button style={style} className={"component-button " + (className ? className : "")} id={(id ? id : "")} onClick={onClick}>{children}</button>
    );
}