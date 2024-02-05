import React, { useState } from "react";
import "./Input.css";
import { useSpring, animated } from "react-spring";


export default function Input({ type, messages, required, onSubmit, placeholder, value }) {
    const [inputValue, setInputValue] = useState();

    const requiredAnimation = useSpring({
        opacity: (required && !inputValue) ? 1 : 0,
        config: {
            tension: 500,
            friction: 30
        },
        immediate: (key) => key === (required ? "backgroundColor" : "")
    });

    const inputSubmitHandler = (targetValue) => {
        setInputValue(targetValue)

        if (onSubmit) {
            onSubmit(inputValue);
        }
    }

    return (
        <div className="input-container">
            <input type={type || "text"} onChange={(e) => inputSubmitHandler(e.target.value)} placeholder={placeholder} value={value} />
            <animated.div style={requiredAnimation} className="display-error-message">{"*" + messages.required_input_message}</animated.div>
        </div>
    );
}

export function TextArea({ messages, required, onSubmit, placeholder, value, submitRule }) {
    const [inputValue, setInputValue] = useState("");
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

        if (onSubmit) {
            onSubmit(inputValue);
        }
    }

    return (
        <div className="input-container">
            <textarea onChange={(e) => inputSubmitHandler(e.target.value)} placeholder={placeholder}  >{value}</textarea>
            <animated.div style={requiredAnimation} className="display-error-message">{("*" + invalidMessage).replace(':str', 3)}</animated.div>
        </div>
    );
}