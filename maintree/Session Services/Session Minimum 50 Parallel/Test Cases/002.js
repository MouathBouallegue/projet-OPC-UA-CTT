/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Creates more sessions than the server is capable of handling. */

function createSession561008() {
    var result = true, sessions = [];
    // max out our sessions first..
    for( var i = 0; i < ( MAX_SESSIONS ); i++ ) {
        var session = SessionCreator.Connect();                                                 // define the session object and create SecureChannel and Session
        if( session.result ) {
            sessions.push( session );                                                           // store the session for later closure
        }// create session
    }//for i...
    // now to add more, which should fail
    for( var i = 0; i < 10; i++ ) {
        var session = SessionCreator.Connect( { CreateSession: { ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadTooManySessions] ) }, SkipActivateSession: true } );
        if( session.result && session.session.Response.ResponseHeader.ServiceResult.isGood() ) {
            // activate the session
            if( !ActivateSessionHelper.Execute( { Session: session.session } ) ) {
                addError( "Reached the max # of sessions, which is: " + ( i ) );
                result = false;
                break;
            }
            sessions.push( session ); // store the session for later closure
        }
    }
    if( !Assert.GreaterThan( 49, sessions.length, "Unable to create the minimum # of Sessions. Successfully created sessions = " + sessions.length ) ) result = false;
    // now to close
    for( var i = 0; i < sessions.length; i++ ) SessionCreator.Disconnect( sessions[i] ); // loop thru each session, closing them
    return ( result );

}

Test.Execute( { Procedure: createSession561008 } );