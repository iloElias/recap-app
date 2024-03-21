import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon, RecapLogo } from '../../Components/Icons/Icons';
import Button from '../../Components/Button/Button';
import './Login.css';
import { LanguageProvider, UserAccountProvider } from '../../App';

export default function Login() {
  const navigate = useNavigate();

  const {
    messages,
  } = useContext(LanguageProvider);

  const {
    login,
  } = useContext(UserAccountProvider);

  useEffect(() => {
    if (localStorage.getItem('recap@localUserProfile')) {
      navigate('/projects');
    }
  }, [navigate]);

  document.getElementById('page-title').innerText = 'Recap - Login';

  return (
    <div className="container container-login">
      <RecapLogo />
      <p className="login-static-message">{messages.login_static_message}</p>
      <Button onClick={login}>
        <GoogleIcon />
        <div>{messages.login_button_message}</div>
      </Button>
    </div>
  );
}
