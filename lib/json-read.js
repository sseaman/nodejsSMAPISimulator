'use strict';

/*****************************************************
* Copyright 200<em>X</em>-200<em>X</em> Amazon.com, Inc. or its affiliates.  All Rights Reserved.  Licensed under the 
* Amazon Software License (the "License").  You may not use this file except in compliance with the License. A copy of the 
* License is located at http://aws.amazon.com/asl or in the "license" file accompanying this file.  This file is distributed on an "AS 
* IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific 
* language governing permissions and limitations under the License. 
*****************************************************/

const jsonfile = require('jsonfile');
const logger = require('winston-simple').getLogger('JSONRead');

// Public
module.exports = {
    readFile: (filePath) => {
        let file;
        try {
            file = jsonfile.readFileSync(filePath);
        } catch (e) {
            logger.error('Invalid json: ' + filePath);
            return null;
        }
        return file;
    },
    readString: (string) => {
        try {
            return JSON.parse(string);
        } catch (e) {
            logger.error('Invalid json string: ' + string);
            return null;
        }
    },
    getProperty: (jsonObject, track) => {
        let trackArray = track.split('.').slice(1);
        let property = jsonObject;
        for (let i = 0; i < trackArray.length; i++) {
            if (property.hasOwnProperty(trackArray[i])) {
                property = property[trackArray[i]];
            } else {
                logger.debug('The property "' + trackArray[i] + '" does not exist.');
                return null;
            }
        }
        return property;
    }
};
