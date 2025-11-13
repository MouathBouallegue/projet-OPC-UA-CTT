/**
 * This script is meant to check whether the user has clicked the Stop Run Button,  or whether 
 * the CTT has encountered a resource allocation error.
 * If so, this script will throw an exception which will stop the current test Run
 */

/**
 * @constant
 * @type {string}
 */
const USER_STOPPED_RUN = "User Stopped Run";

/**
 * @constant
 * @type {string}
 */
const RESOURCE_STARVATION_ERROR = "Fatal Error: Process Resources Exhausted";

/**
 * Determines if a script is a cleanup script, in which case a test run 
 * stopped by the user will continue to run the cleanup
 * @returns {boolean}
 */
function ShouldShutdownTestScript(){

    var shutdownScript = true;
    var testScriptFilePath = getCurrentScript();
    if ( testScriptFilePath.indexOf( "cleanup" ) >= 0 ||
        testScriptFilePath.indexOf( "afterTest" ) >= 0 ) {

        shutdownScript = false;
    }

    return shutdownScript;
}

/**
 * Determines if the CTT ran out of memory and throws error
 */
function CheckResourceError(){

    var error = checkResourceError();
    if ( error == true ){
        throw ( RESOURCE_STARVATION_ERROR );
    }
}

/**
 * Determines if the user stopped the current test run.
 * Will throw error if not a cleanup script
 */
function CheckUserStop(){
    CheckResourceError();
    var error = checkUserStop();
    if ( error == true ){
        if ( ShouldShutdownTestScript() ){
            throw ( USER_STOPPED_RUN );
        }
    }
}


/**
 * Sleep 
 * This function replaces the wait() function in the CTT.
 * The function in the CTT will send back a response that suggests 
 * whether the current run should be stopped,
 * either by a user interaction, or resource exhaustion
 * @param {int} length - milliseconds to sleep
 */
function wait ( length ) {

    var shouldStop = Wait( length );
    if ( shouldStop == true ) {
        CheckUserStop( );
    }
}
