import { React, useEffect, useState } from "react";
import { useSpring, animated } from 'react-spring';
import { ClickAwayListener, Paper } from '@mui/material';
import { Masonry } from '@mui/lab';
import "./SheetsRenderer.css";

export default function SheetsRenderer({ render, messages }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
        }}>
            <h1 className="project-name">{render.project_name}</h1>
            <p className="project-synopsis">{render.project_synopsis}</p>
            {render.subjects?.map((subject, subjectIndex) => (
                <div className="card-outer-container" key={subjectIndex}>
                    <h2 className="subject-name">{subject.subject_title}</h2>
                    <Masonry columns={3} spacing={3} >
                        {subject.cards?.map((card, cardIndex) => (
                            <Paper key={cardIndex} className="rendered-card">
                                <h3 className="rendered-card-title">{card.card_title}</h3>
                                {card.header && (<p className="rendered-card-header">{card.header}</p>)}
                                <div className="rendered-card-body" >
                                    {card.body?.map((item, itemIndex) => (
                                        <p key={itemIndex}>{item}</p>
                                    ))}
                                    <h4 className="rendered-card-footer">{card.footer}</h4>
                                </div>
                            </Paper>
                        ))}
                        <AddCardHologram messages={messages} />
                    </Masonry>
                </div>
            ))}
            <AddSubjectHologram />
        </div>
    );
}

function AddCardHologram({ messages }) {
    const [showFields, setShowFields] = useState(false)
    const [contentList, setContentList] = useState([''])
    const [currentInput, setCurrentInput] = useState();

    useEffect(() => {
        if (currentInput) {
            try {
                currentInput.form[currentInput.form.length - 4].focus();
            } catch (e) { }
        }
    }, [currentInput])

    const fieldsContainerAnimation = useSpring({
        opacity: showFields ? 1 : 0,
        zIndex: showFields ? 7 : 6,
        config: showFields ? {
            mass: 0.1,
            tension: 514
        } : {
            mass: 0.1,
            tension: 314
        }
    });
    const buttonFadeAnimation = useSpring({
        opacity: showFields ? 0 : 1,
        zIndex: showFields ? 6 : 7,
        config: showFields ? {
            mass: 0.1,
            tension: 514
        } : {
            mass: 0.1,
            tension: 314
        }
    });

    const portalForm = useSpring({
        // height: showFields ? '100%' : '10%'
    });

    return (
        <ClickAwayListener onClickAway={() => { setShowFields(false) }
        }>
            <div className="hologram-container" style={{ opacity: showFields && '1', height: !showFields && '50px' }}>
                <animated.div className={`content-fields`} style={fieldsContainerAnimation} >
                    <form action="" onSubmit={(e) => { e.preventDefault() }}>
                        <input type="text" placeholder={messages.add_card_hologram_title} />
                        <input type="text" placeholder={messages.add_card_hologram_subtitle} />
                    </form>

                    <form style={{ height: showFields ? '100%' : '32px' }} onSubmit={(e) => { e.preventDefault() }}>
                        {contentList.map((content, index) => {
                            return (content !== null ? <div key={index} className="deletable-content-field">
                                <input type="text" value={content} placeholder={`${messages.add_card_hologram_content} ${index + 1}`} onKeyDown={(e) => {
                                    if (`${e.code}`.toLowerCase() === 'enter') {
                                        e.preventDefault();
                                        setContentList([...contentList, '']);
                                        setCurrentInput(e.target);
                                        console.log(e);
                                    }
                                }} onChange={(target) => {
                                    contentList[index] = target.value;
                                    setContentList([...contentList]);
                                }} />
                                <button tabIndex={2} onClick={(e) => {
                                    if (e.type === 'click') {
                                        contentList[index] = null;
                                        setContentList([...contentList]);
                                    }
                                }}><i className="bi bi-trash3"></i></button>
                            </div> : null);
                        })}
                        <input type="button" value={messages.add_card_hologram_add_content} onClick={(e) => {
                            e.preventDefault();
                            setContentList([...contentList, '']);
                        }} />
                        <input type="text" placeholder={messages.add_card_hologram_conclusion} onKeyDown={(e) => {
                            if (`${e.code}`.toLowerCase() === 'enter') {
                                e.preventDefault();
                            }
                        }} />
                    </form>

                    <form style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        width: '100%'
                    }} onSubmit={(e) => { e.preventDefault() }}>
                        <input type="button" value={messages.add_card_hologram_add_card} />
                        <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setShowFields(false) }} />
                    </form>
                </animated.div>
                <animated.button onClick={() => { setShowFields(true) }} className="hologram card-hologram" style={buttonFadeAnimation}>
                    <div>+</div>
                </animated.button>
            </div>
        </ClickAwayListener >
    );
}

function AddSubjectHologram() {

    return (
        <div>
            <div>

            </div>
            <div className="hologram subject-hologram">
                +
            </div>
        </div>
    );
}