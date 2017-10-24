'use strict';

/*****************************************************
* Copyright 200<em>X</em>-200<em>X</em> Amazon.com, Inc. or its affiliates.  All Rights Reserved.  Licensed under the 
* Amazon Software License (the "License").  You may not use this file except in compliance with the License. A copy of the 
* License is located at http://aws.amazon.com/asl or in the "license" file accompanying this file.  This file is distributed on an "AS 
* IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific 
* language governing permissions and limitations under the License. 
*****************************************************/

const os = require('os');
const path = require('path');
const jsonfile = require('jsonfile');

function ProfileHelper() {}

ProfileHelper.prototype = {

    runtimeProfile : function(profile) {
        let askProfile = profile || process.env.ASK_DEFAULT_PROFILE || 'default';
        if (!this.checkASKProfileExist(askProfile)) {
            throw new Error('[Error]: Cannot resolve profile [' + askProfile + ']');
        }
        return askProfile;
    },

    checkASKProfileExist : function(profile) {
        let filePath = path.join(os.homedir(), '.ask', 'cli_config');
        try {
            return jsonfile.readFileSync(filePath).profiles.hasOwnProperty(profile);
        } catch (e) {
            throw new Error('Invalid json: ' + filePath);
        }
    }
};

module.exports = ProfileHelper;