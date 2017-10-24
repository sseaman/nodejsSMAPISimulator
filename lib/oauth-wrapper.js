'use strict';

/*****************************************************
* Copyright 200<em>X</em>-200<em>X</em> Amazon.com, Inc. or its affiliates.  All Rights Reserved.  Licensed under the 
* Amazon Software License (the "License").  You may not use this file except in compliance with the License. A copy of the 
* License is located at http://aws.amazon.com/asl or in the "license" file accompanying this file.  This file is distributed on an "AS 
* IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific 
* language governing permissions and limitations under the License. 
*****************************************************/

const jsonRead = require('./json-read');
const jsonfile = require('jsonfile');
const oauth2 = require('simple-oauth2');
const path = require('path');
const fs = require('fs');
const os = require('os');
const logger = require('winston-simple').getLogger('OAuthWrapper');

const CLIENT_ID = 'amzn1.application-oa2-client.aad322b5faab44b980c8f87f94fbac56';
const CLIENT_SECRET = '1642d8869b829dda3311d6c6539f3ead55192e3fc767b9071c888e60ef151cf9';
const AUTH_URL = {
    host: 'https://www.amazon.com',
    path: '/ap/oa'
};
const TOKEN_URL = {
    host: 'https://api.amazon.com',
    path: '/auth/o2/token'
};
const FAILED_AUTH = 'Failed to get authorization information.\n Please run "ask init" to initialize ASK cli.';
const FAILED_CLI = 'Failed to get CLI config.\n Please run "ask init" to initialize ASK cli.';

function OAuthWrapper(profile) {
    if (!profile) throw Error('Profile must be set');
    this._profile = profile;

    this._oauth = oauth2.create({
        client: {
            id: CLIENT_ID,
            secret: CLIENT_SECRET
        },
        auth: {
            authorizeHost: AUTH_URL.host,
            authorizePath: AUTH_URL.path,
            tokenHost: TOKEN_URL.host,
            tokenPath: TOKEN_URL.path
        }
    });
}

OAuthWrapper.prototype = {
    tokenRefreshAndRead : function (params) {
        var scope = this;

        return new Promise(function(resolve, reject) {
            if (!fs.existsSync(path.join(os.homedir(), '.ask'))) {
                logger.warn(FAILED_AUTH);
                reject(FAILED_AUTH);
            }
            if (!fs.existsSync(path.join(os.homedir(), '.ask', 'cli_config'))) {
                logger.warn(FAILED_CLI);
                reject(FAILED_CLI);
            }
            if (!scope.isTokenExpired(scope._profile)) {
                params.headers.Authorization = scope.readAccessToken(scope._profile);
                resolve(params);
            } else {
                scope.refreshToken(scope._profile, (refreshedToken) => {
                    params.headers.Authorization = refreshedToken;
                    resolve(params);
                });
            }
        });
    },

    isTokenExpired : function (profile) {
        let token = this._oauth.accessToken.create(this.readToken(profile));
        return token.expired();
    },

    readAccessToken : function (profile) {
        let cliConfig = jsonRead.readFile(path.join(os.homedir(), '.ask', 'cli_config'));
        if (!cliConfig) {
            return;
        }
        return jsonRead.getProperty(cliConfig, '.profiles.' + profile + '.token.access_token');
    },

    refreshToken : function (profile, callback) {
        let oldToken = this.readToken(profile);
        if (!oldToken) {
            return;
        }
        let token = this._oauth.accessToken.create(oldToken);
        token.refresh((err, result) => {
            if (err) {
                logger.error(err + '\nFailed to refresh access token.');
                return;
            } else {
                this.writeToken(result.token, profile);
                callback(jsonRead.getProperty(result, '.token.access_token'));
            }
        });
    },

    readToken : function (profile) {
        let cliConfig = jsonRead.readFile(path.join(os.homedir(), '.ask', 'cli_config'));
        if (!cliConfig) {
            return;
        }
        let token = jsonRead.getProperty(cliConfig, '.profiles.' + profile + '.token');
        if (!token) {
            return;
        }
        return {
            'access_token': token.access_token,
            'refresh_token': token.refresh_token,
            'token_type': token.token_type,
            'expires_in': token.expires_in,
            'expires_at': token.expires_at
        };
    },

    writeToken : function (token, profile) {
        let configPath = path.join(os.homedir(), '.ask', 'cli_config');
        let config = jsonRead.readFile(configPath);
        if (!config) {
            return;
        }
        let configToken = {
            'access_token': token.access_token,
            'refresh_token': token.refresh_token,
            'token_type': token.token_type,
            'expires_in': token.expires_in,
            'expires_at': token.expires_at
        };
        config.profiles[profile].token = configToken;
        jsonfile.writeFileSync(configPath, config, {spaces: 2});
    }
};

module.exports = OAuthWrapper;
