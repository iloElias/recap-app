/* eslint-disable import/no-extraneous-dependencies */
import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { contrastColor } from 'contrast-color';
import { useSpring, animated } from 'react-spring';
import { motion } from 'framer-motion';
import { Paper, Tooltip, tooltipClasses } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import './Cards.css';
import getApi from '../../Api/api';
import { RecapLogo } from '../../Components/Icons/Icons';
import Input, { TextArea } from '../../Components/Input/Input';
import Button from '../../Components/Button/Button';
import Modal from '../../Components/Modal/Modal';
import { LanguageProvider, UserAccountProvider, UserMessageProvider } from '../../App';
import useDebounce from '../../Functions/useDebouce';

export default function Cards() {
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

  const {
    messages,
  } = useContext(LanguageProvider);

  const {
    profile,
    logoutHandler,
  } = useContext(UserAccountProvider);

  const {
    setAlertMessage,
    setAlert,
    setAlertSeverity,
    setNotification,
    setNotificationMessage,
    setIsLoading,
  } = useContext(UserMessageProvider);

  const navigate = useNavigate();

  const containerAnimation = useSpring({
    zIndex: showModal ? '5' : '-1',
    transform: showModal ? 'translateY(0%)' : 'translateY(125%)',
    config: showModal ? {
      mass: 0.1,
      tension: 314,
    } : {
      mass: 0.1,
      tension: 197,
    },
  });

  const modalAnimation = useSpring({
    zIndex: showModal ? 4 : -1,
    opacity: showModal ? 1 : 0,
    config: {
      mass: 0.1,
      tension: 314,
    },
    immediate: (key) => key === (showModal ? 'zIndex' : ''),
  });

  document.getElementById('page-title').innerText = 'Recap - Home';

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleResetValues = useCallback(() => {
    setResetValues(!resetValues);
    setCardColor('#fafafa');
  }, [resetValues, setResetValues]);

  const onCreateCardHandler = () => {
    setRequired(true);
    if (cardName && cardName !== '' && `${cardName}`.length >= 4 && cardSynopses && cardSynopses !== '' && `${cardSynopses}`.length >= 4) {
      setIsLoading(true);
      setNewCard({ name: cardName, synopsis: cardSynopses, color: cardColor });

      setCardName(null);
      setCardSynopses(null);
      toggleResetValues();
      setRequired(false);
    }
  };

  const setNewCardColor = useDebounce((value) => {
    setCardColor(value);
  }, 10);

  useEffect(() => {
    if (userDataWasLoaded) return;
    const fetchUserCards = async () => {
      if (!profile?.id) return;
      setNotificationMessage(messages.loading_your_cards);
      setNotification(true);
      setIsLoading(true);

      try {
        const userCardsData = await api.get(`/project/?field=user_id:${profile?.id}`, {
          headers: {
            Authorization: `Bearer ${authenticationToken}`,
          },
        });

        setUserCards(userCardsData.data);
        setNotification(false);
        setIsLoading(false);
        setUserDataWasLoaded(true);
      } catch (err) {
        if (err?.response?.status === 401) {
          sessionStorage.setItem('recap@previousSessionError', JSON.stringify({ message: messages.reauthenticate_token_message, severity: 'error' }));
          logoutHandler();
        }

        setNotification(false);
        setAlert(true);
        setAlertSeverity('error');

        setAlertMessage(messages.problem_when_loading);
        setIsLoading(false);
      }
    };
    fetchUserCards();
  }, [
    profile?.id,
    setIsLoading,
    setNotificationMessage,
    setAlert,
    api,
    authenticationToken,
    userDataWasLoaded,
    setUserDataWasLoaded,
    logoutHandler,
    messages,
  ]);

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
            color: newCardRef.color,
          },
          project: { name: newCardRef.name },
          user: { id: profile?.id },
        }], {
          headers: {
            Authorization: `Bearer ${authenticationToken}`,
          },
        });

        setAlertSeverity('success');
        setUserCards([{
          id: project.data.id,
          name: newCardRef.name,
          synopsis: newCardRef.synopsis,
          color: newCardRef.color,
          enterDelay: 1,
        }, ...userCards]);
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
        setIsLoading(false);
        setAlert(true);
      }
    };

    createCardAndProject();
  }, [
    newCard,
    userCards,
    authenticationToken,
    api,
    navigate,
    toggleResetValues,
    logoutHandler,
    setIsLoading,
    profile?.id,
    messages,
  ]);

  return (
    <>
      <div className="flex-column">
        <RecapLogo style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '3.75vh',
          minHeight: 'min-content',
          height: 'max(34px, 4.5vh)',
        }}
        />
        <div className="cards-page">
          <h2 className="cards-page-title">{messages.cards_page_title}</h2>
          <motion.div
            className="cards-container"
            animate={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            }}
          >
            <Card messages={messages} cardTitle={`+ ${messages.card_item_new_card}`} isCreate onClick={toggleModal} />

            {userCards && userCards.map(
              (card, index) => (
                <Card
                  messages={messages}
                  key={card.id}
                  cardId={card.id}
                  isLink={card.id}
                  cardTitle={card.name}
                  cardSynopsis={card.synopsis}
                  color={card.color}
                  enterDelay={index}
                />
              ),
            )}
          </motion.div>
        </div>
      </div>

      <animated.div onClick={() => { if (showModal) { toggleModal(); } }} style={modalAnimation}>
        <Modal>
          <animated.div style={containerAnimation} onClick={(e) => e.stopPropagation()}>
            <Paper className="create-card-container">
              <div style={{
                minWidth: '100%', textAlign: 'start', fontSize: '2.7vh', userSelect: 'none',
              }}
              >
                {messages.form_title_new_card}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); }}>
                <Input minSize={4} resetValue={resetValues} type="text" messages={messages} placeholder={messages.label_card_name} required={required} submitRule={(value) => (`${value}`.length < 4 ? messages.invalid_synopsis_length : true)} update={setCardName} />
                <TextArea minSize={4} resetValue={resetValues} messages={messages} placeholder={messages.label_card_synopsis} required={required} submitRule={(value) => (`${value}`.length < 4 ? messages.invalid_synopsis_length : true)} update={setCardSynopses} />
                <div
                  className="input-container"
                  style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', fontSize: '2vh', minHeight: 'max-content',
                  }}
                >
                  <p>
                    {messages.label_card_color}
                    :
                  </p>
                  <input
                    className="form-input"
                    value={cardColor}
                    style={{
                      display: 'flex', width: '25%', height: '3.8vh', padding: '0.9vh 0.5vh', backgroundColor: cardColor,
                    }}
                    type="color"
                    onChange={(e) => { setNewCardColor(e.target.value); }}
                  />
                </div>
                <Button style={{ minWidth: '100%' }} onClick={() => { onCreateCardHandler(); }}>{messages.form_button_new_card}</Button>
              </form>
            </Paper>
          </animated.div>
        </Modal>
      </animated.div>
    </>
  );
}

