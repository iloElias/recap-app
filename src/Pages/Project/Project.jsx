import { Editor, Monaco, useMonaco } from "@monaco-editor/react";
import React, { useEffect, useState } from "react";
import "./Project.css";
import { useParams } from "react-router-dom";
import { useSpring, animated } from "react-spring";

const getWindowSize = () => {
    return { height: window.innerHeight, width: window.innerWidth };
}

const explodeMinSize = () => {
    if (getWindowSize().width <= 640) {
        return true;
    }
    return false;
}

export default function Project() {
    const [openEditor, setOpenEditor] = useState(true);
    const [isMobile, setIsMobile] = useState(explodeMinSize())

    window.addEventListener('resize', () => { setIsMobile(explodeMinSize()) });

    const urlParam = useParams('/project/:id');

    const monaco = useMonaco();
    useEffect(() => { }, []);

    const editorSideAnimation = useSpring({
        transform: openEditor ? 'translateX(0%)' : 'translateX(-100%)',
    });

    const editorBottomAnimation = useSpring({
        transform: openEditor ? 'translateY(0%)' : 'translateY(100%)',
    });

    const editorButtonAnimation = useSpring({
        rotate: openEditor ? '0deg' : '180deg'
    });

    const editorVisualizerAnimation = useSpring({
        marginLeft: openEditor ? '60.5dvh' : '9dvh'
    });


    return (
        <div className="project-editor-container">
            <animated.div className="project-visualizer" style={!isMobile ? editorVisualizerAnimation : null} >
                {urlParam.id}
            </animated.div>

            <div className="editor-tab">
                <animated.div className="code-editor" style={!isMobile ? editorSideAnimation : editorBottomAnimation}>
                    <div className="editor-buttons">
                        <button className="close-button rotate-button" onClick={() => {
                            setOpenEditor(!openEditor);
                        }}><animated.div style={editorButtonAnimation}><i className="bi bi-arrow-bar-left"></i></animated.div></button>
                        <button className="close-button" onClick={() => { }}><i class="bi bi-arrow-clockwise"></i></button>
                    </div>

                    <Editor
                        width="100%"
                        height="100%"

                        language="markdown"
                        theme="vs-dark"

                        options={{
                            inlineSuggest: true,
                            fontSize: "14vh",
                            formatOnType: true,
                            autoClosingBrackets: true,
                            minimap: {
                                enabled: false
                            }
                        }}
                    />
                </animated.div>
            </div>
        </div>
    );
}