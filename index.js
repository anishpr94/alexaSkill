'use strict';
var http = require('http');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var cheerio = require('cheerio');
var myLatestReviews = [];
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `NowRunning ${title}`,
            content: `NowRunning - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}



var copyRightSpeech = 'According to the now running website : '
var count = 0;
function webScrap(element) {
  return new Promise(function (resolve, reject) {
    var url = element['link'][0];
    var request = http.get(url, function (response) {
      var json = '';
      response.on('data', function (chunk) {
        json += chunk;
      });

      response.on('end', function () {
        var $ = cheerio.load(json);
        var shortReview = $("#ctl00_ContentPlaceHolderMainContent_ReviewSummary").text();
        var rating = $("#ctl00_ContentPlaceHolderMainContent_RatingText").text();
        console.log(element.title[0]);
        myLatestReviews.push(element.title[0] +': '+ shortReview + ' Rating is : ' + rating)
        console.log(shortReview);
        console.log(rating);
        resolve('success');
      });
    });
    request.on('error', function (err) {
      console.log(err);
       myLatestReviews.push('I did not understand that!')
      reject('ellame pochu');
    });
  });
}
parser.on('error', function (err) { console.log('Parser error', err); });
async function getTopMovies(callback) {
    count = 0
    myLatestReviews = [];
  return new Promise(function(resolve,reject){var data = '';
  http.get('http://www.nowrunning.com/cgi-bin/rss/reviews_malayalam.xml', async function (res) {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      res.on('data', function (data_) { data += data_.toString(); });
      res.on('end', async function () {
        parser.parseString(data, async function (err, result) {
          for (let i = 0; i < 3; i++) {
            callb(result['rss']['channel'][0]['item'][i], callback)
          }
        });
      });
    }
  });
  });
};

async function getMovieSuggestions(callback) {
    count = 0
    let randomNumber = Math.floor(Math.random() * 10) + 1  
    myLatestReviews = []
  return new Promise(function(resolve,reject){var data = '';
  http.get('http://www.nowrunning.com/cgi-bin/rss/reviews_malayalam.xml', async function (res) {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      res.on('data', function (data_) { data += data_.toString(); });
      res.on('end', async function () {
        parser.parseString(data, async function (err, result) {
            getMovieFromIndex(result['rss']['channel'][0]['item'][randomNumber], callback)
        });
      });
    }
  });
  });
};

async function getMovieFromIndex(element, callback) {
  console.log(element.title[0]);
  await webScrap(element)
   count++;
  if(count ==1){
    console.log(myLatestReviews.join())
    const cardTitle = 'Suggest a movie';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;
    callback({}, buildSpeechletResponse(cardTitle, copyRightSpeech + myLatestReviews.join(), null, shouldEndSession));
  }
}

async function callb(element, callback) {
  console.log(element.title[0]);
  await webScrap(element)
   count++;
  if(count ==3){
    console.log(myLatestReviews.join())
    const cardTitle = 'Top movies currently';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;
    callback({}, buildSpeechletResponse(cardTitle,copyRightSpeech + myLatestReviews.join(), null, shouldEndSession));
  }
}

function test(){
getMovieSuggestions().then(()=> {
console.log('hello');
}).catch(()=> console.log('error'));
}

test();


function getBestMoviesOfTheYear(callback, intent){
count = 0
let year = intent.slots.year.value
console.log(intent.slots.year.value);
console.log('reached slot value')
if(!intent.slots.year.value){
    year = 2018;
}
let myLatestReviews = []
let reviewLink = 'http://www.nowrunning.com/top-rated-malayalam-movies/' + year +'/';
var request = http.get(reviewLink, function (response) {
 var json = '';
 response.on('data', function (chunk) {
   json += chunk;
 });

 response.on('end', function () {
   var $ = cheerio.load(json);
   for( let k=0 ; k < 5; k++){
    myLatestReviews.push($('.BestMoviesRight').eq(k).find('a').eq(0).text() + ' Has a ' + $('.BestMoviesRight').eq(k).find('span').eq(0).text() +
    $('.BestMoviesRight').eq(k).find('span').eq(1).text());
   }
   console.log(myLatestReviews);
 callback({}, buildSpeechletResponse('top movies of the year' , copyRightSpeech + myLatestReviews.join(' '), null, true));
 });
});
request.on('error', function (err) {
 console.log(err); 
});
}


function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to the Alexa Skill For Movie Reviews. ' +
        'Please ask me about top movies of the week or suggest a random movie or top movies of the year';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Please ask me about malayalam movies, ' +
        'Example, Top movies of the week, best movies, review of movie name, suggest a random movie, ask now running for current movies, ask now running to suggest a movie to watch, ask now running for top movies of the two thousand eighteen';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function errorResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'I did not understand that'
    // understood, they will be prompted again with this text.
    const repromptText = 'Please ask me about malayalam movies, ' +
        'Example, Top movies of the week, best movies, review of movie name, suggest a random movie, ask now running for current movies, ask now running to suggest a movie to watch, ask now running for top movies of the two thousand eighteen';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for trying the Alexa Skills for Malayalam movie reviews. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function createFavoriteColorAttributes(favoriteColor) {
    return {
        favoriteColor,
    };
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */



// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

 if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
       } else if (intentName === 'GetTopMovies') {
        getTopMovies(callback);
       } else if (intentName === 'GetMovieSuggestion') {
        getMovieSuggestions(callback);
       } else if (intentName === 'GetBestMovieOfYear') {
         getBestMoviesOfTheYear(callback, intent);
       } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        errorResponse(callback);
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
