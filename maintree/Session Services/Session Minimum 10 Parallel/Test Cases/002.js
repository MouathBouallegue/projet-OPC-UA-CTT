/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Invoke CreateSession with default parameters. Do this for 5 sessions, which will cause the session name to be the same for each session. */

function createSession561006() {
const MAX = 5;
    var result = true, sessions = [];
    for( var i=0; i<MAX; i++ ) {
        var session = SessionCreator.Connect( { CreateSession: { SessionName: "SessionNameAlwaysTheSame" } } );  // create a new session object and force the session name to be the same every time
        if( session.result ) {               
            sessions.push( session );                                                         // store this session in an array
        }
        else result = false;
    }//for i...
    // clean up
    for( var i=0; i<sessions.length; i++ ) SessionCreator.Disconnect( sessions[i] );
    return( result );
}

Test.Execute( { Procedure: createSession561006 } );