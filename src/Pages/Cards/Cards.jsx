import { RecapLogo } from "../../Components/Icons/Icons";
import React, { useState } from "react";
import env from "react-dotenv";
import axios from "axios";
import Card from "./Card";
import "./Cards.css"
import Modal from "../../Components/Modal/Modal";
import { useSpring, animated } from "react-spring";
import Button from "../../Components/Button/Button";
import Input, { TextArea } from "../../Components/Input/Input";

const api = axios.create({
    baseURL: env.API_URL,
});

// eslint-disable-next-line
const createNewProject = (cardData) => {
    const cardId = api.post(`?about=card`, { synopsis: cardData.synopsis })


}

export default function Cards({ userId, cards, messages }) {
    const [showModal, setShowModal] = useState(false);
    const [required, setRequired] = useState(false);

    const [newCardData, setNewCardData] = useState({});

    const containerAnimation = useSpring({
        zIndex: showModal ? "5" : "-1",
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
        immediate: (key) => key === (showModal ? "zIndex" : "")
    });

    const toggleModal = () => {
        setShowModal(!showModal);
    }


    const onCreateCardHandler = () => {
        setRequired(true)
    }

    return (
        <>
            <div className="flex-column">
                <RecapLogo height={"5dvh"} style={{ marginTop: "3.75dvh", minHeight: "4.5dvh" }} />
                <div className="cards-page">
                    <h2 className="cards-page-title">{messages.cards_page_title}</h2>
                    <div className="cards-container">
                        {/* <Card isLink cardTitle={"Estudo javascript"} />
                        <Card isLink cardTitle={"Novo mapa"} />
                        <Card isLink cardTitle={"Cartão aula de estrutura de dados"} />
                        <Card isLink cardTitle={"abobrinha"} /> */}

                        {cards[0] && cards.map((card) => {
                            <Card isLink={card.id} cardTitle={card.title} />
                        })}

                        <Card cardTitle={"+ " + (messages.card_item_new_card)} isCreate onClick={toggleModal} />
                    </div>
                </div>
            </div>

            <animated.div onClick={() => { showModal && toggleModal() }} style={modalAnimation} >
                <Modal >
                    <animated.div style={containerAnimation} className="create-card-container" onClick={e => e.stopPropagation()}>
                        <div style={{ minWidth: "100%", textAlign: "start", fontSize: "2.7dvh", userSelect: "none" }}>{messages.form_title_new_card}</div>
                        <form onSubmit={e => { e.preventDefault() }}>
                            <Input name="title" type="text" messages={messages} placeholder={messages.label_card_name} required={required} updateValue={newCardData} />
                            <TextArea name="synopsis" messages={messages} placeholder={messages.label_card_synopsis} required={required} submitRule={(value) => { return value.length < 3 ? messages.invalid_synopsis_length : true }} updateValue={newCardData} />
                            <Button style={{ minWidth: "100%" }} onClick={() => { onCreateCardHandler() }} >{messages.form_button_new_card}</Button>
                        </form>
                    </animated.div>
                </Modal>
            </animated.div>
        </>
    );
}
