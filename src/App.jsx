import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import BottomOptions from './Components/BottomOptions/BottomOptions';
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSpring, animated } from 'react-spring';
import { useCallback, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import Login from './Pages/Login/Login';
import Cards from './Pages/Cards/Cards';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './App.css';
import Modal from './Components/Modal/Modal';
import { Alert, Snackbar } from '@mui/material';
import Project from './Pages/Project/Project';

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`,
});

const emergencyMessages = {
    "en": {
        request_timeout_excide: "The response time has expired, our service may be unavailable",
        error_on_language_set: "An error has ocurred while setting the language",
        reauthenticate_token_message: "There was a change on your access token, please log in again",
        reauthenticate_logout_message: "O tempo de autenticação expirou, faça login novamente",
    },
    "pt-BR": {
        request_timeout_excide: "O tempo de resposta foi excedido, talvez nossos serviços não estejam disponíveis",
        error_on_language_set: "Um erro ocorreu durante o carregamento do idioma",
        reauthenticate_token_message: "Houve uma alteração no token de acesso, faça login novamente",
        reauthenticate_logout_message: "Authentication time has expired, please log in again",
    }
}

if (process.env.REACT_APP_LOCALHOST) {
    document.getElementById("page-title").innerText = `Recap - ${process.env.REACT_APP_LOCALHOST}`
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

    const [previousSessionMessage, setPreviousSessionMessage] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('recap@previousSessionError')) || null
        } catch (err) { }
    });
    const [alertMessage, setAlertMessage] = useState();
    const [alert, openAlert] = useState();
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [notification, setNotification] = useState();
    const [notificationMessage, setNotificationMessage] = useState();

    const [user, setUser] = useState([]);
    const [userData, setUserData] = useState();
    const [profile, setProfile] = useState(() => {
        if (!localUserProfile) return null;
        try {
            const decodedData = jwtDecode(localUserProfile)[0];

            return decodedData;
        } catch (err) {
            googleLogout();

            setUserData(null);
            setUser(null);

            console.log(err);

            navigate('/login');
            localStorage.removeItem("recap@localUserProfile");
            setPreviousSessionMessage(JSON.parse(sessionStorage.getItem('recap@previousSessionError')) || { message: emergencyMessages[localDefinedLanguage].reauthenticate_token_message, severity: 'error' });

            navigate('/login');
            return null;
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
        setPreviousSessionMessage(JSON.parse(sessionStorage.getItem('recap@previousSessionError')) || null);
    }, [setUserData, setProfile, setUser, setPreviousSessionMessage, navigate]);

    const handleUser = useCallback((data, preparedData) => {
        const receivedToken = data.data;
        const decodedData = jwtDecode(receivedToken)[0];

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
            api.post((process.env.REACT_APP_API_URL + `/user/`), [preparedData], {
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
        if (previousSessionMessage) {
            if (previousSessionMessage.message && previousSessionMessage.severity) {
                setAlertSeverity(previousSessionMessage.severity);
                setAlertMessage(previousSessionMessage.message);
                openAlert(true);
            }
            if (previousSessionMessage.notification) {
                setNotificationMessage(previousSessionMessage.notification);
                setNotification(true);
            }
        }
    }, [previousSessionMessage, setAlertMessage, setAlertSeverity, setNotificationMessage]);

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

        if (profile && !profile.logged_in) {
            sessionStorage.setItem('recap@previousSessionError', JSON.stringify({ notification: (messages.reauthenticate_logout_message || emergencyMessages[localDefinedLanguage].reauthenticate_logout_message) }));
            logoutHandler();
            return;
        }

        const currentDate = new Date();
        const profileDate = new Date(profile.logged_in);
        const timeDifference = currentDate - profileDate;
        const twoDays = 86400000 * 2;

        if (timeDifference > twoDays) {
            sessionStorage.setItem('recap@previousSessionError', JSON.stringify({ notification: (messages.reauthenticate_logout_message || emergencyMessages[localDefinedLanguage].reauthenticate_logout_message) }));
            logoutHandler();
        }
    }, [profile, navigate, logoutHandler, messages]);

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
                                        <Cards userId={profile && profile.id} messages={messages} setLoading={setIsLoading} logoutHandler={logoutHandler} />
                                    </PageTemplate>} />
                                <Route path='login' element={<PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler}>
                                    <Login messages={messages} loginHandler={login} />
                                </PageTemplate>} />
                                <Route path='project/:id' element={<PageTemplate profile={profile} language={language} messages={messages} setLanguage={setLanguage} logoutHandler={logoutHandler}>
                                    <Project messages={messages} setLoading={setIsLoading} />
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
                        {emergencyMessages[localDefinedLanguage].request_timeout_excide}
                    </animated.div>
                </div>
            )}
            <Snackbar
                open={notification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={5000}
                onClose={() => {
                    setNotification(false);
                    previousSessionMessage && sessionStorage.removeItem('recap@previousSessionError');
                }}
                message={notificationMessage}
            />

            <Snackbar open={alert} autoHideDuration={5000} onClose={() => {
                openAlert(false);
                previousSessionMessage && sessionStorage.removeItem('recap@previousSessionError');
            }}>
                <Alert
                    onClose={() => {
                        openAlert(false);
                        previousSessionMessage && sessionStorage.removeItem('recap@previousSessionError');
                    }}
                    severity={alertSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}

export default App;
