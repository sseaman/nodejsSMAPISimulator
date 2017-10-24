'use strict';

/*****************************************************
* Copyright 200<em>X</em>-200<em>X</em> Amazon.com, Inc. or its affiliates.  All Rights Reserved.  Licensed under the 
* Amazon Software License (the "License").  You may not use this file except in compliance with the License. A copy of the 
* License is located at http://aws.amazon.com/asl or in the "license" file accompanying this file.  This file is distributed on an "AS 
* IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific 
* language governing permissions and limitations under the License. 
*****************************************************/

const logger = require('winston-simple').getLogger('nodeJSSMAPISimulator');
const tools = require('./lib/tools.js');
const APIWrapper = require('./lib/api-wrapper.js');

const DEFAULT_LOCALE = 'en-US';
const POOLING_INTERVAL = 1000;
const ENDPOINT_REGION = 'NA';

/**
* Simulator uses the SMAPI APIs to run simulations against a skill.
*
* @constructor
* @param {String} skillId The ID of the skill to simulate against
* @param {Object.<String, Object>} options The global options for the execution of the simulation that will be applied to 
*		every simulation (unless overridden in the specific call)
* @param {String} [options.locale=en-US] The locale to use for the skill
* @param {Integer} [options.poolingInterval=1000] The interval, in milliseconds, to poll for a simulation completion.
* @param {String} [options.endpointRegion=NA] The endpoint region of the skill
* @param {Profile} [options.profile] The ASK CLI profile to use when calling the SMAPI SimulateSkill API
*/
function nodeJSSMAPISimulator(skillId, options) {
	this._skillId = skillId;
	this._options = options ? options : {};

	if (!this._options.locale) this._options.locale = DEFAULT_LOCALE;
	if (!this._options.pollingInterval) this._options.pollingInterval = POOLING_INTERVAL;
	if (!this._options.endpointRegion) this._options.endpointRegion = ENDPOINT_REGION;

	let profile = (this._options.profile) 
		? this._options.profile 
		: new (require('./lib/profile-helper.js'))().runtimeProfile(null);

	this._apiWrapper = new APIWrapper(profile);
}

nodeJSSMAPISimulator.prototype = {

	/**
	* Runs a simulation using the SMAPI APIs.  Will continue to poll for results until an error or success is reached
	*
	* @function
	* @param {String} text The text to send to the skill
	* @param {Object.<String, Object>} options The options for the execution of the simulation
	* @param {String} [options.locale=en-US] The locale to use for the skill
	* @param {Integer} [options.poolingInterval=1000] The interval, in milliseconds, to poll for a simulation completion.
	* @returns {Promise} for when simulation completes
	*/
	simulate : function(text, options) {
		let scope = this;
		let thisOptions = (options) ? tools.merge(scope._options, options) : scope._options;

		return new Promise(function(resolve, reject) {
			scope._apiWrapper.callSimulateSkill(null, text, scope._skillId, thisOptions.locale)
				.then( function(data) {
					scope._handleAPICall(scope, resolve, reject, thisOptions.POLLING_INTERVAL, data);
				}, function(errMsg) {
					reject(errMsg);
				});
		});
	},

	/**
	* Runs an invoke using the SMAPI APIs.  Will continue to poll for results until an error or success is reached
	*
	* @function
	* @param {String} jsonObject The text to send to the skill
	* @param {Object.<String, Object>} options The options for the execution of the simulation
	* @param {String} [options.endpointRegion=NA] The endpoint region of the skill
	* @param {Integer} [options.poolingInterval=1000] The interval, in milliseconds, to poll for a simulation completion.
	* @returns {Promise} for when simulation completes
	*/
	invoke : function(jsonObject, options) {
		let scope = this;
		let thisOptions = (options) ? tools.merge(scope._options, options) : scope._options;

		return new Promise(function(resolve, reject) {
			scope._apiWrapper.callInvokeSkill(null, jsonObject, scope._skillId, thisOptions.endpointRegion)
				.then( function(data) {
					scope._handleAPICall(scope, resolve, reject, thisOptions.POLLING_INTERVAL, data);
				}, function(errMsg) {
					reject(errMsg);
				});
			});
	},

	_handleAPICall : function(scope, resolve, reject, pollingInterval, data) {
		let response = tools.convertDataToJsonObject(data);
		if (response) {
			let simulationId = response.id;

			// this is faster than having it as a sepeare method at the object level. Not sure why, but it is
			let responseHandler = function(response) {
				if (!response.hasOwnProperty('status')) {
					throw Error('Simulation failed because the simulation with id ' + simulationId + ' has expired its time-to-live');
				} 
				else if (response.status === 'IN_PROGRESS') {
					logger.debug('Simulation ID '+simulationId+ ' retrieved. Pooling for results...');
					setTimeout(() => {
						scope._apiWrapper.callGetSimulation(simulationId, scope._skillId)
							.then(function(data) {
								responseHandler(tools.convertDataToJsonObject(data));
							}, function(errMsg) {
								reject(errMsg);
							});
					}, pollingInterval);
				} 
				else {
					let skillResponse = tools.convertDataToJsonObject(response).result;
					logger.debug('Valid response received\n Skill Response:\n'+skillResponse);
					resolve(skillResponse);
				}
			};						
			responseHandler(response);
		}
	}
};

module.exports = nodeJSSMAPISimulator;