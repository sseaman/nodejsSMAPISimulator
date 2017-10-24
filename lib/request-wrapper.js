'use strict';

/*****************************************************
* Copyright 200<em>X</em>-200<em>X</em> Amazon.com, Inc. or its affiliates.  All Rights Reserved.  Licensed under the 
* Amazon Software License (the "License").  You may not use this file except in compliance with the License. A copy of the 
* License is located at http://aws.amazon.com/asl or in the "license" file accompanying this file.  This file is distributed on an "AS 
* IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific 
* language governing permissions and limitations under the License. 
*****************************************************/

const requestLib = require('request');
const tools = require('./tools');
const OAuthWrapper = require('./oauth-wrapper');
const logger = require('winston-simple').getLogger('RequestWrapper');

const ENDPOINT = 'https://api.amazonalexa.com/v0';

function RequestWrapper(profile) {
    if (!profile) throw Error('Profile must be set');

    this._oAuthWrapper = new OAuthWrapper(profile);
    this._header = 'simulator/v1.0' + ' Node/' + process.version; // od this here so it isn't called every time
}

RequestWrapper.prototype = {

    request : function(apiName, general, headers, payload) {
        let scope = this;

        headers['User-Agent'] = scope._header;

        let params = {
            url: ENDPOINT + general.url,
            method: general.method,
            headers: headers,
            body: payload,
            json: payload ? true : false
        };

        return new Promise(function(resolve, reject) {
            scope._oAuthWrapper.tokenRefreshAndRead(params)
                .then( function(updatedParams) {
                    requestLib(updatedParams, (error, response) => {
                        if (error || response.statusCode === null) {
                            logger.error('Request to the Alexa Skill Management API service failed.\n'+error);
                            reject(error);
                        } else if (response.statusCode >= 300) {
                            logger.debug(scope.debugContentForResponse(apiName, response));

                            if (response.body && tools.convertDataToJsonObject(response.body)) {
                                logger.error(JSON.stringify(tools.convertDataToJsonObject(response.body), null, 2));
                            }
                            reject('Call ' + apiName + ' error.\n Error code: ' + response.statusCode 
                                + '. Enable error logging in RequestWrapper for more details.');
                        } else {
                            logger.debug(scope.debugContentForResponse(apiName, response));
                            resolve(response.body);
                        }
                    });
                }, function(error) {
                    reject(error);
                });
        });
    },

    debugContentForResponse : function (apiName, response) {
        return {
            'activity': apiName,
            'request-id': response.headers['x-amzn-requestid'],
            'request': {
                'method': response.request.method,
                'url': response.request.href,
                'headers': response.request.headers,
                'body': response.request.body
            },
            'response': {
                'statusCode': response.statusCode,
                'statusMessage': response.statusMessage,
                'headers': response.headers
            },
            'body': response.body
        };
    }
};

module.exports = RequestWrapper;