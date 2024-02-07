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
import Modal from './Components/Modal/Modal';

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

const getUserData = async (data) => {
    const preparedData = {
        email: (data.email),
        preferred_lang: (data.locale),
        name: (data.given_name),
        username: ("" + data.email).split("@")[0],
        picture_path: (data.picture)
    }

    try {
        return await fetch(env.API_URL + `?about=user`, preparedData);
    } catch (error) {
        console.log("An error ocurred on login: ", error);
    }
}


function App() {
    const [language, setLanguage] = useState(localDefinedLanguage ? localDefinedLanguage : 'en');
    const [messages, setMessages] = useState({});

    const [user, setUser] = useState([]);
    const [userData, setUserData] = useState();
    const [profile, setProfile] = useState(JSON.parse(localUserProfile));
    const [userCards, setUserCards] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            setIsLoading(true);
            setUser(codeResponse);
        },
        onError: (error) => console.log('Login Failed:', error)
    });

    const oneTapLogin = (credentialResponse) => {
        setIsLoading(true);
        setUser(credentialResponse);
    }

    useEffect(() => {
        axios.get(`${env.API_URL}?lang=${language}&message=all`)
            .then((response) => setMessages(response.data))
            .catch((err) => {
                console.error("Ops, an error has ocurred on language set");
            });

        localStorage.setItem('recap@definedLanguage', language);
    }, [language]);

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

                            const preparedData = {
                                google_id: (profile.user_id || profile.sub),
                                email: profile.email,
                                preferred_lang: profile.locale,
                                name: profile.given_name,
                                username: ("" + profile.email).split("@")[0],
                                picture_path: profile.picture
                            };

                            api.get(`?about=user&google_id=${preparedData.google_id}`)
                                .then(data => {
                                    if (data.google_id && data.google_id === preparedData.google_id) {
                                        localStorage.setItem("recap@localUserProfile", JSON.stringify(data));
                                    } else {
                                        api.post((env.API_URL + `?about=user`), [preparedData])
                                            .then(data => {
                                                localStorage.setItem("recap@localUserProfile", JSON.stringify(data.data[0]));
                                                setUserData(data.data[0]);
                                                setProfile(data.data[0]);
                                            })
                                    }
                                })
                        })
                } else if (user.credential) {
                    const decodedUserData = jwtDecode(user.credential);
                    profile = decodedUserData;

                    const preparedData = {
                        google_id: (profile.user_id || profile.sub),
                        email: profile.email,
                        preferred_lang: profile.locale,
                        name: profile.given_name,
                        username: ("" + profile.email).split("@")[0],
                        picture_path: profile.picture
                    };

                    api.get(`?about=user&google_id=${preparedData.google_id}`)
                        .then(data => {
                            if (data.google_id && data.google_id === preparedData.google_id) {
                                localStorage.setItem("recap@localUserProfile", JSON.stringify(data));
                            } else {
                                api.post((env.API_URL + `?about=user`), [preparedData])
                                    .then(data => {
                                        localStorage.setItem("recap@localUserProfile", JSON.stringify(data.data[0]));
                                        setUserData(data.data[0]);
                                        setProfile(data.data[0]);
                                    })
                            }
                        })

                }
            }
        },
        [user, setProfile]
    );

    useEffect(() => {
        if (userData) {
            localStorage.setItem("recap@localUserProfile", JSON.stringify(userData))
            setIsLoading(false);
            navigate('/')
        }
    }, [userData, navigate, setIsLoading]);

    useEffect(() => {
        if (!profile) {
            navigate("/login");
            return;
        }
    }, [profile, navigate]);

    useEffect(() => {

    }, [userCards]);

    const logoutHandler = () => {
        googleLogout();
        setUserData(null)
        setProfile(null);
        setUser(null);
        navigate('/login');
        localStorage.removeItem("recap@localUserProfile");
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

    const loadingAnimation = useSpring({
        zIndex: isLoading ? 20 : -1,
        opacity: isLoading ? 1 : 0,
        config: {
            mass: 0.1,
            tension: 314
        },
        immediate: (key) => key === (isLoading ? "zIndex" : "")
    });

    return (
        <>
            {messages.loaded ? (
                <>
                    <div className="App">
                        <Routes>
                            <Route path='/'>
                                <Route index element={
                                    <PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler}>
                                        <Cards userId={0} messages={messages} cards={userCards} />
                                    </PageTemplate>} />
                                <Route path='login' element={<PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler}>
                                    <Login messages={messages} loginHandler={login} />
                                </PageTemplate>} />
                            </Route >
                        </Routes >
                    </div >

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
                    {isLoading &&
                        (<animated.div style={loadingAnimation}>
                            <Modal style={{ backdropFilter: "blur(25%)" }}>
                                <ReactLoading type='spinningBubbles' />
                            </Modal>
                        </animated.div>)
                    }
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
            )
            }
        </>
    );
}

export default App;
