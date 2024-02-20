import React from "react";
import "./NotFound.css";

export default function NotFound({ children }) {

    return (
        <div className="not-found">
            <i className="bi bi-exclamation-triangle"></i>
            {children}
        </div>
    );
}