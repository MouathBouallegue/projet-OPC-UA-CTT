/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Create 2-sessions.
        Note: one is already created in 'initialize.js' */

function createSession561008() {
    // create first session
    var session1 = new CreateSessionService( { Channel: Test.Channel } );
    if( session1.Execute() ) {
        if( !ActivateSessionHelper.Execute( { Session: session1 } ) ) return( false );
    }
    // create second session
    var channel2 = new OpenSecureChannelService();
    if( !channel2.Execute() ) {
        CloseSessionHelper.Execute( { Session: session1 } );
        return false;
    }
    var session2 = new CreateSessionService( { Channel: channel2 } );
    if( session2.Execute() ) {
        ActivateSessionHelper.Execute( { Session: session2 } );
        CloseSessionHelper.Execute( { Session: session2 } );
        CloseSecureChannelHelper.Execute( { Channel: channel2 } );
        CloseSessionHelper.Execute( { Session: session1 } );
        return ( true );
    }
    else {
        CloseSecureChannelHelper.Execute( { Channel: channel2 } );
        CloseSessionHelper.Execute( { Session: session1 } );
        return ( false );
    }
}

Test.Execute( { Procedure: createSession561008 } )