import { React, useEffect, useState } from "react";
import { useSpring, animated } from 'react-spring';
import { ClickAwayListener, Paper } from '@mui/material';
import { Masonry } from '@mui/lab';
import "./SheetsRenderer.css";

const globalSpringConfig = {
    mass: 1.5,
    tension: 375,
    friction: 30,
    clamp: true,
    velocity: 0.005
}

export default function SheetsRenderer({ render, messages, setRender, setCurrentTextOnEditor, userPermission }) {
    const handleNewSubject = (newSubject) => {
        render.subjects.push(newSubject);

        const renderTextJson = JSON.stringify(render);

        setRender(renderTextJson);
        setCurrentTextOnEditor(renderTextJson);
    }

    const handleNewCard = (subjectIndex, newCard) => {
        render.subjects.at(subjectIndex).cards.push(newCard);

        const renderTextJson = JSON.stringify(render);

        setRender(renderTextJson);
        setCurrentTextOnEditor(renderTextJson);
    }

    const handleProjectEdit = (projectData) => {
        const renderTextJson = JSON.stringify(projectData);

        setRender(renderTextJson);
        setCurrentTextOnEditor(projectData);
    }

    return (render && render.project_name && render.project_synopsis) ?
        (<div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
        }}>
            {render.project_name && (<h1 className="project-name">{render.project_name}</h1>)}
            {render.project_synopsis && (<p className="project-synopsis">{render.project_synopsis}</p>)}
            {render.subjects?.map((subject, subjectIndex) => (
                <div className="card-outer-container" key={subjectIndex}>
                    {subject.subject_title && (<h2 className="subject-name" id={`subject-${subjectIndex}`}>{subject.subject_title}</h2>)}
                    <Masonry columns={{ xs: 1, md: 2, lg: 3 }} spacing={3} >
                        {subject.cards?.map((card, cardIndex) => (
                            (card.card_title || card.header || card.body[0] || card.footer) && <Paper id={`subject-${subjectIndex}-card-${cardIndex}`} key={cardIndex} className="rendered-card">
                                {card.card_title && (<h3 className="rendered-card-title">{card.card_title}</h3>)}
                                {card.header && (<p className="rendered-card-header">{card.header}</p>)}
                                <div className="rendered-card-body" >
                                    {card.body?.map((item, itemIndex) => (
                                        item && (<p key={itemIndex}>{item}</p>)
                                    ))}
                                    {card.footer && (<h4 className="rendered-card-footer">{card.footer}</h4>)}
                                </div>
                            </Paper>
                        ))}
                        {(userPermission === 'own' || userPermission === 'manage') && (<AddCardHologram messages={messages} subjectIndex={subjectIndex} key={subjectIndex} onAddNewCard={handleNewCard} />)}
                    </Masonry>
                </div>
            ))}
            {(userPermission === 'own' || userPermission === 'manage') && (<AddSubjectHologram messages={messages} addNewSubject={handleNewSubject} />)}
        </div>
        ) : (
            (userPermission === 'own' || userPermission === 'manage') && (<AddProjectInfo render={render} messages={messages} handleNewProjectInfo={handleProjectEdit} />)
        );
}

