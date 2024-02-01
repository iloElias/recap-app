import React from "react";
import "./Cards.css";

export default function Card({ cardTitle, cardId, onClick, isCreate }) {

    return (
        <div className="card-container" onClick={onClick}>
            <div className="card-paper"><div className="card-paper-text" style={isCreate && { color: "#989898" }}>{cardTitle}</div></div>
            <div className="card-paper-shadow"></div>
        </div>
    );
}