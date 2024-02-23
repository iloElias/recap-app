import { Editor } from "@monaco-editor/react";
import React, { useCallback, useEffect, useState } from "react";
import "./Project.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { jwtDecode } from 'jwt-decode';

import { Link } from 'react-router-dom'

import { Alert, Paper, Snackbar, Tooltip, tooltipClasses, Grow } from "@mui/material";
import NotFound from "../../Components/NotFound/NotFound";
import Markdown from "react-markdown";
import styled from "@emotion/styled";
import getApi from "../../Api/api";
import Modal from "../../Components/Modal/Modal";
import Button from "../../Components/Button/Button";
import Input from "../../Components/Input/Input";

const api = getApi();

const getWindowSize = () => {
    return { height: window.innerHeight, width: window.innerWidth };
}

const explodeMinSize = () => {
    if (getWindowSize().width <= 640) {
        return true;
    }
    return false;
}

const saveMarkdownWaitTime = 5000;

export default function Project({ messages, setLoading }) {
    const [openEditor, setOpenEditor] = useState(true);
    const [userForceMobile, setUserForceMobile] = useState(explodeMinSize());
    const [isMobile, setIsMobile] = useState(explodeMinSize());

    const [deleteValue, setDeleteValue] = useState();
    const [required, setRequired] = useState(false);

    const [modalContent, setModalContent] = useState(<></>);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const [alertMessage, setAlertMessage] = useState();
    const [alert, openAlert] = useState();
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [notification, setNotification] = useState();
    const [notificationMessage, setNotificationMessage] = useState();

    const [notFoundProject, setNotFoundProject] = useState();

    const [markdownText, setMarkdownText] = useState('');
    const [localMarkdownText, setLocalMarkdownText] = useState('');
    const [saveProject, setSaveProject] = useState(false);
    const [lastSavedValue, setLastSavedValue] = useState();
    const [lastSavedTime, setLastSavedTime] = useState(Date.now);

    const [goHome, setGoHome] = useState(false);
    const urlParam = useParams('/project/:id');
    const [projectData, setProjectData] = useState({ pre_id: urlParam.id })
    const [projectAccess, setProjectAccess] = useState()

    window.addEventListener('resize', () => { setIsMobile(explodeMinSize()) });

    // Code editor animations
    const editorSideAnimation = useSpring({
        transform: openEditor ? 'translateX(0%)' : 'translateX(-100%)',
    });
    const editorBottomAnimation = useSpring({
        transform: openEditor ? 'translateY(0%)' : 'translateY(100%)',
    });

    // Project visualizer animations
    const editorVisualizerAnimation = useSpring({
        marginLeft: openEditor ? 'max(60.5dvh, calc(55.5dvh + 33px))' : 'max(9dvh, calc(9dvh + 0px))'
    });

    // Buttons animation
    const editorButtonAnimation = useSpring({
        rotate: openEditor ? '0deg' : '180deg'
    });
    const editorButtonMobileAnimation = useSpring({
        rotate: openEditor ? '-90deg' : '90deg'
    });

    // Modal animation
    const modalAnimation = useSpring({
        zIndex: showModal ? 4 : -1,
        opacity: showModal ? 1 : 0,
        config: {
            mass: 0.1,
            tension: 314
        },
        immediate: (key) => key === (showModal ? "zIndex" : "")
    });

    const saveHandle = useCallback((fileValue, projectId) => {
        if (fileValue === lastSavedValue) {
            if (goHome) {
                setShowModal(false);
                setAlertMessage(`${messages.item_updated_returning_home}`.replace(':str', messages.card));
                setAlertSeverity('success')
                openAlert(true);
                setShowModal(false);
                setLoading(true);

                setTimeout(() => {
                    setLoading(false);
                    navigate('/projects');
                }, 2000);
            }
            return;
        }

        const currentTime = Date.now();
        if (lastSavedTime && (currentTime - lastSavedTime < saveMarkdownWaitTime)) {
            const remainingWaitTime = saveMarkdownWaitTime - (currentTime - lastSavedTime);
            return remainingWaitTime;
        }

        const receivedToken = localStorage.getItem("recap@localUserProfile");

        setLoading(true);
        api.put(`/project/?project_id=${projectId}`, [{ imd: fileValue }], {
            headers: {
                Authorization: `Bearer ${receivedToken}`,
            }
        }).then((e) => {
            setLastSavedTime(Date.now());
            setLastSavedValue(fileValue);
            if (goHome) {
                setShowModal(false);
                setAlertMessage(`${messages.item_updated}`.replace(':str', messages.card));
                setAlertSeverity('success')
                openAlert(true);

                setTimeout(() => {
                    navigate('/projects');
                }, 2000);
            }
            openAlert(true);
            setAlertSeverity('success')
            setAlertMessage(`${messages.item_updated_returning_home}`.replace(':str', messages.card));
            setLoading(false);
        }).catch((e) => {
            setLoading(false);
            if (e.response.status === 400) {
                setAlertMessage(`${messages.item_update_error}`.replace(':str', messages.card));
                setAlertSeverity('error')
            } else if (e.response.status === 405) {
                setAlertMessage(messages.not_allowed_to_edit);
                setAlertSeverity('error')
            } else if (e.response.status === 404) {
                setNotFoundProject(true)
            } else if (e.response.status === 500) {
                setAlertMessage(`${messages.item_update_error}`.replace(':str', messages.card));
                setAlertSeverity('error')
            }
            openAlert(true);
        })
    }, [messages, goHome, lastSavedValue, lastSavedTime, setAlertMessage, setLastSavedTime, setLastSavedValue, setAlertSeverity, openAlert, navigate, setLoading]);

    const deleteHandle = () => {
        if (deleteValue === projectAccess.name) {

        }
    }

    const exitProjectHandler = useCallback((fileValue) => {
        if (fileValue === lastSavedValue) {
            navigate('/projects');
        }

        setModalContent('exit');
        setShowModal(true);
    }, [navigate, setShowModal, setModalContent, lastSavedValue]);

    const deleteProjectHandler = useCallback(() => {
        setModalContent("delete");
        setShowModal(true);
    }, [setModalContent, setShowModal]);

    useEffect(() => {
        if (saveProject) {
            saveHandle(markdownText, urlParam.id);
            setSaveProject(false);
        }
    }, [saveProject, markdownText, urlParam, saveHandle]);

    useEffect(() => {
        if (projectData.pre_id) {
            setNotificationMessage(messages.loading_your_project);
            setNotification(true)
            setLoading(true);

            const receivedToken = localStorage.getItem("recap@localUserProfile");

            api.get(`/project/markdown?project_id=${projectData.pre_id}`, {
                headers: {
                    Authorization: `Bearer ${receivedToken}`,
                }
            }).then((data) => {
                const decodedData = jwtDecode(data.data);

                setLastSavedValue(decodedData[0].imd);
                setProjectData(decodedData[0]);
                setLoading(false);
            }).catch((e) => {
                setLoading(false);
                if (e.response.status === 404) {
                    setNotFoundProject('notFound');
                } else if (e.response.status === 405) {
                    setNotFoundProject('notAllowed');
                }
            })
        }
        if (projectData.id) {
            setMarkdownText(projectData.imd);
            setLocalMarkdownText(projectData.imd);
            setProjectAccess(projectData.user_permissions)
        }
    }, [projectData, messages, setLastSavedValue, setProjectData, setLocalMarkdownText, setMarkdownText, setLoading]);

    const handleFileSave = () => {
        setSaveProject(true);
    }

    const handleReload = () => {
        setLocalMarkdownText(markdownText);
    }

    const toggleMobile = () => {
        setUserForceMobile(!userForceMobile);
    }


    const BootstrapTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.arrow}`]: {
            color: '#212121',
        },
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#212121',
            color: '#fafafa',
            border: 'none',
            fontFamily: 'Inter',
            fontSize: '2vh',
            padding: '1vh'
        },
    }));

    return (
        <>
            {projectAccess || notFoundProject ? (
                <div id="project-editor" className={(!isMobile && !userForceMobile ? '' : 'mobile ') + "project-editor-container"}>
                    <animated.div id="project-visualizer" className="project-visualizer" style={(!isMobile && !userForceMobile) ? editorVisualizerAnimation : null} >
                        <div id="text-container" className="transpiled-text-container">
                            <Markdown>{localMarkdownText}</Markdown>
                        </div>
                    </animated.div>

                    <div className="editor-tab">
                        <animated.div className="code-editor" style={(!isMobile && !userForceMobile) ? editorSideAnimation : editorBottomAnimation}>
                            <div className="editor-buttons">
                                <BootstrapTooltip title={messages.legend_hide_code_editor} placement={(!isMobile && !userForceMobile) ? "right" : "top"} arrow leaveDelay={100} >
                                    <button className="close-button rotate-button" onClick={() => {
                                        setOpenEditor(!openEditor);
                                    }}><animated.div style={(!isMobile && !userForceMobile) ? editorButtonAnimation : editorButtonMobileAnimation}><i className="bi bi-arrow-bar-left"></i></animated.div></button>
                                </BootstrapTooltip>
                                <BootstrapTooltip title={messages.legend_reload_view} placement={(!isMobile && !userForceMobile) ? "right" : "top"} arrow leaveDelay={100} >
                                    <button className="close-button" onClick={handleReload}><i className="bi bi-arrow-clockwise"></i></button>
                                </BootstrapTooltip>

                                {(projectAccess === 'own') && (<BootstrapTooltip title={messages.legend_save_current_state} placement={(!isMobile && !userForceMobile) ? "right" : "top"} arrow leaveDelay={100} >
                                    <button className="close-button" onClick={handleFileSave}><i className="bi bi-floppy"></i></button>
                                </BootstrapTooltip>)}

                                {!explodeMinSize() &&
                                    <BootstrapTooltip title={messages.legend_toggle_mobile_desktop} placement={(!isMobile && !userForceMobile) ? "right" : "top"} arrow leaveDelay={100} >
                                        <button className="close-button" onClick={toggleMobile}>{(!isMobile && !userForceMobile) ? (<i className="bi bi-phone"></i>) : (<i className="bi bi-window-fullscreen"></i>)}</button>
                                    </BootstrapTooltip>}
                                <BootstrapTooltip title={messages.go_back_home} placement={(!isMobile && !userForceMobile) ? "right" : "top"} arrow leaveDelay={100} >
                                    <button onClick={(projectAccess === 'own' ? exitProjectHandler : () => { navigate('/projects') })} className="close-button"><i className="bi bi-door-open"></i></button>
                                </BootstrapTooltip>
                                {(projectAccess === 'own') && (<BootstrapTooltip title={messages.legend_delete_this_project} placement={(!isMobile && !userForceMobile) ? "right" : "top"} arrow leaveDelay={100} >
                                    <button onClick={deleteProjectHandler} style={{ color: "red" }} className="close-button"><i className="bi bi-trash3"></i></button>
                                </BootstrapTooltip>)}
                            </div>

                            <Editor
                                width="100%"
                                height="100%"

                                value={markdownText}
                                language="markdown"
                                theme="vs-dark"

                                onChange={(value) => {
                                    setMarkdownText(value);
                                }}

                                options={{
                                    inlineSuggest: true,
                                    fontSize: (!isMobile ? "12px" : "12px"),
                                    formatOnType: true,
                                    autoClosingBrackets: true,
                                    minimap: {
                                        enabled: false
                                    }
                                }}
                            />
                        </animated.div>
                    </div >

                    <animated.div style={modalAnimation} onClick={() => { setShowModal(false) }} >
                        <Modal >
                            <Grow
                                onClick={e => e.stopPropagation()}
                                in={showModal}
                                style={{ transformOrigin: '50% 0 0' }}
                                {...(showModal ? { timeout: 500 } : {})}
                            >

                                <Paper>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        maxWidth: '20rem',
                                        padding: '2.5dvh 4dvh',
                                        gap: '1vh'
                                    }} >
                                        {modalContent === "delete" ?
                                            (<form onSubmit={e => { e.preventDefault(); setRequired(true) }}>
                                                <h3>{messages.delete_project}</h3>
                                                <p style={{ fontSize: "14px" }}>{`${messages.delete_project_confirm}`.split(':str')[0]} <strong>{projectData.name}</strong>{`${messages.delete_project_confirm}`.split(':str')[1]}</p>
                                                <p style={{ fontSize: "13px" }}>{`${messages.delete_project_confirm_input}`.split(':str')[0]} <strong>{projectData.name}</strong>{`${messages.delete_project_confirm_input}`.split(':str')[1]}</p>

                                                <Input type="text" messages={messages} placeholder={messages.label_card_name} required={required} submitRule={(value) => { return value === projectData.name ? true : messages.delete_project_confirm_input_invalid }} update={setDeleteValue} />
                                                <Button disabled={!(deleteValue === projectData.name) ? true : false} onClick={() => {
                                                    setRequired(true);
                                                    deleteHandle();
                                                }} style={{
                                                    width: '100%'
                                                }}>{messages.confirm}</Button>
                                            </form>) : (
                                                <>
                                                    <h3>{messages.save_project}</h3>
                                                    <Button onClick={() => {
                                                        setGoHome(true);
                                                        handleFileSave();
                                                    }} style={{
                                                        width: '100%'
                                                    }}>
                                                        {messages.save_than_leave}
                                                    </Button>
                                                    <Button onClick={() => { navigate('/projects') }} style={{
                                                        width: '100%'
                                                    }}>
                                                        {messages.leave_without_saving}
                                                    </Button>
                                                </>
                                            )
                                        }
                                    </div>
                                </Paper>
                            </Grow>
                        </Modal>
                    </animated.div>
                </div >) : (
                <>
                </>
            )
            }

            {
                notFoundProject && <NotFound>
                    <p>{notFoundProject === 'notAllowed' ? (messages.not_invited_to) : (messages.not_found_project)}</p>
                    <Link to="/">{messages.go_back_home}</Link>
                </NotFound>
            }

            < Snackbar
                open={notification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }
                }
                autoHideDuration={4000}
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