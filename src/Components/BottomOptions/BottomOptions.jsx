import { TreeDotsIcon } from "../Icons/Icons";
import { useSpring, animated } from "react-spring";
import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import "./BottomOptions.css";
import { useParams } from "react-router-dom";

import { Avatar, Grow, Paper, Skeleton, Tooltip, tooltipClasses } from "@mui/material";
import { exportComponentAsPNG } from "react-component-export-image";
import generatePDF, { Margin } from "react-to-pdf";
import Modal from "../Modal/Modal";
import getApi from "../../Api/api";
import { jwtDecode } from "jwt-decode";
import styled from "@emotion/styled";

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

export default function BottomOptions({ messages, language, setLanguage, profile, logoutHandler, exportRef, projectName, actualProjectPermission }) {
    const urlParam = useParams('/project/:id');
    const api = getApi();

    const [showCategory, setShowCategory] = useState(false);
    const [showLanguagePanel, setShowLanguagePanel] = useState(false);
    const [showStylePanel, setShowStylePanel] = useState(false);
    const [showExportPanel, setShowExportPanel] = useState(false);
    const [showSharePanel, setShowSharePanel] = useState(false);

    const [usersSearched, setUsersSearched] = useState("search");
    const [lockSearch, setLockSearch] = useState(false);
    const [searchUsedText, setSearchUsedText] = useState();
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
        if (usersSearched === 'search') {
            if (email === '') {
                setUsersSearched(null);
                return;
            }

            setSearchUsedText(email);
            setLockSearch(true);
            api.get(`/invite/user/?search=${email}&project_id=${urlParam.id}`).then((data) => {
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
    }, [usersSearched, api, urlParam, email, lockSearch]);

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
            {(actualProjectPermission && (actualProjectPermission === "own" || actualProjectPermission === "manage")) && (<animated.div style={modalAnimation} onClick={() => { setShowSharePanel(false) }} >
                <Modal >
                    <Grow
                        onClick={e => e.stopPropagation()}
                        in={showSharePanel}
                        style={{ transformOrigin: '50% 0 0' }}
                        {...(showSharePanel ? { timeout: 350 } : {})}
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
                                        if (email !== "") {
                                            setUsersSearched('search');
                                        }
                                    }}>
                                        <input type="text" placeholder={messages.user_search_input_label} value={email} onChange={(e) => {
                                            setEmail(e.target.value)
                                        }} />

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            width: '100%',
                                            gap: '4px'
                                        }}>
                                            <input type="button" value={messages.user_search} onClick={() => {
                                                if (email !== "") {
                                                    setUsersSearched('search');
                                                }
                                            }} />
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
                                    margin: '1.5dvh',
                                    gap: '1vh'
                                }}>
                                    {usersSearched !== 'anyFound' ?
                                        (typeof usersSearched === 'string' ? (<UserInformationItem messages={messages} />) : (usersSearched?.map((user, index) => {
                                            return (<UserInformationItem profile={profile} messages={messages} key={index} userId={user.id} projectId={urlParam.id} name={user.name} email={user.email} nick={user.username} picturePath={user.picture_path} lockSearch={lockSearch} setLockSearch={setLockSearch} alreadyInvited={(user.user_permissions && user.user_permissions !== "none") ? true : false} />)
                                        }))) : (<p style={{ display: "flex", width: "100%", textAlign: "center", fontSize: "85%" }}>{`${messages.any_user_found_with_email}  ${searchUsedText}`}</p>)}
                                </div>
                            </Paper>)}
                        </div>
                    </Grow>
                </Modal>
            </animated.div>)}


            <div style={{
                position: "fixed",
                height: "100dvh",
                width: "100dvw",
                pointerEvents: showCategory ? "all" : "none",
                zIndex: showCategory ? "10" : "-1",
            }} onClick={hideOptions}>
            </div >

            <div style={{
                zIndex: showCategory ? '18' : '8'
            }} onClick={e => e.stopPropagation()} className="bottom-modal" >
                <Button style={{
                    zIndex: showCategory ? '20' : '10',
                    textAlign: "center"
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
                            {(actualProjectPermission && (actualProjectPermission === "own" || actualProjectPermission === "manage")) && (<Option optionName={messages.styles_button_title} optionIcon={<i className="bi bi-palette-fill"></i>} onClick={() => { hideAllPanels(); setShowStylePanel(!showStylePanel) }}>
                                <OptionPanel showPanel={showStylePanel} title={messages.styles_button_title}>

                                </OptionPanel>
                            </Option>)}
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
                            {(actualProjectPermission && (actualProjectPermission === "own" || actualProjectPermission === "manage")) && (<Option optionName={messages.share_project_button_title} optionIcon={<i className="bi bi-share-fill"></i>} onClick={() => {
                                hideAllPanels();
                                setShowCategory(false);
                                setShowSharePanel(!showSharePanel)
                            }} />)}
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
        </>
    ) : (<></>);
}

