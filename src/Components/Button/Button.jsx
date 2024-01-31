import React from "react";
import "./Button.css"

export default function Button(props) {
    return (
        <button className={"component-button " + (props.className ? props.className : "")} id={(props.id ? props.id : "")} onClick={props.onClick}>{props.children}</button>
    );
}