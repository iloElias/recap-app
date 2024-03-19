import { RecapLogo } from "../../Components/Icons/Icons";
import React, { useCallback, useEffect, useState } from "react";
import "./Cards.css"
import { contrastColor } from "contrast-color";
import Modal from "../../Components/Modal/Modal";
import { useSpring, animated } from "react-spring";
import Button from "../../Components/Button/Button";
import Input, { TextArea } from "../../Components/Input/Input";
import { Alert, Paper, Snackbar, Tooltip, tooltipClasses } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import getApi from "../../Api/api";
import debounce from "lodash.debounce";


export default function Cards({ userId, messages, setLoading, logoutHandler }) {
    const authenticationToken = localStorage.getItem('recap@localUserProfile');
    const api = getApi();

    const [showModal, setShowModal] = useState(false);
    const [required, setRequired] = useState(false);

    const [userCards, setUserCards] = useState();
    const [cardName, setCardName] = useState('');
    const [cardSynopses, setCardSynopses] = useState('');
    const [cardColor, setCardColor] = useState('#fafafa');


    const [resetValues, setResetValues] = useState();

    const [newCard, setNewCard] = useState();
    const [userDataWasLoaded, setUserDataWasLoaded] = useState(false);

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

    document.getElementById("page-title").innerText = "Recap - Home";

    const toggleModal = () => {
        setShowModal(!showModal);
    }

    const toggleResetValues = useCallback(() => {
        setResetValues(!resetValues);
        setCardColor("#fafafa");
    }, [resetValues, setResetValues]);

    const onCreateCardHandler = () => {
        setRequired(true)
        if (cardName !== "" && `${cardName}`.length >= 4 && cardSynopses !== "" && `${cardSynopses}`.length >= 4) {
            setLoading(true);
            setNewCard({ name: cardName, synopsis: cardSynopses, color: cardColor });

            setCardName(null);
            setCardSynopses(null);
            toggleResetValues();
            setRequired(false);
        }
    }

    // eslint-disable-next-line
    const setNewCardColor = useCallback(debounce((value) => {
        setCardColor(value);
    }, 10), [setCardColor]);

    useEffect(() => {
        if (userDataWasLoaded) return
        const fetchUserCards = async () => {
            if (!userId) return
            setNotificationMessage(messages.loading_your_cards)
            setNotification(true);
            setLoading(true);

            try {
                const userCardsData = await api.get(`/project/?field=user_id:${userId}`, {
                    headers: {
                        Authorization: `Bearer ${authenticationToken}`,
                    }
                })

                setUserCards(userCardsData.data);
                setNotification(false);
                setLoading(false)
                setUserDataWasLoaded(true)
            } catch (err) {
                if (err?.response?.status === 401) {
                    sessionStorage.setItem("recap@previousSessionError", JSON.stringify({ message: messages.reauthenticate_token_message, severity: 'error' }))
                    logoutHandler();
                }

                setNotification(false);
                openAlert(true);
                setAlertSeverity('error');

                setAlertMessage(messages.problem_when_loading);
                setLoading(false);
            }
        }
        fetchUserCards();
    }, [userId, setLoading, setNotificationMessage, openAlert, api, authenticationToken, userDataWasLoaded, setUserDataWasLoaded, logoutHandler, messages]);


    useEffect(() => {
        const createCardAndProject = async () => {
            if (!newCard) return;

            const newCardRef = newCard;

            setNewCard(null);
            setCardName('');
            setCardSynopses('');

            setShowModal(false);
            try {
                const project = await api.post('/project/', [{
                    card: {
                        synopsis: newCardRef.synopsis,
                        color: newCardRef.color
                    },
                    project: { name: newCardRef.name },
                    user: { id: userId }
                }], {
                    headers: {
                        Authorization: `Bearer ${authenticationToken}`,
                    }
                });

                setAlertSeverity('success');
                setUserCards([...userCards, { id: project.data.id, name: newCardRef.name, synopsis: newCardRef.synopsis, color: newCardRef.color }])
                setAlertMessage(messages.item_new_created.replace(':str', messages.card));
            } catch (err) {
                if (err.response.status === 401) {
                    sessionStorage.setItem('recap@previousSessionError', JSON.stringify(({ message: messages.reauthenticate_token_message, severity: 'error' })));

                    logoutHandler();
                }

                setAlertSeverity('error');
                setAlertMessage(messages.item_creation_error.replace(':str', messages.card));
            } finally {
                toggleResetValues();
                setLoading(false);
                openAlert(true);
            }
        };

        createCardAndProject();
    }, [newCard, userCards, authenticationToken, api, navigate, toggleResetValues, logoutHandler, setLoading, userId, messages]);

    return (
        <>
            <div className="flex-column">
                <RecapLogo style={{
                    marginTop: "3.75vh",
                    minHeight: "min-content",
                    height: "max(34px, 4.5vh)"
                }} />
                <div className="cards-page">
                    <h2 className="cards-page-title">{messages.cards_page_title}</h2>
                    <div className="cards-container">
                        <Card messages={messages} cardTitle={"+ " + (messages.card_item_new_card)} isCreate onClick={toggleModal} />

                        {userCards && userCards.map((card) => {
                            return (<Card key={card.id} messages={messages} cardId={card.id} isLink={card.id} cardTitle={card.name} cardSynopsis={card.synopsis} color={card.color} />);
                        })}
                    </div>
                </div>
            </div>

            <animated.div onClick={() => { showModal && toggleModal() }} style={modalAnimation} >
                <Modal >
                    <animated.div style={containerAnimation} onClick={e => e.stopPropagation()}>
                        <Paper className="create-card-container">
                            <div style={{ minWidth: "100%", textAlign: "start", fontSize: "2.7vh", userSelect: "none" }}>{messages.form_title_new_card}</div>
                            <form onSubmit={e => { e.preventDefault() }}>
                                <Input minSize={4} resetValue={resetValues} type="text" messages={messages} placeholder={messages.label_card_name} required={required} submitRule={(value) => { return `${value}`.length < 4 ? messages.invalid_synopsis_length : true }} update={setCardName} />
                                <TextArea minSize={4} resetValue={resetValues} messages={messages} placeholder={messages.label_card_synopsis} required={required} submitRule={(value) => { return `${value}`.length < 4 ? messages.invalid_synopsis_length : true }} update={setCardSynopses} />
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "2vh" }}><p>{messages.label_card_color}:</p><input value={cardColor} style={{ display: "flex", padding: "0", backgroundColor: cardColor }} type="color" onChange={(e) => { setNewCardColor(e.target.value) }} /></div>
                                <Button style={{ minWidth: "100%" }} onClick={() => { onCreateCardHandler() }} >{messages.form_button_new_card}</Button>
                            </form>
                        </Paper>
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

