import { AboutUsIcon, GlobeIcon, LogoutIcon, TreeDotsIcon } from "../Icons/Icons";
import { useSpring, animated } from "react-spring";
import React, { useState } from "react";
import Button from "../Button/Button";
import "./BottomOptions.css";


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
        <div className="visibility-container">
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
        <div className="vertical-visibility-container">
            <animated.div style={panelAnimation} className="option-panel">
                {title}
                {children}
            </animated.div>
        </div>
    );
}

function Option({ optionName, optionIcon, onClick, children }) {

    return (
        <div className="option">
            {children ? children : ""}
            <Button id="option-button" onClick={(onClick ? onClick : null)} >
                {optionIcon}
                {optionName}
            </Button>
        </div>
    );
}

export default function BottomOptions({ messages, language, setLanguage, profile, logoutHandler }) {
    const [showCategory, setShowCategory] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    const toggleCategories = () => {
        setShowCategory(!showCategory);
        setShowPanel(false);
    };

    const toggleLanguagePanel = () => {
        setShowPanel(!showPanel);
    };

    const onLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);
        toggleLanguagePanel();
    };

    const disableAll = () => {
        if (showCategory || showPanel) {
            setShowPanel(false);
            setShowCategory(false);
        }
    };

    return messages.languages_button_title ? (
        <>
            <div style={{ display: (showCategory ? "flex" : "none") }} className="user-select-background" onClick={disableAll} />
            <div className="bottom-modal" onClick={(e) => e.stopPropagation()} >
                <Button id="bottom-button" onClick={toggleCategories}>
                    <TreeDotsIcon />
                </Button>
                <OptionsMenu showCategory={showCategory} setShowCategory={setShowCategory}>
                    <Option optionName={messages.languages_button_title} optionIcon={<GlobeIcon />} onClick={toggleLanguagePanel} >
                        <OptionPanel showPanel={showPanel} title={messages.languages_button_title}>
                            <select onChange={onLanguageChange} value={language}>
                                <option value="en">English</option>
                                <option value="pt-BR">Português</option>
                            </select>
                        </OptionPanel>
                    </Option>
                    <Option optionName={messages.about_us_button_title} optionIcon={<AboutUsIcon />} />
                    {profile && (
                        <Option onClick={() => {
                            logoutHandler();
                            disableAll();
                        }} optionName={messages.account_logout_button_title} optionIcon={<LogoutIcon />} />
                    )}
                </OptionsMenu>
            </div>
        </>
    ) : (<></>);
}
