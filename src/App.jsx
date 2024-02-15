import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import BottomOptions from './Components/BottomOptions/BottomOptions';
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSpring, animated } from 'react-spring';
import { useCallback, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import Login from './Pages/Login/Login';
import Cards from './Pages/Cards/Cards';
import { jwtDecode } from 'jwt-decode';
import env from "react-dotenv";
import axios from 'axios';
import './App.css';
import Modal from './Components/Modal/Modal';

const api = axios.create({
    baseURL: `${env.API_URL}`,
});

if (env.LOCALHOST) {
    document.getElementById("page-title").innerText = `Recap - ${env.LOCALHOST}`
}

if (localStorage.getItem('recap@localUserProfile') === 'undefined') {
    localStorage.removeItem('recap@localUserProfile');
}

const localDefinedLanguage = localStorage.getItem('recap@definedLanguage') || (navigator.language || navigator.userLanguage);
const localUserProfile = localStorage.getItem('recap@localUserProfile');

function PageTemplate({ children, profile, language, messages, setLanguage, logoutHandler }) {
    return (
        <>
            {children}
            <BottomOptions profile={profile} language={language} onClick={(e) => e.stopPropagation()} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler} />
        </>
    );
}

const getCurrentDateAsString = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function App() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState(localDefinedLanguage ? localDefinedLanguage : 'en');
    const [messages, setMessages] = useState({});

    const [user, setUser] = useState([]);
    const [userData, setUserData] = useState();
    const [profile, setProfile] = useState(() => {
        try {
            return JSON.parse(localUserProfile)
        } catch (err) {
            navigate('/login');
        }
    });

    const [isLoading, setIsLoading] = useState(false);


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

    const logoutHandler = useCallback(() => {
        googleLogout();
        setUserData(null)
        setProfile(null);
        setUser(null);
        navigate('/login');
        localStorage.removeItem("recap@localUserProfile");
    }, [setUserData, setProfile, setUser, navigate]);


    const handleUser = useCallback((data, preparedData) => {
        const receivedToken = data.data;
        console.log(receivedToken);
        const decodedData = jwtDecode(receivedToken)[0];
        console.log(decodedData);

        if (decodedData && decodedData.google_id) {
            api.put(`/user/?field=id:${decodedData.id}`, [{ logged_in: getCurrentDateAsString() }], {
                headers: {
                    Authorization: `Bearer ${receivedToken}`,
                }
            }).then(() => {
                localStorage.setItem("recap@localUserProfile", receivedToken);
                setUserData(decodedData);
                setProfile(decodedData);
            });

        } else {
            api.post((env.API_URL + `/user/`), [preparedData], {
                headers: {
                    Authorization: `Bearer ${receivedToken}`,
                }
            }).then(() => {
                localStorage.setItem("recap@localUserProfile", receivedToken);
                setUserData(decodedData);
                setProfile(decodedData);
            });
        }
    }, []);

    useEffect(() => {
        api.get(`language/?lang=${language}&message=all`)
            .then((response) => setMessages(response.data))
            .catch((err) => {
                console.error("Ops, an error has ocurred on language set", err);
            });

        localStorage.setItem('recap@definedLanguage', language);
    }, [language]);

    useEffect(
        () => {
            if (user) {
                let profile = null;
                if (user.access_token) { // Normal redirect Login
                    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    }).then((res) => {
                        profile = res.data;
                        setProfile(res.data);

                        const preparedData = {
                            google_id: (profile.id || profile.sub),
                            email: profile.email,
                            preferred_lang: profile.locale,
                            name: profile.given_name,
                            username: ("" + profile.email).split("@")[0],
                            picture_path: profile.picture
                        };

                        api.post(`user/login/`, [preparedData])
                            .then(data => {
                                handleUser(data, preparedData);
                            })
                    })
                } else if (user.credential) { // One tap Login
                    const decodedUserData = jwtDecode(user.credential);
                    profile = decodedUserData;

                    const preparedData = {
                        google_id: (profile.id || profile.sub),
                        email: profile.email,
                        preferred_lang: profile.locale,
                        name: profile.given_name,
                        username: ("" + profile.email).split("@")[0],
                        picture_path: profile.picture
                    };

                    api.post(`user/login/`, [preparedData])
                        .then(data => {
                            handleUser(data, preparedData);
                        })

                }
            }
        },
        [user, setProfile, handleUser]
    );

    useEffect(() => {
        if (userData) {
            setIsLoading(false);
            navigate('/')
        }
    }, [userData, navigate, setIsLoading]);

    useEffect(() => {
        if (!profile) {
            navigate("/login");
            return;
        }

        if (profile) {
            if (!profile.logged_in) logoutHandler();

            const currentDate = new Date();
            const profileDate = new Date(profile.logged_in);
            const timeDifference = currentDate - profileDate;

            if (timeDifference > 86400000) {
                logoutHandler();
            }
        }
    }, [profile, navigate, logoutHandler]);

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
        zIndex: isLoading ? 50 : -1,
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
                                        <Cards userId={profile && profile.id} messages={messages} setLoading={setIsLoading} />
                                    </PageTemplate>} />
                                <Route path='login' element={<PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler}>
                                    <Login messages={messages} loginHandler={login} />
                                </PageTemplate>} />
                                <Route path='card/:id' element={<PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler}>
                                    <>a</>
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
                            <Modal>
                                <ReactLoading type='spinningBubbles' height={'7.5dvh'} width={'7.5dvh'} />
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
