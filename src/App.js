import BottomOptions from './Components/BottomOptions/BottomOptions';
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import Login from './Pages/Login/Login';
import env from "react-dotenv";
import './App.css';

import axios from 'axios';
import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Cards from './Pages/Cards/Cards';

const api = axios.create({
    baseURL: env.API_URL,
});

if (env.LOCALHOST) {
    document.getElementById("page-title").innerText = "Recap - Test"
}

const localDefinedLanguage = localStorage.getItem('recap@definedLanguage') || (navigator.language || navigator.userLanguage);
const localUserProfile = localStorage.getItem('recap@localUserProfile') || null

function PageTemplate({ children, profile, language, messages, setLanguage, logoutHandler }) {

    return (
        <>
            {children}
            <BottomOptions profile={profile} language={language} onClick={(e) => e.stopPropagation()} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler} />
        </>
    );
}

function App() {
    const [language, setLanguage] = useState(localDefinedLanguage ? localDefinedLanguage : 'en');
    const [messages, setMessages] = useState({});

    const [user, setUser] = useState([]);
    const [profile, setProfile] = useState(JSON.parse(localUserProfile));

    const navigate = useNavigate();

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

    useEffect(() => {
        if (!profile) {
            navigate("/login")
        }
    }, [profile, navigate]);

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
                navigate("/");
            } else if (user && user.credential) {
                const decodedUserData = jwtDecode(user.credential);
                setProfile(decodedUserData);
                localStorage.setItem("recap@localUserProfile", JSON.stringify(decodedUserData));
                navigate("/");
            }

        },
        [user, navigate]
    );

    const logoutHandler = () => {
        googleLogout();
        setUser(null);
        setProfile(null);
        localStorage.removeItem("recap@localUserProfile");
    };

    return (
        <>
            <div className="App">
                <Routes>
                    <Route path='/'>
                        <Route index element={<PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler} >
                            <Cards messages={messages} />
                        </PageTemplate>} />
                        <Route path='login' element={<PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler}>
                            <Login messages={messages} loginHandler={login} />
                        </PageTemplate>} />
                    </Route>
                </Routes>
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
