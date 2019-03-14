/**
 * Created by Miguel Pazo (http://miguelpazo.com)
 */

let httpBuildQuery = require('http-build-query');
let constAuth = require('./constants/constAuth');
let _ = require('underscore');
let request = require('request-promise');

//config module
let redirectUri = null;
let responseType = null;
let scopes = null;
let acr = null;
let prompts = null;
let state = null;
let config = null;
let maxAge = null;
let loginHint = null;

function setConfig(data) {
    redirectUri = data.redirectUri;
    responseType = data.responseType || 'code';
    scopes = _.isArray(data.scopes) ? data.scopes.concat(['openid']) : ['openid'];
    acr = data.acr || null;
    prompts = _.isArray(data.prompts) ? data.prompts : [];
    state = data.state;
    maxAge = !isNaN(data.maxAge) ? data.maxAge : null;
    loginHint = data.loginHint || null;
    config = data.config;
}

function getLoginUrl() {
    try {
        let params = {
            response_type: responseType,
            client_id: config.client_id,
            redirect_uri: redirectUri,
            state: state,
            scope: scopes.join(' ')
        };

        if (prompts.length > 0) {
            params = _.extend(params, {prompt: prompts.join(' ')})
        }

        if (acr !== null) {
            params = _.extend(params, {acr_values: acr})
        }

        if (maxAge !== null) {
            params = _.extend(params, {max_age: maxAge})
        }

        if (loginHint !== null) {
            params = _.extend(params, {login_hint: loginHint})
        }

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