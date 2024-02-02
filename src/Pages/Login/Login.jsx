import { GoogleIcon, RecapLogo } from "../../Components/Icons/Icons";
import Button from "../../Components/Button/Button";
import { useSpring, animated } from "react-spring";
import React from "react";
import "./Login.css";

export default function Login({ messages, loginHandler }) {
    const recapAnimation = useSpring({
        delay: 250,
        from: { opacity: 0 },
        to: { opacity: 1 },
        config: {
            tension: 280,
            friction: 60
        }
    });

    return (
        <animated.div style={recapAnimation} className="container container-login">
            <RecapLogo />
            <p className="login-static-message">{messages.login_static_message}</p>
            <Button onClick={loginHandler}>
                <GoogleIcon />
                <div>{messages.login_button_message}</div>
            </Button>
        </animated.div>
    );
}