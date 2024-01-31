import BottomOptions from './Components/BottomOptions/BottomOptions';
import Login from './Pages/Login/Login';
import './App.css';
import { useEffect, useState } from 'react';

import axios from 'axios';
import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
    baseURL: 'https://192.168.0.140/ipesheets/public/api/',
});

const localDefinedLanguage = localStorage.getItem('definedLanguage');

function App() {
    const [language, setLanguage] = useState(localDefinedLanguage ? localDefinedLanguage : 'en');
    const [messages, setMessages] = useState({});

    const [user, setUser] = useState([]);
    const [profile, setProfile] = useState();

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:')
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

        localStorage.setItem('definedLanguage', language)
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
                        console.log(res.data);
                        setProfile(res.data);
                    })
                    .catch((err) => console.log(err));
            } else if (user.credential) {
                const decodedUserData = jwtDecode(user.credential);
                setProfile(decodedUserData);
            }
        },
        [user]
    );

    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    return (
        <>
            <div className="App">
                {profile ? (
                    <>
                        <h2>
                            {messages.hello_user.replace(':str', profile.name)}
                        </h2>
                        <img src={`${profile.picture}`} alt='' ></img>
                    </>
                ) : (
                    <Login messages={messages} loginHandler={login} />
                )}

                <BottomOptions profile={profile} onClick={e => e.stopPropagation()} messages={messages} setLanguage={setLanguage} logoutHandler={logOut} />
            </div>

            <div style={{ display: "none" }}>
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        oneTapLogin(credentialResponse);
                        console.log(credentialResponse);
                    }}
                    onError={() => {
                        console.log('One tap login Failed');
                    }}
                    useOneTap
                />
            </div>
        </>
    );
}

export default App;
