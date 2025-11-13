/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: CreateSession with default parameters, except for a small timeout of 10 seconds. Activate the session and stall (do not use) 
                 the session for a period GREATER than the timeout period. Call any service on the session to experience a Session Closed status. */

function createSession561005() {
    var session = new CreateSessionService( { Channel: Test.Channel } );
    if( session.Execute( { RequestedSessionTimeout: 10000 } ) && ActivateSessionHelper.Execute( { Session: session } ) ) {

        // ok, so all is well... lets record the revisedSessionTimeout and we'll use that to base our delay/wait on so as to cause a session timeout.
        // we will also add 10% to avoid overly-sensitivity to timing
        var revisedTimeoutInMsec = session.Response.RevisedSessionTimeout + ( session.Response.RevisedSessionTimeout * 0.1 );
        print( "Session Timeout: " + DurationToString( revisedTimeoutInMsec )+ ". Now to wait and check if the session will actually timeout after zero activity..." );
        UaDateTime.CountDown( { Msecs: revisedTimeoutInMsec } );

        // this activation should fail!
        ActivateSessionHelper.Execute( { Session: session, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadSessionIdInvalid, StatusCode.BadSessionClosed ], StatusCode.BadInvalidState ) } );

        // clean-up by closing the secure channel, and reopening
        Test.Disconnect( { SkipCloseSession: true } );
        openDefaultChannel();
    }
    return( true );
}

Test.Execute( { Procedure: createSession561005 } );