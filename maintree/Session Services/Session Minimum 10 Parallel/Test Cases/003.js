/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Creates more sessions than the server is capable of handling. */

function createSession561008() {
const MAX = 14;
const MIN = 10;
    var result = true; sessions = []
    for( var i=0; i<MAX; i++ ) {
        var expErr = new ExpectedAndAcceptedResults( StatusCode.Good );
        if( i >=( MIN - 1 ) ) expErr.addExpectedResult( StatusCode.BadTooManySessions );

        var session = SessionCreator.Connect( { CreateSession: { ServiceResult: expErr }, SkipActivateSession: true } );

        // create the session
        if( !session.result ) {
            if( Assert.GreaterThan( ( MIN - 1 ), i, "Exceeded the session count sooner than expected." ) ) {
                result = false;
            }
            break;
        }
        if( session.result ) {
            if( session.session.Response.ResponseHeader.ServiceResult.StatusCode == StatusCode.BadTooManySessions ) {
                addLog( "Reached the max # of sessions, which is: " + ( i ) );
                result = false;
                break;
            }
            // activate the session
            if( !ActivateSessionHelper.Execute( { Session: session.session } ) ) {
                addError( "Reached the max # of sessions, which is: " + ( i ) );
                result = false;
                break;
            }
            sessions.push( session );
        }
    }
    // now to close all sessions
    for( i=0; i<sessions.length; i++ ) SessionCreator.Disconnect( sessions[i] );
    return( result );
}

Test.Execute( { Procedure: createSession561008 } );