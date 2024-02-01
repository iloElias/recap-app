import { RecapLogo } from "../../Components/Icons/Icons";
import React, { useState } from "react";
import env from "react-dotenv";
import axios from "axios";
import Card from "./Card";
import "./Cards.css"

const api = axios.create({
    baseURL: env.API_URL,
});

async function getUserProjects(userId) {
    api.get(`?about=$project&`);
}

export default function Cards({ userId, messages }) {
    const [cards, setCards] = useState([]);

    return (
        <div className="flex-column">
            <RecapLogo height={"5dvh"} style={{ marginTop: "3.75dvh", minHeight: "4.5dvh" }} />
            <div className="cards-page">
                <h2 className="cards-page-title">{messages.cards_page_title}</h2>
                <div className="cards-container">
                    <Card cardTitle={"Estudo javascript"} />
                    <Card cardTitle={"Novo mapa"} />
                    <Card cardTitle={"Cartão aula de estrutura de dados"} />
                    <Card cardTitle={"abobrinha"} />

                    <Card cardTitle={"+ " + messages.card_item_new_card} isCreate />
                </div>
            </div>
        </div>
    );
}
