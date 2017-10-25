# NodeJS SMAPI Simulator

A NodeJS based skill simulator library that uses the Amazon SMAPI /simulate and /invoke APIs for testing

## Installation

You can install NodeJS SMAPI Simulator using the NPM:

    npm install nodejs-smapi-simulator

## Usage

The ```simulator.js``` object is the main object for interacting with the SMAPI testing APIs. It's parameters are:  

    skillId [REQUIRED] - The skillId to run the test against
    locale - The locale to use for the skill. Defaults to en-US
    poolingInterval - The interval, in milliseconds, to poll for a simulation completion. Defaults to 1000 (ms)
    endpointRegion - The endpoint region of the skill. Defaults to NA
    profile - The ASK CLI profile to use when calling the SMAPI SimulateSkill API. Defaults to the SMAPI default profile  

The following is an example of a simulation using this library with Mocha. 

```
const simulator = new (require('nodejsSMAPISimulator'))(
	'skillIDgoesHere' ,
	{ // optional parameters
		poolingInterval : 500,
		locale : 'en-US'
	}
);

describe('Skill Simulation', function() {
	let response = '';
	before(function() {
		this.timeout(15000); // Mocha as a default timeout that is shorter that the time it make take a skill to execute, so up Mocha's default timeout

		// run this in a before so it doesn't have to run for each assert (saves network traffic and decreases execution time.)
		return simulator.simulate('ask the bard')
			.then( function(result) {
				response = result;
			}, function(err) {
				assert.fail('Error invoking skill: '+err);
			});
	});

	describe('example phrase via text', function() {
		it('response should have valid speech', function() {
			assert.equal(
				response.skillExecutionInfo.invocationResponse.body.response.outputSpeech.text, 
				"This is the valid speech text that should be returned"
			);
		});
		
		it('response should have valid title', function() {
			assert.equal(
				response.skillExecutionInfo.invocationResponse.body.response.card.title, 
				"This is the valid title"
			);
		});

	});
}

```


Using the invoke command is just as easy:

```
const simulator = new (require('nodejsSMAPISimulator'))(
	'skillIDgoesHere' ,
	{ // optional parameters
		poolingInterval : 500,
		locale : 'en-US'
	}
);

describe('example phrase via JSON', function() {
	it('response should have valid speech', function() {
		return simulator.invoke(someJSONGoesHere)
			.then ( function(result) {
				assert.equal(
					result.skillExecutionInfo.invocationResponse.body.response.outputSpeech.text, 
					"This is the valid speech text that should be returned"
				);
			}, function(err) {
				assert.fail('Error invoking skill: '+err);
			});
	});
});

```