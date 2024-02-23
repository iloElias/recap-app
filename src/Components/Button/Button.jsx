import React from "react";
import "./Button.css"

export default function Button({ disabled, children, className, style, id, onClick }) {
    return (
        <button style={style ?? { border: 'solid 0.2vh rgba(255, 255, 255, 0.25)' }} className={(className ? className : "") + " " + (!disabled ? "component-button" : "component-button-disabled")} id={(id ? id : "")} onClick={onClick}>{children}</button>
    );
}