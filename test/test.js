'use strict';

const assert = require('assert');
//const log = require('winston-simple').setLevels( { 'all' : 'error' });

const simulator = new (require('../lib/simulator.js'))(
	'amzn1.echo-sdk-ams.app.dc03834c-b1af-47d8-a8ec-98d812daa8ce' ,
	{ 
		poolingInterval : 500,
		locale : 'en-US'
	}
);

describe('Skill Simulation', function() {
	let response = '';
	before(function() {
		this.timeout(15000);

		return simulator.simulate('ask the bard')
			.then( function(result) {
				response = result;
			}, function(err) {
				assert.fail('Error invoking skill: '+err);
			});
	});

	describe('correctly formatted response', function() {
		it ('response should exist', function() {
			assert.ok(response, 'Skill did not respond');
		});

		it ('response is not an error', function() {
			assert.equal(response.error, null, 'Skill call responded with an error');
		});

	});

	describe('example phrase via text', function() {
		it('response should have valid speech', function() {
			assert.equal(
				response.skillExecutionInfo.invocationResponse.body.response.outputSpeech.text, 
				"Welcome to The Bard, brought to you by Shakespears Sonnets.com.  What sonnet would you like to hear?"
			);
		});
		
		it('response should have valid title', function() {
			assert.equal(
				response.skillExecutionInfo.invocationResponse.body.response.card.title, 
				"The Bard - Talking to The Bard"
			);
		});

	});

	describe('example phrase via JSON', function() {
		it('response should have valid speech', function() {
			return simulator.invoke(testJSON)
				.then ( function(result) {
					assert.equal(
						result.skillExecutionInfo.invocationResponse.body.response.outputSpeech.text, 
						"Welcome to The Bard, brought to you by Shakespears Sonnets.com.  What sonnet would you like to hear?"
					);
				}, function(err) {
					assert.fail('Error invoking skill: '+err);
				});
		});
	});
});


const testJSON = {
  "session": {
    "new": true,
    "sessionId": "SessionId.f0a17742-1e60-43de-bb1b-901f1255c720",
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.dc03834c-b1af-47d8-a8ec-98d812daa8ce"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.account.AHIDLTU6GZTYNBXI62Q5ODCMMDRA"
    }
  },
  "request": {
    "type": "LaunchRequest",
    "requestId": "EdwRequestId.a7e8882f-f4d3-4623-9bfd-b8e65172f541",
    "locale": "en-US",
    "timestamp": "2017-09-15T17:01:53Z"
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "application": {
        "applicationId": "amzn1.echo-sdk-ams.app.dc03834c-b1af-47d8-a8ec-98d812daa8ce"
      },
      "user": {
        "userId": "amzn1.account.AHIDLTU6GZTYNBXI62Q5ODCMMDRA"
      },
      "device": {
        "supportedInterfaces": {}
      }
    }
  },
  "version": "1.0"
};