/* eslint-disable import/no-extraneous-dependencies */
import { React, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import { ClickAwayListener, Paper } from '@mui/material';
// import SyntaxHighlighter from 'react-syntax-highlighter';
// import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Highlight, themes } from 'prism-react-renderer';
import AutoLinkText from 'react-autolink-text2';
import { Masonry } from '@mui/lab';
import './SheetsRenderer.css';
import ReactTextareaAutosize from 'react-textarea-autosize';
import ContentEditableElement from './ContentEditableElement';
import unsetArrayPosition from '../../Functions/unsetArrayPosition';

const globalSpringConfig = {
  mass: 1.5,
  tension: 375,
  friction: 30,
  clamp: true,
  velocity: 0.005,
};

export default function SheetsRenderer({
  autoSave, render, messages, setRender, setCurrentTextOnEditor, userPermission,
}) {
  const urlParam = useParams('/project/:id');

  const handleNewSubject = (newSubject) => {
    render.subjects.push(newSubject);

    const renderTextJson = JSON.stringify(render);

    setRender(renderTextJson);
    setCurrentTextOnEditor(renderTextJson);

    autoSave(renderTextJson, urlParam.id);
  };

  const handleNewCard = (subjectIndex, newCard) => {
    newCard.body?.filter((str) => str != null);

    render.subjects.at(subjectIndex).cards.push(newCard);

    const renderTextJson = JSON.stringify(render);

    setRender(renderTextJson);
    setCurrentTextOnEditor(renderTextJson);

    autoSave(renderTextJson, urlParam.id);
  };

  const handleProjectEdit = (projectData) => {
    const renderTextJson = JSON.stringify(projectData);

    setRender(renderTextJson);
    setCurrentTextOnEditor(renderTextJson);

    autoSave(renderTextJson, urlParam.id);
  };

  return (render && render.project_name && render.project_synopsis)
    ? (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
      >
        {render.project_name && (<h1 className="project-name">{render.project_name}</h1>)}
        {render.project_synopsis && (<p className="project-synopsis">{render.project_synopsis}</p>)}
        {render.subjects?.map((subject, subjectIndex) => (
          <div className="card-outer-container" key={subjectIndex}>
            {subject.subject_title && (<h2 className="subject-name" id={`subject-${subjectIndex}`}>{subject.subject_title}</h2>)}
            <Masonry columns={{ xs: 1, md: 2, lg: 3 }} spacing={3}>
              {subject.cards?.map((card, cardIndex) => (
                (card.card_title || card.header || card.body[0] || card.footer) && (
                  <Paper suppressContentEditableWarning id={`subject-${subjectIndex}-card-${cardIndex}`} key={cardIndex} className="rendered-card">
                    {card.card_title && (
                      <ContentEditableElement tag="h3" className="rendered-card-title" editWhat="card_title" value={card.card_title} allowEditable={(userPermission === 'own' || userPermission === 'manage')} card={card} render={render} setRender={setRender} setCurrentTextOnEditor={setCurrentTextOnEditor} />)}
                    {card.header && (
                      <ContentEditableElement tag="p" className="rendered-card-header" editWhat="header" value={card.header} allowEditable={(userPermission === 'own' || userPermission === 'manage')} card={card} render={render} setRender={setRender} setCurrentTextOnEditor={setCurrentTextOnEditor} />)}
                    <div className="rendered-card-body">
                      {card.body?.map((item, itemIndex) => (
                        item && (<RenderText key={`sub:${subjectIndex}&card:${cardIndex}&item:${itemIndex}`} render={item} editWhat="header" value={['body', itemIndex]} allowEditable={(userPermission === 'own' || userPermission === 'manage')} card={card} setRender={setRender} setCurrentTextOnEditor={setCurrentTextOnEditor} />)
                      ))}
                      {card.footer && (<ContentEditableElement tag="h4" className="rendered-card-footer" editWhat="footer" value={card.footer} allowEditable={(userPermission === 'own' || userPermission === 'manage')} card={card} render={render} setRender={setRender} setCurrentTextOnEditor={setCurrentTextOnEditor} />)}
                    </div>
                  </Paper>
                )
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

function Highlighter({ text }) {
  const regex = /(.*)\[hl](.*?)\[hl](.*)/s;
  const highlightMatch = regex.exec(text);

  if (highlightMatch) {
    const beforeText = highlightMatch[1];
    const highlightedText = highlightMatch[2];
    const afterText = highlightMatch[3];

    return (
      <>
        {beforeText
          && (
            <Highlighter text={beforeText} />
          )}
        {highlightedText
          && (
            <span className="highlighted">{highlightedText}</span>
          )}
        {afterText
          && (
            <Highlighter text={afterText} />
          )}
      </>
    );
  }
  return (
    <span>
      <AutoLinkText text={text} />
    </span>
  );
}

function RenderText({ render }) {
  const codeRegex = /(.*)\[code=(.*?)\](.*?)\[endOfCode\](.*?)/s;
  const match = codeRegex.exec(render);

  if (match) {
    const beforeText = match[1];
    const language = match[2];
    const code = match[3];
    const afterText = match[4];

    return (
      <div>
        <p><Highlighter text={beforeText} /></p>
        <Highlight
          language={language}
          code={code}
          theme={themes.duotoneLight}
        >
          {({
            style,
            tokens,
            getLineProps,
            getTokenProps,
          }) => (
            <pre style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span>{i + 1}</span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
        {afterText && (<p><Highlighter text={afterText} /></p>)}
      </div>
    );
  }

  return (
    <p>
      <Highlighter text={render} />
    </p>
  );
}

function AddCardHologram({ subjectIndex, messages, onAddNewCard }) {
  const [showFields, setShowFields] = useState(false);

  const [title, setTitle] = useState();
  const [subtitle, setSubtitle] = useState();
  const [contentList, setContentList] = useState(['']);
  const [conclusion, setConclusion] = useState();

  const resetFields = () => {
    setTitle('');
    setSubtitle('');
    setContentList(['']);
    setConclusion('');
  };

  const fieldsContainerAnimation = useSpring({
    display: showFields ? 'flex' : 'none',
    opacity: showFields ? 1 : 0.5,
    zIndex: showFields ? 1 : 0,
    config: globalSpringConfig,
  });
  const buttonFadeAnimation = useSpring({
    opacity: showFields && 0,
    zIndex: showFields && 0,
    config: globalSpringConfig,
  });

  return (
    <ClickAwayListener onClickAway={() => { setShowFields(false); }}>
      <div className="hologram-container" style={{ opacity: showFields && '1', height: !showFields && '50px' }}>
        <animated.div className="content-fields" style={fieldsContainerAnimation}>
          <form action="" onSubmit={(e) => { e.preventDefault(); }}>
            <input type="text" placeholder={messages.add_card_hologram_title} value={title} onChange={(e) => { setTitle(e.target.value); }} />
            <input type="text" placeholder={messages.add_card_hologram_subtitle} value={subtitle} onChange={(e) => { setSubtitle(e.target.value); }} />
          </form>

          <form style={{ height: showFields ? '100%' : '32px' }} onSubmit={(e) => { e.preventDefault(); }}>
            {contentList.map((content, index) => (content !== null ? (
              <div key={index} className="deletable-content-field">
                <ReactTextareaAutosize
                  style={{ paddingRight: '26px', overflow: 'hidden' }}
                  value={content}
                  id={`content-input-${subjectIndex}-${index}`}
                  placeholder={`${messages.add_card_hologram_content} ${index + 1}`}
                  onChange={(e) => {
                    contentList[index] = e.target.value;
                    setContentList([...contentList]);
                  }}
                />
                <input
                  className="bi bi-trash3"
                  type="button"
                  tabIndex={-2}
                  onClick={(e) => {
                    if (e.type === 'click') {
                      const actualListRef = contentList;

                      setContentList([...unsetArrayPosition(actualListRef, index)]);
                    }
                  }}
                />
              </div>
            ) : null))}
            <input
              type="button"
              value={messages.add_card_hologram_add_content}
              onClick={(e) => {
                e.preventDefault();
                setContentList([...contentList, '']);
              }}
            />
          </form>

          <form onSubmit={(e) => { e.preventDefault(); }}>
            <input
              type="text"
              placeholder={messages.add_card_hologram_conclusion}
              value={conclusion}
              onChange={(e) => { setConclusion(e.target.value); }}
              onKeyDown={(e) => {
                if (`${e.code}`.toLowerCase() === 'enter') {
                  e.preventDefault();
                  setConclusion(`${e.value}`);
                }
              }}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              width: '100%',
              gap: '4px',
            }}
            >
              <input
                type="button"
                style={{ cursor: (title) ? 'pointer' : 'not-allowed' }}
                value={messages.add_card_hologram_add_card}
                onClick={() => {
                  if (title) {
                    onAddNewCard(subjectIndex, {
                      card_title: title,
                      body: contentList,
                      header: subtitle,
                      footer: conclusion,
                    });
                    setShowFields(false);
                    resetFields();
                  }
                }}
              />
              <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setShowFields(false); }} />
            </div>
          </form>
        </animated.div>
        <animated.button onClick={() => { setShowFields(true); }} className="hologram card-hologram" style={buttonFadeAnimation}>
          <div style={{
            fontSize: '16px',
            fontWeight: '400',
          }}
          >
            {messages.add_card_hologram_button}
          </div>
        </animated.button>
      </div>
    </ClickAwayListener>
  );
}

function AddSubjectHologram({ messages, addNewSubject }) {
  const [showFields, setShowFields] = useState(false);

  const [subjectTitle, setSubjectTitle] = useState('');

  const resetFields = () => {
    setShowFields(false);
    setSubjectTitle('');
  };

  const fieldsContainerAnimation = useSpring({
    display: showFields ? 'flex' : 'none',
    opacity: showFields ? 1 : 0.5,
    zIndex: showFields ? 1 : 0,
    config: globalSpringConfig,
  });
  const buttonFadeAnimation = useSpring({
    opacity: showFields && 0,
    zIndex: showFields && 0,
    config: globalSpringConfig,
  });

  return (
    <ClickAwayListener onClickAway={() => { setShowFields(false); }}>
      <div className="subject-hologram-container hologram-container" style={{ opacity: showFields && '1', height: !showFields && '50px' }}>
        <animated.div className="content-fields" style={fieldsContainerAnimation}>
          <form action="" onSubmit={(e) => { e.preventDefault(); }}>
            <input type="text" placeholder={messages.add_subject_hologram_title} value={subjectTitle} onChange={(e) => { setSubjectTitle(e.target.value); }} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              width: '100%',
              gap: '4px',
            }}
            >
              <input
                type="button"
                value={messages.add_subject_hologram_add_subject}
                onClick={() => {
                  if (!subjectTitle || subjectTitle === '') return;
                  addNewSubject({
                    subject_title: subjectTitle,
                    cards: [],
                  });
                  resetFields();
                }}
              />
              <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setShowFields(false); }} />
            </div>
          </form>
        </animated.div>
        <animated.button onClick={() => { setShowFields(true); }} className="hologram subject-hologram" style={buttonFadeAnimation}>
          <div style={{
            fontSize: '16px',
            fontWeight: '400',
          }}
          >
            {messages.add_subject_hologram_button}
          </div>
        </animated.button>
      </div>
    </ClickAwayListener>
  );
}

function AddProjectInfo({ render, messages, handleNewProjectInfo }) {
  const [showFields, setShowFields] = useState(false);

  const [projectTitle, setProjectTitle] = useState(render.project_name ?? '');
  const [projectSynopsis, setProjectSynopsis] = useState(render.project_synopsis ?? '');

  const fieldsContainerAnimation = useSpring({
    display: showFields ? 'flex' : 'none',
    opacity: showFields ? 1 : 0.5,
    zIndex: showFields ? 1 : 0,
    config: globalSpringConfig,
  });
  const buttonFadeAnimation = useSpring({
    opacity: showFields && 0,
    zIndex: showFields && 0,
    config: globalSpringConfig,
  });

  return (
    <ClickAwayListener onClickAway={() => { setShowFields(false); }}>
      <div className="subject-hologram-container hologram-container" style={{ opacity: showFields && '1', height: !showFields && '50px' }}>
        <animated.div className="content-fields" style={fieldsContainerAnimation}>
          <form action="" onSubmit={(e) => { e.preventDefault(); }}>
            <input type="text" placeholder={messages.add_project_info_title} value={projectTitle} onChange={(e) => { setProjectTitle(e.target.value); }} />
            <input type="text" placeholder={messages.add_project_info_synopsis} value={projectSynopsis} onChange={(e) => { setProjectSynopsis(e.target.value); }} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              width: '100%',
              gap: '4px',
            }}
            >
              <input
                type="button"
                value={messages.add_project}
                onClick={() => {
                  if (!projectTitle || projectTitle === '' || !projectSynopsis || projectSynopsis === '') return;
                  handleNewProjectInfo({
                    project_name: projectTitle,
                    project_synopsis: projectSynopsis,
                    subjects: [],
                  });
                }}
              />
              <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setShowFields(false); }} />
            </div>
          </form>
        </animated.div>
        <animated.button onClick={() => { setShowFields(true); }} className="hologram subject-hologram" style={buttonFadeAnimation}>
          <div style={{
            fontSize: '16px',
            fontWeight: '400',
          }}
          >
            {messages.add_top_info_hologram_button}
          </div>
        </animated.button>
      </div>
    </ClickAwayListener>
  );
}
