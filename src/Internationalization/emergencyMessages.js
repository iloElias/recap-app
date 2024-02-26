export default function getMessages() {
    return {
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
}