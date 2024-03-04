import { GoogleIcon, RecapLogo } from "../../Components/Icons/Icons";
import Button from "../../Components/Button/Button";
import React, { useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login({ messages, loginHandler }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('recap@localUserProfile')) {
            navigate('/projects')
        }
    }, [navigate]);

    document.getElementById("page-title").innerText = "Recap - Login"

    return (
        <div className="container container-login">
            <RecapLogo />
            <p className="login-static-message">{messages.login_static_message}</p>
            <Button onClick={loginHandler}>
                <GoogleIcon />
                <div>{messages.login_button_message}</div>
            </Button>
        </div>
    );
}