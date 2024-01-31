import { GoogleIcon, RecapLogo } from "../../Components/Icons/Icons";
import Button from "../../Components/Button/Button";
import { useSpring, animated } from "react-spring";
import ReactLoading from 'react-loading';
import React from "react";
import "./Login.css";

export default function Login({ messages, loginHandler }) {
    const loadingAnimation = useSpring({
        delay: 1500,
        from: { opacity: 0 },
        to: { opacity: 1 },
    });

    const recapAnimation = useSpring({
        delay: 250,
        from: { opacity: 0 },
        to: { opacity: 1 },
        config: {
            tension: 280,
            friction: 60
        }
    });

    const maybeAnError = useSpring({
        delay: 4000,
        from: { opacity: 0 },
        to: { opacity: 1 },
        config: {}
    });

    return (
        <animated.div style={recapAnimation} className="container container-login">
            <RecapLogo />
            {messages.login_static_message ? (
                <>
                    <p className="login-static-message">{messages.login_static_message}</p>
                    <Button onClick={loginHandler}>
                        <GoogleIcon />
                        <div>{messages.login_button_message}</div>
                    </Button>
                </>
            ) : (
                <>
                    <animated.div style={loadingAnimation} className="loading-container" >
                        <ReactLoading type={"spinningBubbles"} color="#bbbbbb" height={'75%'} width={'75%'} />
                    </animated.div>
                    <animated.div style={maybeAnError} className="network-static-message">
                        {(localStorage.getItem('definedLanguage') && localStorage.getItem('definedLanguage') === "pt-BR") ? ("O tempo de resposta foi excedido, talvez nossos serviços não estejam disponíveis") : ("The response time has expired, our service may be unavailable")}
                    </animated.div>
                </>
            )}
        </animated.div>
    );
}