function UserInformationItem({ profile, name, userId, projectId, nick, email, picturePath, alreadyInvited, lockSearch, setLockSearch, messages }) {
    const api = getApi();

    const [isInvited, setIsInvited] = useState(alreadyInvited);
    const [confirmChoice, setConfirmChoice] = useState(false);
    const [sendInvite, setSendInvite] = useState(false);

    useEffect(() => {
        if (sendInvite && !lockSearch) {
            setLockSearch(true);

            api.put(`/invite/user/?user_id=${userId}&project_id=${projectId}`).then(() => {
                setIsInvited(true);
            }).catch().finally(() => {
                setLockSearch(false);
                setSendInvite(false);
            })
        }
    }, [sendInvite, api, setLockSearch, lockSearch, projectId, userId]);

    const animation = useSpring({
        left: confirmChoice ? "110%" : "10%",
        opacity: confirmChoice ? "1" : "0",
    });

    const inviteAnimation = useSpring({
        transform: isInvited ? "scale(1)" : "scale(0.7)",
        opacity: confirmChoice ? "0" : "1",
        config: {
            mass: 0.4,
            tension: 337,
            friction: 10
        }
    });

    const HtmlTooltip = styled(({ className, ...props }) => (
        <Tooltip arrow {...props} placement="bottom" enterDelay={500} classes={{ popper: className }} slotProps={{
            popper: {
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -30],
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
            border: 'solid 0.1dvh rgba(146, 146, 146, 0.719)',

            fontSize: '10px',
            textAlign: 'center',
            maxWidth: '170px'
        },
    }));


    return ((!name || !email) ?
        (
            <div style={{ cursor: "progress" }} className="user-invite-item no-select">
                <Skeleton variant="circular" width={40} height={40} />
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
            <div style={{ position: "relative" }}>
                <div onClick={() => { confirmChoice && setConfirmChoice(false) }}>
                    <animated.div className="invite-this-user" onClick={e => e.stopPropagation()} style={animation}>
                        <Paper className="paper">

                            <form action="" onSubmit={e => e.preventDefault()}>
                                <label>{messages.invite_this_user}?</label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    width: '100%',
                                    gap: '4px'
                                }}>
                                    <input type="button" style={{ cursor: lockSearch ? "progress" : "pointer" }} value={messages.confirm_invite} onClick={() => {
                                        if (!lockSearch) {
                                            setSendInvite(true);
                                            setConfirmChoice(false);
                                        }
                                    }} />
                                    <input type="button" value={messages.add_card_hologram_cancel} onClick={() => { setConfirmChoice(false) }} />
                                </div>
                            </form>
                        </Paper>
                    </animated.div>
                </div>

                <div onClick={() => {
                    if (!isInvited) {
                        setConfirmChoice(!confirmChoice);
                    }
                }} className={`user-invite-item ${isInvited && "no-select"}`}>
                    {picturePath ? (<Avatar src={picturePath} />) : (<Skeleton variant="circular" width={40} height={40} />)}
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

                {isInvited && (<HtmlTooltip title={(profile && profile.email === email) ? messages.this_is_you : messages.already_invited} >
                    <animated.div className="already-invited" style={inviteAnimation}>
                        <div className="content">
                            {(profile && profile.email === email) ? <i className="bi bi-person-square"></i> : <i className="bi bi-check-square"></i>}
                        </div>
                    </animated.div>
                </HtmlTooltip>)}
            </div >
        )
    );
}