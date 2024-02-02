import React, { useState } from "react";
import "./Input.css";
import { useSpring, animated } from "react-spring";

export default function Input({ type, messages, required, onSubmit, placeholder }) {
    const [inputValue, setInputValue] = useState();

    const requiredAnimation = useSpring({
        opacity: (required && !inputValue) ? 1 : 0,
        config: {
            tension: 500,
            friction: 30
        },
        immediate: (key) => key === (required ? "backgroundColor" : "")
    })

    const inputSubmitHandler = (targetValue) => {
        setInputValue(targetValue)

        if (onSubmit) {
            onSubmit(inputValue);
        }
    }

    return (
        <div className="input-container">
            <input type={type || "text"} onChange={(e) => inputSubmitHandler(e.target.value)} placeholder={placeholder} />
            <animated.div style={requiredAnimation} className="display-error-message">{"*" + messages.required_input_message}</animated.div>
        </div>
    );
}