export function Card({
  cardTitle, cardId, cardSynopsis, color, onClick, isLink, messages, enterDelay,
}) {
  const navigate = useNavigate();

  const colorContrast = contrastColor({
    bgColor: color,
    fgDarkColor: '#212121',
    fgLightColor: '#fafafa',
  });

  const appearAnimation = useSpring({
    from: {
      opacity: 0,
      transform: isLink ? 'scale(0) translateX(-50%) translateY(-50%)' : '',
      pointerEvent: 'none',
    },
    to: {
      opacity: 1,
      transform: isLink ? 'scale(1) translateX(0%) translateY(0%)' : '',
      pointerEvent: 'all',
    },
    delay: ((enterDelay + 1) * 75) ?? 0,
  });

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip
      arrow
      {...props}
      placement="bottom"
      enterDelay={500}
      classes={{ popper: className }}
      slotProps={{
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
  ))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#fafafa',
      color: 'rgba(0, 0, 0, 0.87)',
      border: 'solid 0.1vh rgba(146, 146, 146, 0.719)',

      fontSize: '10px',
      minWidth: '170px',
      maxWidth: '170px',
    },
  }));

  return (
    <motion.div layout="position" animate={{ x: 0 }}>
      {isLink ? (
        <animated.button
          type="button"
          style={appearAnimation}
          onClick={() => { navigate(cardId ? (`/project/${cardId}`) : '/'); }}
        >
          <HtmlTooltip
            title={(
              <div>
                <h2>
                  {messages.label_card_name}
                  :
                </h2>
                <p>{cardTitle}</p>
                <p>
                  <strong>
                    {messages.label_card_synopsis}
                    :
                  </strong>
                </p>
                <p>{cardSynopsis}</p>
              </div>
            )}
          >
            <div className="card-container" onClick={onClick}>
              <div className="card-paper-shadow" />
              <div className="card-paper" style={{ backgroundColor: color }}><div className="card-paper-text" style={{ color: colorContrast }}>{cardTitle}</div></div>
            </div>
          </HtmlTooltip>
        </animated.button>
      ) : (
        <animated.button
          type="button"
          style={appearAnimation}
        >
          <HtmlTooltip
            title={(
              <div>
                <h2>{messages.tooltip_create_card_label}</h2>
                <p>{messages.tooltip_create_card_synopsis_label}</p>
              </div>
            )}
          >
            <div className="card-container" onClick={onClick}>
              <div className="card-paper-shadow" />
              <div className="card-paper"><div className="card-paper-text" style={{ color: '#989898' }}>{cardTitle}</div></div>
            </div>
          </HtmlTooltip>
        </animated.button>
      )}
    </motion.div>
  );
}
