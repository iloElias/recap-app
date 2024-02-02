import { RecapLogo } from "../../Components/Icons/Icons";
import React, { useState } from "react";
import env from "react-dotenv";
import axios from "axios";
import Card from "./Card";
import "./Cards.css"
import Modal from "../../Components/Modal/Modal";
import { useSpring, animated } from "react-spring";
import Button from "../../Components/Button/Button";

const api = axios.create({
    baseURL: env.API_URL,
});

// eslint-disable-next-line
async function getUserProjects(userId) {
    api.get(`?about=$project&`);
}

export default function Cards({ userId, messages }) {
    // eslint-disable-next-line
    const [cards, setCards] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const containerAnimation = useSpring({
        transform: showModal ? "translateY(0%)" : "translateY(125%)",
        config: showModal ? {
            mass: 0.1,
            tension: 314
        } : {
            mass: 0.1,
            tension: 197
        }
    });

    const modalAnimation = useSpring({
        zIndex: showModal ? 4 : -1,

        opacity: showModal ? 1 : 0,
        config: {
            mass: 0.1,
            tension: 314
        },
        immediate: (key) => key === (showModal ? "zIndex" : "") // Isso aqui foi uma gambiarra que só XD
    });

    const toggleModal = () => {
        setShowModal(!showModal);
    }

    return (
        <>
            <div className="flex-column">
                <RecapLogo height={"5dvh"} style={{ marginTop: "3.75dvh", minHeight: "4.5dvh" }} />
                <div className="cards-page">
                    <h2 className="cards-page-title">{messages.cards_page_title}</h2>
                    <div className="cards-container">
                        <Card isLink cardTitle={"Estudo javascript"} />
                        <Card isLink cardTitle={"Novo mapa"} />
                        <Card isLink cardTitle={"Cartão aula de estrutura de dados"} />
                        <Card isLink cardTitle={"abobrinha"} />

                        <Card cardTitle={"+ " + messages.card_item_new_card} isCreate onClick={toggleModal} />
                    </div>
                </div>
            </div>

            <animated.div style={modalAnimation} >
                <Modal onClick={() => { showModal && toggleModal() }} >
                    <animated.div style={containerAnimation} className="create-card-container" onClick={(e) => e.stopPropagation}>
                        <div>{messages.form_title_new_card || "New card"}</div>
                        <form action="">
                            <input type="text" name="cardName" placeholder={messages.label_card_name || "Card name"} />
                            <Button>{messages.form_button_new_card || "Create new card"}</Button>
                        </form>
                    </animated.div>
                </Modal>
            </animated.div>
        </>
    );
}
