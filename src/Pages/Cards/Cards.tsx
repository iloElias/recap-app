import env from "react-dotenv";
import axios from "axios";
import React from "react";

const api = axios.create({
    baseURL: env.API_URL,
});

async function getUserProjects(userId) {
    api.get(`?about=$project&`);
}

export default function Cards({ userId, messages }) {

    return (
        <>

        </>
    );
}