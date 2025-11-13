/*  Test prepared by Ing.-Büro Allmendinger: info@allmendinger.de
    Description:
        Step 1: Read the value of the RejectedSessionCount and SecurityRejectedSessionCount. Try to activate a session and specify an User which does not have access to the server. Read the value of the (Security-)RejectedSessionCount once more.
        Step 2: Read the value of the RejectedSessionCount and SecurityRejectedSessionCount. Try to activate a session which was never created (using an invalid SessionId). Read the value of the (Security-)RejectedSessionCount once more.
    Expectation:
        Step 1: The values can be read. In the second read the values should be incremented by 1.
        Step 2: The values can be read. The value of the RejectedSessionCount should be incremented by 1. The value of the SecurityRejectedSessionCount should not change.
    */

function BaseInfoDiagnostics020() {
    var result = true;
    var TCV = new Object();

    // MantisId=6307: Added a check to verify that test script is only executed if a Username policy is available.
    if( isDefined( gServerCapabilities.Endpoints ) && gServerCapabilities.Endpoints.length > 0 ) {
        TCV.EndpointRejectedSession = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, TokenType: UserTokenType.UserName, FilterHTTPS: true, MostSecure: true } );
    }

    if( !isDefined( TCV.EndpointRejectedSession ) ) {
        addSkipped( "The test script requires an available Endpoint with an Username policy activated. No endpoint found, skipping test case." );
        return ( false );
    }
    else {
        TCV.Channel = new OpenSecureChannelService();
        if( !TCV.Channel.Execute( { RequestedSecurityPolicyUri: TCV.EndpointRejectedSession.SecurityPolicyUri, MessageSecurityMode: TCV.EndpointRejectedSession.SecurityMode } ) ) {
            return ( false );
        }
    }

    var rejectedSessionCount = MonitoredItem.fromNodeIds( new UaNodeId( i = 3705 ) )[0];
    var rejectedSecuritySessionCount = MonitoredItem.fromNodeIds( new UaNodeId( i = 2279 ) )[0];

    if( ReadHelper.Execute( { NodesToRead: [rejectedSessionCount, rejectedSecuritySessionCount] } ) ) {
        // store the values
        rejectedSessionCount.InitialValue = rejectedSessionCount.Value.Value;
        rejectedSecuritySessionCount.InitialValue = rejectedSecuritySessionCount.Value.Value;

        // Step 1
        // Create a new session
        var sessionRejected = new CreateSessionService( { Channel: TCV.Channel } );
        if( sessionRejected.Execute() ) {
            // now try to activate the session using a username which does not have access to the server. We expect that it fails.
            if( !ActivateSessionHelper.Execute( {
                Session: sessionRejected,
                UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                    Session: sessionRejected,
                    UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessDenied, UserTokenType.UserName )
                } ),
                ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadIdentityTokenInvalid, StatusCode.BadIdentityTokenRejected, StatusCode.BadUserAccessDenied] )
            } ) ) {
                addError( "ActivateSession succeeded but was intended to fail. Abort test." );
                result = false;
                CloseSessionHelper.Execute( { Session: sessionRejected, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
                CloseSecureChannelHelper.Execute( { Channel: TCV.Channel } );
            }
            else {
                CloseSessionHelper.Execute( { Session: sessionRejected, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSessionNotActivated] ) } );
                CloseSecureChannelHelper.Execute( { Channel: TCV.Channel } );
                if( ReadHelper.Execute( { NodesToRead: [rejectedSessionCount, rejectedSecuritySessionCount] } ) ) {
                    if( rejectedSessionCount.Value.Value == Number( rejectedSessionCount.InitialValue ) + 1 ) {
                        print( "The value of the RejectedSessionCount was incremented by 1 as expected." );
                    }
                    else {
                        addError( "The value of the RejectedSessionCount is did not increment as expected. InitialValue: " + rejectedSessionCount.InitialValue + ", received: " + rejectedSessionCount.Value.Value );
                        result = false;
                    }
                    if( rejectedSecuritySessionCount.Value.Value == Number( rejectedSecuritySessionCount.InitialValue ) + 1 ) {
                        print( "The value of the rejectedSecuritySessionCount was incremented by 1 as expected." );
                    }
                    else {
                        addError( "The value of the rejectedSecuritySessionCount is did not increment as expected. InitialValue: " + rejectedSecuritySessionCount.InitialValue + ", received: " + rejectedSecuritySessionCount.Value.Value );
                        result = false;
                    }

                }
                else {
                    addError( "Unable to read the values of the RejectedSessionCount and/or the SecurityRejectedSessionCount node. Abort test." );
                    return ( false );
                }
            }
        }
        else {
            CloseSecureChannelHelper.Execute( { Channel: TCV.Channel } );
            addError( "CreateSession failed. Abort test." );
            return ( false );
        }
        // Step 2
        // replace the initial values
        rejectedSessionCount.InitialValue = rejectedSessionCount.Value.Value;
        rejectedSecuritySessionCount.InitialValue = rejectedSecuritySessionCount.Value.Value;

        // Try to activate a session which was never created.
        var channel = SessionCreator.Connect( { SkipCreateSession: true, SkipActivateSession: true, InstanciateHelpers: false } );
        if( channel.result ) {
            session = new CreateSessionService( { Channel: channel.channel } );
            ActivateSessionHelper.Execute( { Session: session, ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSessionIdInvalid ) } );
            SessionCreator.Disconnect( channel );
        }

        // now verify the result
        if( ReadHelper.Execute( { NodesToRead: [rejectedSessionCount, rejectedSecuritySessionCount] } ) ) {
            if( rejectedSessionCount.Value.Value == Number( rejectedSessionCount.InitialValue ) + 1 ) {
                print( "The value of the RejectedSessionCount was incremented by 1 as expected." );
            }
            else {
                addError( "The value of the RejectedSessionCount is did not increment as expected. InitialValue: " + rejectedSessionCount.InitialValue + ", received: " + rejectedSessionCount.Value.Value );
                result = false;
            }
            if( rejectedSecuritySessionCount.Value.Value == Number( rejectedSecuritySessionCount.InitialValue ) ) {
                print( "The value of the rejectedSecuritySessionCount did not increment as expected." );
            }
            else {
                addError( "The value of the rejectedSecuritySessionCount is did increment which was not expected. InitialValue: " + rejectedSecuritySessionCount.InitialValue + ", received: " + rejectedSecuritySessionCount.Value.Value );
                result = false;
            }
        }
        else {
            addError( "Unable to read the values of the RejectedSessionCount and/or the SecurityRejectedSessionCount node. Abort test." );
            return ( false );
        }
    }
    else {
        CloseSecureChannelHelper.Execute( { Channel: TCV.Channel } );
        addError( "Unable to read the values of the RejectedSessionCount and/or the SecurityRejectedSessionCount node. Abort test." );
        return ( false );
    }
    return ( result );
}

Test.Execute( { Procedure: BaseInfoDiagnostics020 } );