function AddCardHologram({ subjectIndex, messages, onAddNewCard }) {
    const [showFields, setShowFields] = useState(false)
    const [currentInput, setCurrentInput] = useState();

    const [title, setTitle] = useState();
    const [subtitle, setSubtitle] = useState();
    const [contentList, setContentList] = useState(['']);
    const [conclusion, setConclusion] = useState();

    const resetFields = () => {
        setTitle('');
        setSubtitle('');
        setContentList(['']);
        setConclusion('');
    }

    useEffect(() => {
        if (currentInput) {
            try {
                document.getElementById(`content-input-${subjectIndex}-${contentList.length - 1}`).focus();
            } catch (e) { }
        }
    }, [currentInput, subjectIndex, contentList.length])

    const fieldsContainerAnimation = useSpring({
        display: showFields ? "flex" : "none",
        opacity: showFields ? 1 : 0.5,
        zIndex: showFields ? 1 : 0,
        config: globalSpringConfig
    });
    const buttonFadeAnimation = useSpring({
        opacity: showFields && 0,
        zIndex: showFields && 0,
        config: globalSpringConfig
    });

    return (
        <ClickAwayListener onClickAway={() => { setShowFields(false) }
        }>
            <div className="hologram-container" style={{ opacity: showFields && '1', height: !showFields && '50px' }}>
                <animated.div className='content-fields' style={fieldsContainerAnimation} >
                    <form action="" onSubmit={(e) => { e.preventDefault() }}>
                        <input type="text" placeholder={messages.add_card_hologram_title} value={title} onChange={(e) => { setTitle(e.target.value) }} />
                        <input type="text" placeholder={messages.add_card_hologram_subtitle} value={subtitle} onChange={(e) => { setSubtitle(e.target.value) }} />
                    </form>

                    <form style={{ height: showFields ? '100%' : '32px' }} onSubmit={(e) => { e.preventDefault() }}>
                        {contentList.map((content, index) => {
                            return (content !== null ? <div key={index} className="deletable-content-field">
                                <input style={{ paddingRight: '26px' }} type="text" value={content} id={`content-input-${subjectIndex}-${index}`} placeholder={`${messages.add_card_hologram_content} ${index + 1}`} onKeyDown={(e) => {
                                    if (`${e.code}`.toLowerCase() === 'enter') {
                                        e.preventDefault();
                                        setContentList([...contentList, '']);
                                        setCurrentInput(e.target);
                                    }
                                }} onChange={(e) => {
                                    contentList[index] = e.target.value;
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
                    </form>

                    <form onSubmit={(e) => { e.preventDefault() }}>
                        <input type="text" placeholder={messages.add_card_hologram_conclusion} value={conclusion} onChange={(e) => { setConclusion(e.target.value) }} onKeyDown={(e) => {
                            if (`${e.code}`.toLowerCase() === 'enter') {
                                e.preventDefault();
                                setConclusion(e.value);
                            }
                        }} />
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            width: '100%',
                            gap: '4px'
                        }}>
                            <input type="button" value={messages.add_card_hologram_add_card} onClick={() => {
                                onAddNewCard(subjectIndex, {
                                    card_title: title,
                                    header: subtitle,
                                    body: contentList,
                                    footer: conclusion
                                });
                                setShowFields(false);
                                resetFields();
                            }} />
                            <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setShowFields(false) }} />
                        </div>
                    </form>
                </animated.div>
                <animated.button onClick={() => { setShowFields(true) }} className="hologram card-hologram" style={buttonFadeAnimation}>
                    <div style={{
                        fontSize: "30px",
                        fontWeight: "350"
                    }}>+</div>
                </animated.button>
            </div>
        </ClickAwayListener >
    );
}

function AddSubjectHologram({ messages, addNewSubject }) {
    const [showFields, setShowFields] = useState(false)

    const [subjectTitle, setSubjectTitle] = useState('');

    const resetFields = () => {
        setShowFields(false);
        setSubjectTitle('');
    }


    const fieldsContainerAnimation = useSpring({
        display: showFields ? "flex" : "none",
        opacity: showFields ? 1 : 0.5,
        zIndex: showFields ? 1 : 0,
        config: globalSpringConfig
    });
    const buttonFadeAnimation = useSpring({
        opacity: showFields && 0,
        zIndex: showFields && 0,
        config: globalSpringConfig
    });

    return (
        <ClickAwayListener onClickAway={() => { setShowFields(false) }
        }>
            <div className="subject-hologram-container hologram-container" style={{ opacity: showFields && '1', height: !showFields && '50px' }}>
                <animated.div className='content-fields' style={fieldsContainerAnimation} >
                    <form action="" onSubmit={(e) => { e.preventDefault() }}>
                        <input type="text" placeholder={messages.add_subject_hologram_title} value={subjectTitle} onChange={(e) => { setSubjectTitle(e.target.value) }} />
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            width: '100%',
                            gap: '4px'
                        }}>
                            <input type="button" value={messages.add_subject_hologram_add_subject} onClick={() => {
                                if (!subjectTitle || subjectTitle === '') return;
                                addNewSubject({
                                    subject_title: subjectTitle,
                                    cards: []
                                });
                                resetFields();
                            }} />
                            <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setShowFields(false) }} />
                        </div>
                    </form>
                </animated.div>
                <animated.button onClick={() => { setShowFields(true) }} className="hologram subject-hologram" style={buttonFadeAnimation}>
                    <div style={{
                        fontSize: "30px",
                        fontWeight: "350"
                    }}>+</div>
                </animated.button>
            </div>
        </ClickAwayListener >
    );
}

function AddProjectInfo({ render, messages, handleNewProjectInfo }) {
    const [showFields, setShowFields] = useState(false)

    const [projectTitle, setProjectTitle] = useState(render.project_name ?? '');
    const [projectSynopsis, setProjectSynopsis] = useState(render.project_synopsis ?? '');


    const fieldsContainerAnimation = useSpring({
        display: showFields ? "flex" : "none",
        opacity: showFields ? 1 : 0.5,
        zIndex: showFields ? 1 : 0,
        config: globalSpringConfig
    });
    const buttonFadeAnimation = useSpring({
        opacity: showFields && 0,
        zIndex: showFields && 0,
        config: globalSpringConfig
    });

    return (
        <ClickAwayListener onClickAway={() => { setShowFields(false) }
        }>
            <div className="subject-hologram-container hologram-container" style={{ opacity: showFields && '1', height: !showFields && '50px' }}>
                <animated.div className='content-fields' style={fieldsContainerAnimation} >
                    <form action="" onSubmit={(e) => { e.preventDefault() }}>
                        <input type="text" placeholder={messages.add_project_info_title} value={projectTitle} onChange={(e) => { setProjectTitle(e.target.value) }} />
                        <input type="text" placeholder={messages.add_project_info_synopsis} value={projectSynopsis} onChange={(e) => { setProjectSynopsis(e.target.value) }} />
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            width: '100%',
                            gap: '4px'
                        }}>
                            <input type="button" value={messages.add_project} onClick={() => {
                                if (!projectTitle || projectTitle === '' || !projectSynopsis || projectSynopsis === '') return;
                                handleNewProjectInfo({
                                    project_name: projectTitle,
                                    project_synopsis: projectSynopsis,
                                    subjects: []
                                });
                            }} />
                            <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setShowFields(false) }} />
                        </div>
                    </form>
                </animated.div>
                <animated.button onClick={() => { setShowFields(true) }} className="hologram subject-hologram" style={buttonFadeAnimation}>
                    <div style={{
                        fontSize: "30px",
                        fontWeight: "350"
                    }}>+</div>
                </animated.button>
            </div>
        </ClickAwayListener >
    );
}