export function Card({ cardTitle, cardId, cardSynopsis, color, onClick, isCreate, isLink, messages }) {
    const navigate = useNavigate();

    const colorContrast = contrastColor({
        bgColor: color,
        fgDarkColor: "#212121",
        fgLightColor: "#fafafa"
    });

    const HtmlTooltip = styled(({ className, ...props }) => (
        <Tooltip arrow {...props} placement="bottom" enterDelay={500} classes={{ popper: className }} slotProps={{
            popper: {
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -70],
                        },
                    },
                ],
            },
        }}
        />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#fafafa',
            color: 'rgba(0, 0, 0, 0.87)',
            border: 'solid 0.1vh rgba(146, 146, 146, 0.719)',

            fontSize: '10px',
            minWidth: '170px',
            maxWidth: '170px'
        },
    }));

    const Title = ({ name, synopsis }) => {
        return (<>
            <h2>{name}</h2>
            <p>{synopsis}</p>
        </>);
    }

    const CardTitle = ({ name, synopsis }) => {
        return (<>
            <h2>{messages.label_card_name}:</h2>
            <p>{name}</p>
            <p><strong>{messages.label_card_synopsis}:</strong></p>
            <p>{synopsis}</p>
        </>);
    }

    return (
        <>
            {isLink ? (
                <button onClick={() => { navigate(cardId ? ("/project/" + cardId) : "/") }} >
                    <HtmlTooltip title={(
                        <CardTitle name={cardTitle} synopsis={cardSynopsis} />
                    )}>
                        <div className="card-container" onClick={onClick}>
                            <div className="card-paper-shadow"></div>
                            <div className="card-paper" style={{ backgroundColor: color }}><div className="card-paper-text" style={{ color: colorContrast }}>{cardTitle}</div></div>
                        </div>
                    </HtmlTooltip>
                </button>
            ) : (
                <button>
                    <HtmlTooltip title={(
                        <Title name={messages.tooltip_create_card_label} synopsis={messages.tooltip_create_card_synopsis_label} />
                    )}>
                        <div className="card-container" onClick={onClick}>
                            <div className="card-paper-shadow"></div>
                            <div className="card-paper"><div className="card-paper-text" style={{ color: "#989898" }} >{cardTitle}</div></div>
                        </div>
                    </HtmlTooltip>
                </button>
            )}
        </>
    );
}
