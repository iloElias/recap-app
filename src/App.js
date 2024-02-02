import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import BottomOptions from './Components/BottomOptions/BottomOptions';
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSpring, animated } from 'react-spring';
import { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import Login from './Pages/Login/Login';
import Cards from './Pages/Cards/Cards';
import { jwtDecode } from 'jwt-decode';
import env from "react-dotenv";
import axios from 'axios';
import './App.css';

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

const sendUserData = async (data) => {
    const preparedData = {
        email: (data.email),
        preferred_lang: (data.locale),
        name: (data.given_name),
        username: ("" + data.email).split("@")[0],
        picture_path: (data.picture)
    }

    try {
        const { response } = await api.post(`?about=user`, preparedData)

        console.log("API response: ", response);
    } catch (error) {
        console.log("An error ocurred on login: ", error);
    }
}

function App() {
    const [language, setLanguage] = useState(localDefinedLanguage ? localDefinedLanguage : 'en');
    const [messages, setMessages] = useState({});

    const [user, setUser] = useState([]);
    const [profile, setProfile] = useState(JSON.parse(localUserProfile));
    const [userCards, setUserCards] = useState([]);

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
            if (user) {
                let profile = null;
                if (user.access_token) {
                    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                        .then((res) => {
                            profile = res.data;
                            setProfile(res.data);
                        })
                        .catch((err) => console.log(err));
                    navigate("/");
                } else if (user.credential) {
                    const decodedUserData = jwtDecode(user.credential);
                    profile = decodedUserData;
                    setProfile(decodedUserData);
                    navigate("/");
                }

                if (profile) {
                    const userData = {
                        email: (profile.email),
                        preferred_lang: (profile.locale),
                        name: (profile.given_name),
                        username: ("" + profile.email).split("@")[0],
                        picture_path: (profile.picture),
                        id: 0
                    }
                    localStorage.setItem("recap@localUserProfile", JSON.stringify(userData));
                    sendUserData(userData);
                }
            }
        },
        [user, navigate]
    );

    const logoutHandler = () => {
        localStorage.removeItem("recap@localUserProfile");
        setUser(null);
        setProfile(null);
        googleLogout();
    };

    const maybeAnError = useSpring({
        delay: 4000,
        from: { opacity: 0 },
        to: { opacity: 1 },
        config: {}
    });

    const centerStyle = {
        minHeight: "100dvh",
        minWidth: "100dvw",
        display: 'flex',
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "5dvh"
    }

    return (
        <>
            {messages.loaded ? (
                <>
                    <div className="App">
                        <Routes>
                            <Route path='/'>
                                <Route index element={<PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler} >
                                    <Cards messages={messages} cards={userCards} />
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
            ) : (
                <div style={centerStyle}>
                    <div className="loading-container" >
                        <ReactLoading type={"spinningBubbles"} color="#bbbbbb" height={'75%'} width={'75%'} />
                    </div >
                    <animated.div style={maybeAnError} className="network-static-message">
                        {(localStorage.getItem('definedLanguage') && localStorage.getItem('definedLanguage') === "pt-BR") ? ("O tempo de resposta foi excedido, talvez nossos serviços não estejam disponíveis") : ("The response time has expired, our service may be unavailable")}
                    </animated.div>
                </div>
            )}
        </>
    );
}

export default App;
