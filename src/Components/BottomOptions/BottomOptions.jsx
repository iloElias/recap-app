import { TreeDotsIcon } from "../Icons/Icons";
import { useSpring, animated } from "react-spring";
import React, { useState } from "react";
import Button from "../Button/Button";
import "./BottomOptions.css";
import { useParams } from "react-router-dom";

import { ClickAwayListener } from '@mui/base';
import { Paper } from "@mui/material";
import { exportComponentAsPNG } from "react-component-export-image";
import generatePDF, { Margin } from "react-to-pdf";

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
        <ClickAwayListener onClickAway={hideOptions}>
            <div style={{
                zIndex: showCategory ? '8' : '0'
            }} className="bottom-modal" >
                <Button id="bottom-button" onClick={toggleCategories}>
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
                            <Option optionName={messages.share_project_button_title} optionIcon={<i className="bi bi-share-fill"></i>} onClick={() => { hideAllPanels(); setShowSharePanel(!showSharePanel) }}>
                                <OptionPanel showPanel={showSharePanel} title={messages.share_project_button_title}>

                                </OptionPanel>
                            </Option>
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
    ) : (<></>);
}
