const uuid = require('uuid/v1');
const axios = require('axios').default;
const qs = require('qs');

function noTryCatch(promise) {
    return promise
        .then(data => {
            return [null, data];
        })
        .catch(error => {
            return [error];
        });
}

class Zalo {
    constructor(options = { app_id, app_secret, redirect_uri, redirect_uri_user_denied }) {
        const state = uuid();
        this.options = {
            ...options,
            state
        };
        this.uri = {
            request_permission: 'https://oauth.zaloapp.com/v3/auth',
            request_access_token: 'https://oauth.zaloapp.com/v3/access_token',
            request_profile_user: 'https://openapi.zalo.me/v2.0/me'
        };
    }

    requestAccessFromUser() {
        const { app_id, redirect_uri, state } = this.options;
        const { request_permission } = this.uri;
        let uri = qs.stringify(
            {
                app_id,
                redirect_uri,
                state
            },
            {
                addQueryPrefix: true
            }
        );
        uri = request_permission + uri;

        return (req, res, next) => {
            res.redirect(uri);
        };
    }

    requestAccessToken() {
        const { app_id, app_secret, redirect_uri_user_denied } = this.options;
        return (req, res, next) => {
            Promise.resolve()
                .then(async () => {
                    const { code, state, error, error_reason } = qs.parse(req.query, {
                        ignoreQueryPrefix: true
                    });
                    if (error) {
                        if (error_reason === 'user_denied') {
                            return res.redirect(redirect_uri_user_denied);
                        }
                        throw error;
                    }

                    const { request_access_token } = this.uri;
                    const promiseGetAccessToken = axios.get(request_access_token, {
                        params: {
                            app_id,
                            app_secret,
                            code
                        }
                    });
                    const [errorGetAccessToken, responseGetAccessToken] = await noTryCatch(
                        promiseGetAccessToken
                    );
                    if (errorGetAccessToken) {
                        throw errorGetAccessToken;
                    }
                    req.zalo = responseGetAccessToken.data;
                    next();
                })
                .catch(next);
        };
    }

    requestProfileUser() {
        return (req, res, next) => {
            Promise.resolve()
                .then(async () => {
                    const { access_token } = req.zalo;

                    const { request_profile_user } = this.uri;
                    const promiseGetProfileUser = axios.get(request_profile_user, {
                        params: {
                            access_token,
                            fields: 'id, birthday, gender, picture, name'
                        }
                    });
                    const [errorGetProfileUser, responseGetProfileUser] = await noTryCatch(
                        promiseGetProfileUser
                    );
                    if (errorGetProfileUser) {
                        throw errorGetProfileUser;
                    }

                    const { error, message } = responseGetProfileUser.data;
                    if (error && message) {
                        throw new Error(message);
                    }

                    req.zalo = {
                        access_token,
                        profile_user: responseGetProfileUser.data
                    };
                    next();
                })
                .catch(next);
        };
    }
}

module.exports = Zalo;
