import React from "react";
import "./Cards.css";
import { Link } from "react-router-dom";

export default function Card({ cardTitle, cardId, onClick, isCreate, isLink }) {

    return (
        <>
            {isLink ? (
                <Link to={cardId ? ("/card/" + cardId) : "/"} >
                    <div className="card-container" onClick={onClick}>
                        <div className="card-paper-shadow"></div>
                        <div className="card-paper"><div className="card-paper-text" style={isCreate && { color: "#989898" }}>{cardTitle}</div></div>
                    </div>
                </Link>
            ) : (
                <div className="card-container" onClick={onClick}>
                    <div className="card-paper-shadow"></div>
                    <div className="card-paper"><div className="card-paper-text" style={isCreate && { color: "#989898" }}>{cardTitle}</div></div>
                </div>
            )}
        </>
    );
}