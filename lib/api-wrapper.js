'use strict';

/*****************************************************
* Copyright 200<em>X</em>-200<em>X</em> Amazon.com, Inc. or its affiliates.  All Rights Reserved.  Licensed under the 
* Amazon Software License (the "License").  You may not use this file except in compliance with the License. A copy of the 
* License is located at http://aws.amazon.com/asl or in the "license" file accompanying this file.  This file is distributed on an "AS 
* IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific 
* language governing permissions and limitations under the License. 
*****************************************************/

const jsonRead = require('./json-read');
const fs = require('fs');
const RequestWrapper = require('./request-wrapper');

function APIWrapper(profile) {
    if (!profile) throw Error('Profile must be set');

    this._requestWrapper = new RequestWrapper(profile);
}

APIWrapper.prototype = {

    callInvokeSkill : function(file, jsonObject, skillId, endpointRegion) {
        let requestPayload = file ? jsonRead.readFile(file) : jsonObject;
        let invokeRequestPayload = {
            "endpointRegion": endpointRegion,
            "skillRequest": {
                "body": requestPayload
            }
        };

        let general = {
            url: '/skills/' + skillId + '/invocations',
            method: 'POST'
        };
        let headers = {};

        return this._requestWrapper.request('invoke-skill', general, headers, invokeRequestPayload);
    },

    callSimulateSkill : function(file, text, skillId, locale) {
        let payload = {
            "input": {
                "content": file ? fs.readFileSync(file, 'utf-8') : text
            },
            "device": {
                "locale": locale
            }
        };

        let general = {
            url: '/skills/' + skillId + '/simulations',
            method: 'POST'
        };
        let headers = {};
        return this._requestWrapper.request('simulate-skill', general, headers, payload);
    },

    callGetSimulation : function(simulationId, skillId) {
        let general = {
            url: '/skills/' + skillId + '/simulations/' + simulationId,
            method: 'GET'
        };
        let headers = {};
        return this._requestWrapper.request('get-simulation', general, headers, null);
    }
};

module.exports = APIWrapper;