/*  Test prepared by compliance@opcfoundation.org
    Description: Create more sessions than the server officially supports. */

function createSession561008() {
    var sessionCount = 600;
    var requiredMinSessions = 500;

    // Connect to the server 
    var sessions = []

    // create our sessions
    var timeoutHint = parseInt( readSetting( "/Server Test/Session/DefaultTimeoutHint" ).toString() );
    var i;
    var expErr;
    for( i=0; i<sessionCount; i++ ) {

        // define the expected results
        expErr = new ExpectedAndAcceptedResults( StatusCode.Good );
        if( i >= requiredMinSessions ) expErr.addExpectedResult( StatusCode.BadTooManySessions );

        var tmpSession = SessionCreator.Connect( { CreateSession: { ServiceResult: expErr }, SkipActivateSession: true } );

        // create the session
        if( tmpSession.result ) {
            if( tmpSession.session.Response.ResponseHeader.ServiceResult.StatusCode == StatusCode.BadTooManySessions ) {
                addLog( "Reached the max # of sessions, which is: " + ( 1 + i ) );
                if( Assert.GreaterThan( requiredMinSessions - 1, sessions.length, "Unable to create the minimum # of sessions." ) ) result = false;
                break;
            }
            // activate the session
            if( !ActivateSessionHelper.Execute( { Session: tmpSession.session } ) ) {
                addError( "Reached the max # of sessions, which is: " + ( i ) );
                result = false;
                break;
            }
            sessions.push( tmpSession );
        }
        else {
            result = Assert.GreaterThan( requiredMinSessions - 1, sessions.length, "Unable to create the minimum # of sessions." );
            break;
        }
    }

    // now to close all sessions
    for( i = 0; i < sessions.length; i++ ) SessionCreator.Disconnect( sessions[i] );
    return( true );
}

Test.Execute( { Procedure: createSession561008 } );