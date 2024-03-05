import { TreeDotsIcon } from "../Icons/Icons";
import { useSpring, animated } from "react-spring";
import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import "./BottomOptions.css";
import { useParams } from "react-router-dom";

import { ClickAwayListener } from '@mui/base';
import { Grow, Paper, Skeleton } from "@mui/material";
import { exportComponentAsPNG } from "react-component-export-image";
import generatePDF, { Margin } from "react-to-pdf";
import Modal from "../Modal/Modal";
import getApi from "../../Api/api";
import { jwtDecode } from "jwt-decode";

const api = getApi();

function OptionsMenu({ showCategory, children }) {
    const optionsAnimation = useSpring({
        opacity: showCategory ? 1 : 0,
        transform: showCategory ? "translateY(0%)" : "translateY(125%)",
        gap: showCategory ? "1dvh" : "0dvh",

        config: showCategory ? {
            mass: 0.1,
            tension: 314
        } : {
            mass: 0.1,
            tension: 197
        }
    });

    return (
        <div className="visibility-container" style={{
            overflowY: showCategory ? "visible" : "clip",
            zIndex: showCategory ? '8' : '0'
        }}>
            <animated.div style={optionsAnimation} className="options-menu">
                {children}
            </animated.div>
        </div>
    );
}

function OptionPanel({ showPanel, title, children }) {
    const panelAnimation = useSpring({
        opacity: showPanel ? 1 : 0,
        transform: showPanel ? "translateX(0%)" : "translateX(100%)",
        config: showPanel ? {
            mass: 0.1,
            tension: 514
        } : {
            mass: 0.1,
            tension: 314
        }
    });

    return (
        <div style={{ zIndex: showPanel ? "8" : "-1" }} className="vertical-visibility-container">
            <animated.div style={panelAnimation}>
                <Paper >
                    <div className="option-panel">
                        {title}
                        {children}
                    </div>
                </Paper>
            </animated.div>
        </div>
    );
}

function Option({ optionName, optionIcon, onClick, children, selected }) {

    return (
        <div className="option">
            {children ? children : ""}
            <Button className={(selected ? 'selected-button ' : '') + "option-button"} onClick={(onClick ? onClick : null)} >
                {optionIcon}
                {optionName}
            </Button>
        </div>
    );
}

