import React, { useState } from "react";
import "./Input.css";
import { useSpring, animated } from "react-spring";

export default function Input({ type, messages, required, onSubmit, placeholder, submitRule, value, update }) {
    const [inputValue, setInputValue] = useState('');
    const invalidMessage = submitRule('');

    const requiredAnimation = useSpring({
        opacity: ((required && submitRule(inputValue) !== true)) ? 1 : 0,
        config: {
            tension: 500,
            friction: 30
        },
        immediate: (key) => key === (required ? "backgroundColor" : "")
    });

    const inputSubmitHandler = (targetValue) => {
        setInputValue(targetValue)

        if (update) {
            update(inputValue);
        }

        if (onSubmit) {
            onSubmit(inputValue);
            setInputValue('')
        }
    }

    return (
        <div className="input-container">
            <input className="form_input" type={type || "text"} onChange={(e) => { inputSubmitHandler(e.target.value); update(e.target.value) }} placeholder={placeholder} value={value || inputValue} />
            <animated.div style={requiredAnimation} className="display-error-message">{("*" + invalidMessage).replace(':str', 4)}</animated.div>
        </div>
    );
}

export function TextArea({ required, onSubmit, placeholder, value, submitRule, update }) {
    const [inputValue, setInputValue] = useState('');
    const invalidMessage = submitRule('');

    const requiredAnimation = useSpring({
        opacity: ((required && submitRule(inputValue) !== true)) ? 1 : 0,
        config: {
            tension: 500,
            friction: 30
        },
        immediate: (key) => key === (required ? "backgroundColor" : "")
    });

    const inputSubmitHandler = (targetValue) => {
        setInputValue(targetValue)

        if (update) {
            update(inputValue);
        }

        if (onSubmit) {
            onSubmit(inputValue);
            setInputValue('')
        }
    }

    return (
        <div className="input-container">
            <textarea className="form_input" onChange={(e) => { inputSubmitHandler(e.target.value); update(e.target.value) }} placeholder={placeholder} value={value || inputValue} ></textarea>
            <animated.div style={requiredAnimation} className="display-error-message">{("*" + invalidMessage).replace(':str', 4)}</animated.div>
        </div>
    );
}