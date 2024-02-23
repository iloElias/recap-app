import React, { useEffect, useState } from "react";
import "./Input.css";
import { useSpring, animated } from "react-spring";

export default function Input({ type, required, onSubmit, placeholder, minSize, submitRule, value, update, resetValue }) {
    const [inputValue, setInputValue] = useState(value || '');
    const invalidMessage = submitRule('');

    const requiredAnimation = useSpring({
        opacity: ((required && submitRule(inputValue) !== true)) ? 1 : 0,
        config: {
            tension: 500,
            friction: 30
        },
        immediate: (key) => key === (required ? "backgroundColor" : "")
    });

    useEffect(() => {
        setInputValue('')
    }, [resetValue]);

    const inputSubmitHandler = (targetValue) => {
        setInputValue(targetValue)

        if (update) {
            update(inputValue);
        }

        if (onSubmit) {
            onSubmit(inputValue);
        }
    }

    return (
        <div className="input-container">
            <input value={inputValue} className="form-input" type={type || "text"} onChange={(e) => { inputSubmitHandler(e.target.value); update(e.target.value) }} placeholder={placeholder} />
            <animated.div style={requiredAnimation} className="display-error-message">{minSize ? ("*" + invalidMessage).replace(':str', minSize) : ("*" + invalidMessage)}</animated.div>
        </div>
    );
}

export function TextArea({ required, onSubmit, placeholder, value, minSize, submitRule, update, resetValue }) {
    const [inputValue, setInputValue] = useState(value || '');
    const invalidMessage = submitRule('');

    const requiredAnimation = useSpring({
        opacity: ((required && submitRule(inputValue) !== true)) ? 1 : 0,
        config: {
            tension: 500,
            friction: 30
        },
        immediate: (key) => key === (required ? "backgroundColor" : "")
    });

    useEffect(() => {
        setInputValue('')
    }, [resetValue]);

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
            <textarea value={inputValue} className="form-input" onChange={(e) => { inputSubmitHandler(e.target.value); update(e.target.value) }} placeholder={placeholder} />
            <animated.div style={requiredAnimation} className="display-error-message">{("*" + invalidMessage).replace(':str', minSize)}</animated.div>
        </div>
    );
}