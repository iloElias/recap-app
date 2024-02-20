import { Editor } from "@monaco-editor/react";
import React, { useCallback, useEffect, useState } from "react";
import "./Project.css";
import { useParams } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import axios from "axios";
import { Alert, Snackbar } from "@mui/material";

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
    const [isMobile, setIsMobile] = useState(explodeMinSize());

    const [alertMessage, setAlertMessage] = useState();
    const [alert, openAlert] = useState();
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [notification, setNotification] = useState();
    const [notificationMessage, setNotificationMessage] = useState();

    const [markdownText, setMarkdownText] = useState('');
    const [saveProject, setSaveProject] = useState(false);
    const urlParam = useParams('/project/:id');
    const [projectData, setProjectData] = useState({ pre_id: urlParam.id })
    const [projectAccess, setProjectAccess] = useState('notDef')

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
            // TODO
        }
    }, [projectData]);

    const handleFileSave = () => {
        setSaveProject(true);
    }

    return (
        projectAccess === 'own' ? (
            <div className="project-editor-container">
                <animated.div className="project-visualizer" style={!isMobile ? editorVisualizerAnimation : null} >
                    {urlParam.id}
                </animated.div>

                <div className="editor-tab">
                    <animated.div className="code-editor" style={!isMobile ? editorSideAnimation : editorBottomAnimation}>
                        <div className="editor-buttons">
                            <button className="close-button rotate-button" onClick={() => {
                                setOpenEditor(!openEditor);
                            }}><animated.div style={!isMobile ? editorButtonAnimation : editorButtonMobileAnimation}><i className="bi bi-arrow-bar-left"></i></animated.div></button>
                            <button className="close-button" onClick={() => { }}><i className="bi bi-arrow-clockwise"></i></button>
                            <button className="close-button" onClick={handleFileSave}><i className="bi bi-floppy"></i></button>
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
                                fontSize: (!isMobile ? "12px" : "8px"),
                                formatOnType: true,
                                autoClosingBrackets: true,
                                minimap: {
                                    enabled: false
                                }
                            }}
                        />
                    </animated.div>
                </div>

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
            </div>) : (
            <></>
        )
    );
}