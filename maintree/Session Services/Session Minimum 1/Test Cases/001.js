/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Create two sessions, activate them, and then close them (one must succeed). */

function createSession561008() {
    var session1 = new CreateSessionService( { Channel: Test.Channel } );
    if( session1.Execute() ) {
        if( ActivateSessionHelper.Execute( { Session: session1 } ) ) {
            // now establish a second secure channel which should succeed for all servers
            var channel2 = new OpenSecureChannelService();
            if( !channel2.Execute() ) {
                CloseSessionHelper.Execute( { Session: session1 } );
                return false;
            }
            var result = true;
            // now to another session, which could be more than the server can handle 
            var expectedResult = new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadTooManySessions ] );
            var csExpectation = new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionNotActivated ] );
            var session2 = new CreateSessionService( { Channel: channel2 } );
            if( session2.Execute( { ServiceResult: expectedResult } ) ) {
                if( session2.Response.ResponseHeader.ServiceResult.isGood() ) {
                    CloseSessionHelper.Execute( { Session: session2, ServiceResult: csExpectation } );
                }
            }
            else result = false;

            // clean-up
            CloseSecureChannelHelper.Execute( { Channel: channel2 } );
            CloseSessionHelper.Execute( { Session: session1 } );
            return( result );
        }
        else return( false );
    }
    else return( false );
}

Test.Execute( { Procedure: createSession561008 } )