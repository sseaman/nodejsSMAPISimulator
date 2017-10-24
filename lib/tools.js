'use strict';

/*****************************************************
* Copyright 200<em>X</em>-200<em>X</em> Amazon.com, Inc. or its affiliates.  All Rights Reserved.  Licensed under the 
* Amazon Software License (the "License").  You may not use this file except in compliance with the License. A copy of the 
* License is located at http://aws.amazon.com/asl or in the "license" file accompanying this file.  This file is distributed on an "AS 
* IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific 
* language governing permissions and limitations under the License. 
*****************************************************/

const logger = require('winston-simple').getLogger('Tools');

module.exports.convertDataToJsonObject = (data) => {
    let response = data;
    try {
        if (typeof(data) === 'string') {
            response = JSON.parse(data);
        }
    } catch (e) {
        logger.error('Failed to parse the response from Alexa Skill Management API Service.');
        return null;
    }
    return response;
};

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * 
 * @param {Map} obj1 The first object
 * @param {Map} obj2 The second object
 * @returns {Map} A new object based on obj1 and obj2
 */
module.exports.merge = (obj1,obj2) => {
    var obj3 = {};
    for (var attrnameA in obj1) { obj3[attrnameA] = obj1[attrnameA]; }
    for (var attrnameB in obj2) { obj3[attrnameB] = obj2[attrnameB]; }
    return obj3;
};
