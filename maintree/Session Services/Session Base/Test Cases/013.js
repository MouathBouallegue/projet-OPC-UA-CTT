/*  Test prepared by Nathan Pocock (compliance@opcfoundation.org)
    Description: Create a session without specifying a SessionName (legal, but some servers crash) */

function test() {
    var session = new CreateSessionService( { Channel: Test.Channel } );
    if( session.Execute( { SessionName: "" } ) ) {
        if( ActivateSessionHelper.Execute( { Session: session } ) ) {
            Assert.NotEqual( 0, session.Response.RevisedSessionTimeout, "Expected Server to revise RequestedSessionTimeout=0, to something else." );
            CloseSessionHelper.Execute( { Session: session } );
        }
    }
    return( true );
}

Test.Execute( { Procedure: test } );