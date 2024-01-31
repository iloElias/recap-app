import BottomOptions from './Components/BottomOptions/BottomOptions';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import Login from './Pages/Login/Login';
import './App.css';

import axios from 'axios';
import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
    baseURL: 'https://recap-backend-production.up.railway.app/public',
});

const localDefinedLanguage = localStorage.getItem('recap@definedLanguage') || (navigator.language || navigator.userLanguage);
const localUserProfile = localStorage.getItem('recap@localUserProfile') || null

function PageTemplate({ children, profile, messages, setLanguage, logoutHandler }) {

    return (
        <>
            {children}
            <BottomOptions profile={profile} onClick={e => e.stopPropagation()} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler} />
        </>
    );
}

function App() {
    const [language, setLanguage] = useState(localDefinedLanguage ? localDefinedLanguage : 'en');
    const [messages, setMessages] = useState({});

    const [user, setUser] = useState([]);
    const [profile, setProfile] = useState(JSON.parse(localUserProfile));

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error)
    });

    const oneTapLogin = (credentialResponse) => {
        setUser(credentialResponse);
    }

    useEffect(() => {
        api
            .get(`?lang=${language}&message=all`)
            .then((response) => setMessages(response.data))
            .catch((err) => {
                console.error("Ops, an error has ocurred on language set");
            });

        localStorage.setItem('recap@definedLanguage', language)
    }, [language]);

    useEffect(
        () => {
            if (user && user.access_token) {
                axios
                    .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                        setProfile(res.data);
                        localStorage.setItem("recap@localUserProfile", JSON.stringify(res.data));
                    })
                    .catch((err) => console.log(err));
            } else if (user.credential) {
                const decodedUserData = jwtDecode(user.credential);
                setProfile(decodedUserData);
                localStorage.setItem("recap@localUserProfile", JSON.stringify(decodedUserData));
            }
        },
        [user]
    );

    const logoutHandler = () => {
        googleLogout();
        setProfile(null);
        localStorage.removeItem("recap@localUserProfile")
    };

    return (
        <>
            <div className="App">
                <PageTemplate profile={profile} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler}>
                    {profile ? (
                        <>
                            <h2>
                                {/* {messages.hello_user.replace(':str', profile.name)} */}
                            </h2>
                            <img src={`${profile.picture}`} alt='' ></img>
                        </>
                    ) : (
                        <Login messages={messages} loginHandler={login} />
                    )}
                </PageTemplate>
            </div>

            <div style={{ display: "none" }}>
                {!profile && (
                    <GoogleLogin
                        onSuccess={(credentialResponse) => {
                            oneTapLogin(credentialResponse);
                        }}
                        onError={() => {
                            console.log('One tap login Failed');
                        }}
                        useOneTap
                    />
                )}
            </div>
        </>
    );
}

export default App;
