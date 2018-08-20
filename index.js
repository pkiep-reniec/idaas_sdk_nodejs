/**
 * Created by Miguel Pazo (http://miguelpazo.com)
 */

let httpBuildQuery = require('http-build-query');
let constAuth = require('./constants/constAuth');
let _ = require('underscore');
let request = require('request-promise');

//config module
let redirectUri = null;
let scopes = null;
let acr = null;
let prompt = null;
let state = null;
let config = null;

function setConfig(data) {
    redirectUri = data.redirectUri;
    scopes = _.isArray(data.scopes) ? data.scopes.concat(['openid']) : ['openid'];
    acr = data.acr || constAuth.ACR_ONE_FACTOR;
    prompt = data.prompt || '';
    state = data.state;
    config = data.config;
}

function getLoginUrl() {
    try {
        let params = {
            response_type: 'code',
            client_id: config.client_id,
            redirect_uri: redirectUri,
            state: state,
            scope: scopes.join(' '),
            prompt: prompt,
            acr_values: acr
        };

        let url = config.auth_uri + '?' + httpBuildQuery(params);

        return url;
    } catch (err) {
        console.log(err);
    }

    return null;
}

async function getTokens(code) {
    try {
        let params = {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: config.client_id,
            client_secret: config.client_secret
        };

        let tokenResponse = await
            request({
                url: config.token_uri,
                method: 'POST',
                json: true,
                form: params,
            });

        return tokenResponse;
    } catch (err) {
        console.log(err);
    }

    return null;
}

async function getUserInfo(accessToken) {
    try {
        let userinfoResponse = await
            request({
                url: config.userinfo_uri,
                method: 'GET',
                json: true,
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            });

        return userinfoResponse;
    } catch (err) {
        console.log(err);
    }

    return null;
}

function getLogoutUri(redirectUriLogout) {
    let paramsLogout = {
        post_logout_redirect_uri: redirectUriLogout
    };

    let logoutUri = config.logout_uri + '?' + httpBuildQuery(paramsLogout);

    return logoutUri;
}


module.exports.setConfig = setConfig;
module.exports.getLoginUrl = getLoginUrl;
module.exports.getTokens = getTokens;
module.exports.getUserInfo = getUserInfo;
module.exports.getLogoutUri = getLogoutUri;
module.exports.constAuth = constAuth;