export default function BottomOptions({ messages, language, setLanguage, profile, logoutHandler, exportRef, projectName }) {
    const urlParam = useParams('/project/:id');

    const [showCategory, setShowCategory] = useState(false);
    const [showLanguagePanel, setShowLanguagePanel] = useState(false);
    const [showStylePanel, setShowStylePanel] = useState(false);
    const [showExportPanel, setShowExportPanel] = useState(false);
    const [showSharePanel, setShowSharePanel] = useState(false);

    const [usersSearched, setUsersSearched] = useState();
    const [lockSearch, setLockSearch] = useState(false);
    const [email, setEmail] = useState("");

    const modalAnimation = useSpring({
        zIndex: showSharePanel ? 4 : -1,
        opacity: showSharePanel ? 1 : 0,
        config: {
            mass: 0.1,
            tension: 314
        },
        immediate: (key) => key === (showSharePanel ? "zIndex" : "")
    });


    useEffect(() => {
        if (lockSearch) { return }
        if (usersSearched && usersSearched[0] === 'search') {
            if (email === '') {
                setUsersSearched(null);
                return;
            }

            setLockSearch(true);
            api.get(`/invite/user/?email=${email}`).then((data) => {
                const decodedData = jwtDecode(data.data);
                if (!decodedData[0]) {
                    setUsersSearched("anyFound");
                    return;
                }

                setUsersSearched(decodedData);
            }).catch((e) => {
            }).finally(() => {
                setLockSearch(false);
            });
        }
    }, [usersSearched, email, lockSearch]);

    // useEffect(() => {
    //     if () {

    //     }
    // }, []);

    const toggleCategories = () => {
        setShowCategory(!showCategory);
        setShowLanguagePanel(false);
        setShowStylePanel(false);
        setShowExportPanel(false);
        setShowSharePanel(false);
    };

    const hideAllPanels = () => {
        setShowLanguagePanel(false);
        setShowStylePanel(false);
        setShowExportPanel(false);
        setShowSharePanel(false);
    };

    const onLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);
        setShowLanguagePanel(false);
    };

    const hideOptions = () => {
        setShowCategory(false);
        hideAllPanels();
    }

    return messages.languages_button_title ? (
        <>
            <animated.div style={modalAnimation} onClick={() => { setShowSharePanel(false) }} >
                <Modal >
                    <Grow
                        onClick={e => e.stopPropagation()}
                        in={showSharePanel}
                        style={{ transformOrigin: '50% 0 0' }}
                        {...(showSharePanel ? { timeout: 500 } : {})}
                    >
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            width: "20rem",
                        }}>
                            <Paper>
                                <div className="user-search-container" >
                                    {messages.share_project_button_title}

                                    <form action="" onSubmit={(e) => {
                                        e.preventDefault();
                                    }}>
                                        <input type="text" placeholder="Email" value={email} onChange={(e) => {
                                            setEmail(e.target.value)
                                        }} />

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            width: '100%',
                                            gap: '4px'
                                        }}>
                                            <input type="button" value={messages.user_search} onClick={() => { setUsersSearched(['search']) }} />
                                            <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setShowSharePanel(false); setUsersSearched(null) }} />
                                        </div>
                                    </form>
                                </div>
                            </Paper>

                            {usersSearched && (<Paper style={{
                                display: "flex",
                                justifyContent: "center"
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '18rem',
                                    margin: '1.5dvh 0.25dvh',
                                    gap: '1vh'
                                }}>
                                    {usersSearched !== 'anyFound' ?
                                        (usersSearched.length === 0 ? (<UserInformationItem />) : (usersSearched.map((user, index) => {
                                            return (<UserInformationItem key={index} name={user.name} email={user.email} nick={user.username} picturePath={user.picture_path} />)
                                        }))) : (<p style={{ display: "flex", width: "100%", textAlign: "center", fontSize: "85%" }}>{`${messages.any_user_found_with_email} ${email}`}</p>)}
                                </div>
                            </Paper>)}
                        </div>
                    </Grow>
                </Modal>
            </animated.div>


            <ClickAwayListener onClickAway={hideOptions}>
                <div style={{
                    zIndex: showCategory ? '18' : '8'
                }} className="bottom-modal" >
                    <Button style={{
                        zIndex: showCategory ? '20' : '10'
                    }} id="bottom-button" onClick={toggleCategories}>
                        <TreeDotsIcon />
                    </Button>
                    <OptionsMenu showCategory={showCategory} setShowCategory={setShowCategory}>
                        <Option optionName={messages.languages_button_title} optionIcon={<i className="bi bi-globe2"></i>} onClick={() => { hideAllPanels(); setShowLanguagePanel(!showLanguagePanel) }} selected={showLanguagePanel}>
                            <OptionPanel showPanel={showLanguagePanel} title={messages.languages_button_title}>
                                <select onChange={onLanguageChange} value={language}>
                                    <option value="en">English</option>
                                    <option value="pt-BR">Português</option>
                                </select>
                            </OptionPanel>
                        </Option>
                        {urlParam.id && (
                            <>
                                <Option optionName={messages.styles_button_title} optionIcon={<i className="bi bi-palette-fill"></i>} onClick={() => { hideAllPanels(); setShowStylePanel(!showStylePanel) }}>
                                    <OptionPanel showPanel={showStylePanel} title={messages.styles_button_title}>

                                    </OptionPanel>
                                </Option>
                                <Option optionName={messages.export_project_button_title} optionIcon={<i className="bi bi-download"></i>} onClick={() => { hideAllPanels(); setShowExportPanel(!showExportPanel) }}>
                                    <OptionPanel showPanel={showExportPanel} >
                                        <Button onClick={() => {
                                            exportComponentAsPNG(exportRef, {
                                                fileName: `${projectName ?? 'document'}.png`, html2CanvasOptions: {
                                                    onclone: (clonedDoc) => {
                                                        clonedDoc.getElementById("project-visualizer").style.margin = "40px 60px 60px 40px";
                                                    },
                                                },
                                            })
                                        }} className={'file-export-button'}><i className="bi bi-file-earmark-image-fill"></i>{messages.export_file_as_png}</Button>
                                        <Button onClick={() => { generatePDF(exportRef, { filename: `${projectName ?? 'document'}.pdf`, page: { margin: Margin.SMALL } }) }} className={'file-export-button'}><i className="bi bi-file-earmark-pdf-fill"></i>{messages.export_file_as_pdf}</Button>
                                    </OptionPanel>
                                </Option>
                                <Option optionName={messages.share_project_button_title} optionIcon={<i className="bi bi-share-fill"></i>} onClick={() => {
                                    hideAllPanels();
                                    setShowCategory(false);
                                    setShowSharePanel(!showSharePanel)
                                }} />
                            </>
                        )}

                        {profile && (
                            <Option onClick={() => {
                                logoutHandler();
                                hideOptions();
                            }} optionName={messages.account_logout_button_title} optionIcon={<i className="bi bi-door-open"></i>} />
                        )}
                    </OptionsMenu>
                </div>
            </ClickAwayListener >
        </>
    ) : (<></>);
}

function UserInformationItem({ name, nick, email, picturePath }) {
    return ((!name || !email) ?
        (
            <div className="user-invite-item">
                <Skeleton variant="circular" width={35} height={35} />
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "4px",
                    height: "100%"
                }}>
                    <div className="user-identifier"><Skeleton variant="rectangular" width={80} height={13.5} /> <Skeleton variant="rectangular" width={120} height={13.5} /></div>
                    <Skeleton variant="rectangular" width={190} height={13.5} />
                </div>
            </div>
        ) : (
            <div className="user-invite-item">
                {picturePath ? (<img src={picturePath} alt="" />) : (<Skeleton variant="circular" width={35} height={35} />)}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%"
                }}>
                    <div className="user-identifier">{name ? (<h4>{name}</h4>) : (<Skeleton variant="rectangular" width={80} height={13.5} />)}{(name && nick) ? (<div className="dot">•</div>) : (<></>)}{nick ? (<p>{nick}</p>) : (<Skeleton variant="rectangular" width={120} height={13.5} />)}</div>
                    {email ? (<p className="user-invite-item-email" title={email} >{email}</p>) : (<Skeleton variant="rectangular" width={190} height={13.5} />)}
                </div>
            </div>
        )
    );
}