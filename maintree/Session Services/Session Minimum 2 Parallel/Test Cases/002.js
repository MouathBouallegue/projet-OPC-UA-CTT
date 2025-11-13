/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Create more sessions than the server supports. */

function createSession561008() {
    // create first session
    var session1 = new CreateSessionService( { Channel: Test.Channel } );
    if( session1.Execute() ) {
        if( !ActivateSessionHelper.Execute( { Session: session1 } ) ) return( false );
    }

    var channel2 = new OpenSecureChannelService();
    if( !channel2.Execute() ) {
        CloseSessionHelper.Execute( { Session: session1 } );
        return ( false );
    }
    var session2 = new CreateSessionService( { Channel: channel2 } );
    if( session2.Execute() ) ActivateSessionHelper.Execute( { Session: session2 } );
    else {
        CloseSecureChannelHelper.Execute( { Channel: channel2 } );
        CloseSessionHelper.Execute( { Session: session1 } );
        return( false );
    }

    // now to add more than the server can handle
    var channel3 = new OpenSecureChannelService();
    if( channel3.Execute() ) {
        var session3 = new CreateSessionService( { Channel: channel3 } );
        session3.Execute( { ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadTooManySessions] ) } );
        if( session3.Response.ResponseHeader.ServiceResult.isGood() ) {
            ActivateSessionHelper.Execute( { Session: session3 } );
        }
    }
    else {
        CloseSessionHelper.Execute( { Session: session2 } );
        CloseSecureChannelHelper.Execute( { Channel: channel2 } );
        CloseSessionHelper.Execute( { Session: session1 } );
        return ( false );
    }

    // add another session
    var channel4 = new OpenSecureChannelService();
    if( channel4.Execute() ) {
        var session4 = new CreateSessionService( { Channel: channel4 } );
        session4.Execute( { ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadTooManySessions] ) } );
        if( session4.Response.ResponseHeader.ServiceResult.isGood() ) {
            ActivateSessionHelper.Execute( { Session: session4 } );
        }
    }
    else {
        CloseSessionHelper.Execute( { Session: session3 } );
        CloseSecureChannelHelper.Execute( { Channel: channel3 } );
        CloseSessionHelper.Execute( { Session: session2 } );
        CloseSecureChannelHelper.Execute( { Channel: channel2 } );
        CloseSessionHelper.Execute( { Session: session1 } );
        return ( false );
    }

    // clean-up
    if( session4.Response.ResponseHeader.ServiceResult.isGood() ) CloseSessionHelper.Execute( { Session: session4, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
    CloseSecureChannelHelper.Execute( { Channel: channel4 } );
    if( session3.Response.ResponseHeader.ServiceResult.isGood() ) CloseSessionHelper.Execute( { Session: session3, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
    CloseSecureChannelHelper.Execute( { Channel: channel3 } );
    CloseSessionHelper.Execute( { Session: session2 } );
    CloseSecureChannelHelper.Execute( { Channel: channel2 } );
    CloseSessionHelper.Execute( { Session: session1 } );
    return( true );
}

Test.Execute( { Procedure: createSession561008 } );