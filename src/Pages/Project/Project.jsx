import { Editor } from "@monaco-editor/react";
import React, { useCallback, useEffect, useState } from "react";
import "./Project.css";
import { useParams } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

import { Link } from 'react-router-dom'

import { Alert, Snackbar, Tooltip, tooltipClasses } from "@mui/material";
import NotFound from "../../Components/NotFound/NotFound";
import Markdown from "react-markdown";
import styled from "@emotion/styled";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`,
});

const getWindowSize = () => {
    return { height: window.innerHeight, width: window.innerWidth };
}

const explodeMinSize = () => {
    if (getWindowSize().width <= 640) {
        return true;
    }
    return false;
}

let lastSavedValue = null;
let lastSavedTime = null;
const cooldownPeriod = 5000;

export default function Project({ messages, setLoading }) {
    const [openEditor, setOpenEditor] = useState(true);
    const [userForceMobile, setUserForceMobile] = useState(explodeMinSize());
    const [isMobile, setIsMobile] = useState(explodeMinSize());

    const [alertMessage, setAlertMessage] = useState();
    const [alert, openAlert] = useState();
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [notification, setNotification] = useState();
    const [notificationMessage, setNotificationMessage] = useState();

    const [notFoundProject, setNotFoundProject] = useState();

    const [markdownText, setMarkdownText] = useState('');
    const [localMarkdownText, setLocalMarkdownText] = useState('');
    const [saveProject, setSaveProject] = useState(false);
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
        marginLeft: openEditor ? '60.5dvh' : '9dvh'
    });

    // Buttons animation
    const editorButtonAnimation = useSpring({
        rotate: openEditor ? '0deg' : '180deg'
    });
    const editorButtonMobileAnimation = useSpring({
        rotate: openEditor ? '-90deg' : '90deg'
    });

    const saveFileToDatabase = useCallback((fileValue, projectId) => {
        if (fileValue === lastSavedValue) {
            return;
        }

        const currentTime = Date.now();
        if (lastSavedTime && (currentTime - lastSavedTime < cooldownPeriod)) {
            const remainingCooldown = cooldownPeriod - (currentTime - lastSavedTime);
            return remainingCooldown;
        }

        const receivedToken = localStorage.getItem("recap@localUserProfile");

        setLoading(true);
        api.put(`/project/?project_id=${projectId}`, [{ imd: fileValue }], {
            headers: {
                Authorization: `Bearer ${receivedToken}`,
            }
        }).then((e) => {
            setLoading(false);
            setAlertMessage(`${messages.item_updated}`.replace(':str', messages.card));
            setAlertSeverity('success')
            openAlert(true);
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
    }, [messages, setAlertMessage, setAlertSeverity, openAlert, setLoading]);

    useEffect(() => {
        if (saveProject) {
            saveFileToDatabase(markdownText, urlParam.id);
            setSaveProject(false);
        }
    }, [saveProject, markdownText, urlParam, saveFileToDatabase]);

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
    }, [projectData, messages, setProjectData, setLocalMarkdownText, setMarkdownText, setLoading]);

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
            {projectAccess ? (
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
                                <BootstrapTooltip title={messages.legend_save_current_state} placement={(!isMobile && !userForceMobile) ? "right" : "top"} arrow leaveDelay={100} >
                                    <button className="close-button" onClick={handleFileSave}><i className="bi bi-floppy"></i></button>
                                </BootstrapTooltip>
                                {!explodeMinSize() &&
                                    <BootstrapTooltip title={messages.legend_toggle_mobile_desktop} placement={(!isMobile && !userForceMobile) ? "right" : "top"} arrow leaveDelay={100} >
                                        <button className="close-button" onClick={toggleMobile}>{(!isMobile && !userForceMobile) ? (<i className="bi bi-phone"></i>) : (<i className="bi bi-window-fullscreen"></i>)}</button>
                                    </BootstrapTooltip>}
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
                </div >) : (
                <>
                </>
            )}

            {notFoundProject && <NotFound>
                <p>{notFoundProject === 'notAllowed' ? (messages.not_invited_to) : (messages.not_found_project)}</p>
                <Link to="/">{messages.go_back_home}</Link>
            </NotFound>}

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