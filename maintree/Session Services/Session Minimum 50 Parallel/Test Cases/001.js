/*  Test prepared by Nathan Pocock compliance@opcfoundation.org
    Description: Creates 50 concurrent unnamed session. */

function createSession561007() {
    var result = true, sessions = [];
    for( var i=0; i<( MAX_SESSIONS ); i++ ) {                                              
        var session = SessionCreator.Connect();                    // define the session object and create SecureChannel, Session and activate it
        if( session.result ) {                                     
            sessions.push( session );                              // store the session for later closure
        }// create session
        else break;
    }//for ii...
    if( !Assert.Equal( 50, sessions.length, "Unable to create the minimum # of Sessions. Successfully created sessions = " + sessions.length ) ) result = false;
    // now to close
    for( var i=0; i<sessions.length; i++ ) SessionCreator.Disconnect( sessions[i] ); // loop thru each session, closing them
    return( result );
}

Test.Execute( { Procedure: createSession561007 } );