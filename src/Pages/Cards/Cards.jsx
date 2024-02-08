import { RecapLogo } from "../../Components/Icons/Icons";
import React, { useEffect, useState } from "react";
import env from "react-dotenv";
import axios from "axios";
import Card from "./Card";
import "./Cards.css"
import Modal from "../../Components/Modal/Modal";
import { useSpring, animated } from "react-spring";
import Button from "../../Components/Button/Button";
import Input, { TextArea } from "../../Components/Input/Input";
import { Alert, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";

const api = axios.create({
    baseURL: env.API_URL,
});

export default function Cards({ userId, messages, setLoading }) {
    const [showModal, setShowModal] = useState(false);
    const [required, setRequired] = useState(false);

    const [userCards, setUserCards] = useState();
    const [cardName, setCardName] = useState('');
    const [cardSynopses, setCardSynopses] = useState('');
    const [newCard, setNewCard] = useState();

    const [alertMessage, setAlertMessage] = useState();
    const [alert, openAlert] = useState();
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [notification, setNotification] = useState();
    const [notificationMessage, setNotificationMessage] = useState();

    const navigate = useNavigate();

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
        if (cardName !== "" && `${cardName}`.length >= 4 && cardSynopses !== "" && `${cardSynopses}`.length >= 4) {
            setLoading(true);
            setNewCard({ name: cardName, synopsis: cardSynopses });

            setCardName(null);
            setCardSynopses(null);
        }
    }

    useEffect(() => {
        const fetchUserCards = async () => {
            if (!userId) return
            setNotificationMessage(messages.loading_your_cards)
            setNotification(true);
            setLoading(true);
            await api.get(`?about=userProjects&field=user_id:${userId}`)
                .then((data) => {
                    setUserCards(data.data);
                    setNotification(false);
                    setLoading(false)
                }).catch((err => {
                    setNotification(false);
                    setLoading(false);
                }));
        }
        fetchUserCards();
    }, [userId, setLoading]);


    useEffect(() => {
        const createCardAndProject = async () => {
            if (!newCard) return;

            const newCardRef = newCard;

            setNewCard(null);

            setShowModal(false);

            try {
                const cardData = await api.post(`?about=card`, [{ synopsis: newCardRef.synopsis }]);
                const cardId = cardData.data[0].id;

                const projectData = await api.post(`?about=project`, [{ card_id: cardId, name: newCardRef.name }]);
                const projectId = projectData.data[0].id;

                await api.post(`?about=userProjects`, [{ project_id: projectId, user_id: userId, user_permissions: 'own' }]);

                setAlertSeverity('success');
                setUserCards([...userCards, { id: projectId, name: newCardRef.name }])
                setAlertMessage(messages.item_new_created.replace(':str', messages.card));
            } catch (error) {
                setAlertSeverity('error');
                setAlertMessage(messages.item_creation_error.replace(':str', messages.card));
            } finally {
                setLoading(false);
                openAlert(true);
            }
        };

        createCardAndProject();
    }, [newCard, userCards, navigate, openAlert, setAlertMessage, setLoading, userId, messages]);

    return (
        <>
            <div className="flex-column">
                <RecapLogo height={"5dvh"} style={{ marginTop: "3.75dvh", minHeight: "4.5dvh" }} />
                <div className="cards-page">
                    <h2 className="cards-page-title">{messages.cards_page_title}</h2>
                    <div className="cards-container">
                        {userCards && userCards.map((card) => {
                            return (<Card key={card.id} cardId={card.id} isLink={card.id} cardTitle={card.name} />);
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
                            <Input type="text" messages={messages} placeholder={messages.label_card_name} required={required} submitRule={(value) => { return `${value}`.length < 4 ? messages.invalid_synopsis_length : true }} update={setCardName} />
                            <TextArea messages={messages} placeholder={messages.label_card_synopsis} required={required} submitRule={(value) => { return `${value}`.length < 4 ? messages.invalid_synopsis_length : true }} update={setCardSynopses} />
                            <Button style={{ minWidth: "100%" }} onClick={() => { onCreateCardHandler() }} >{messages.form_button_new_card}</Button>
                        </form>
                    </animated.div>
                </Modal>
            </animated.div>

            <Snackbar
                open={notification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={5000}
                onClose={() => { setNotification(false) }}
                message={notificationMessage}
            />

            <Snackbar open={alert} autoHideDuration={5000} onClose={() => { openAlert(false) }}>
                <Alert
                    onClose={() => { openAlert(false) }}
                    severity={alertSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
