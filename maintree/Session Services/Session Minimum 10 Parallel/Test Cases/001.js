/* Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Creates 10 concurrent sessions. 
    
*/

function createSession561002() {

    var sessions = [];
    var max;

    // Note: One Channel is already created in initialize.js, also if auditing is enabled one session will already be active
    if( isDefined( Test.Audit ) && Test.Audit.Started ) max = 8; else max = 9;

    // Create Session for initialize Test.Channel
    var testSession = new CreateSessionService( { Channel: Test.Channel } );
    if( testSession.Execute() ) ActivateSessionHelper.Execute( { Session: testSession } );
    
    // create the session objects
    for( var i=0; i<max; i++ ) {
        var session = SessionCreator.Connect();
        if( session.result ) {
            sessions.push( session );
        }
        else {
            break;
        }
    }
    // now to close
    for( var i=0; i<sessions.length; i++ ) { 
        SessionCreator.Disconnect( sessions[i] );
    }//for i...
    
    // Close Session for initialize Test.Channel
    CloseSessionHelper.Execute( { Session: testSession } );
    
    return( true );
}

Test.Execute( { Procedure: createSession561002 } );