/*  Test prepared Nathan Pocock; compliance@opcfoundation.org
    Description: per Errata 1.02.2: attempt a DoS attack on Server by consuming SecureChannels and using only SOME of them!
                 When creating a valid/real SecureChannel, prior [unused] channels should be clobbered. */

function DoSAttempt007( args ) {
    var result = true;
    var maxChannels = readSetting( "/Server Test/Capabilities/Max SecureChannels" );
    var maxSessions = readSetting("/Server Test/Capabilities/Max Supported Sessions");
    var sessions = [];
    var sessionThreads = [];

    if( !isDefined( args ) ) args = new Object();
    if( !isDefined( args.RequestedSecurityPolicyUri ) ) args.RequestedSecurityPolicyUri = SecurityPolicy.None;
    if( !isDefined( args.MessageSecurityMode ) ) {
        var endpoint = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, FilterHTTPS: true, SecurityPolicyUri: SecurityPolicy.policyToString( args.RequestedSecurityPolicyUri ), MostSecure: true } );
        if( isDefined( endpoint ) ) args.MessageSecurityMode = endpoint.SecurityMode;
        else args.MessageSecurityMode = MessageSecurityMode.None;
    }

    if ( maxChannels == 0 || maxChannels >= 945 ) {
        maxChannels = 945; // arbitrarily choose 950, if the setting is not configured (default=0, to force configuration).
        addWarning( "The CTT can only create 1000 Channels and Session in total. Even though the server would support more than 950 channels we are running the test only with 950 because the CTT doesn't support more than that." );
    }
    // the test-case states that a 1-second delay should be added between each new SecureChannel.
    // if we do that, then large systems could take a long time to execute. So lets add the delay ONLY
    // if the # of secure channels is 10 or less
    var waitTime = maxChannels <= 10? 1000 : 0;

    // step 1: create 1 less than max # of supported channels 
    addLog("Step 1: Create " + (maxChannels - 1) + " SecureChannels with Sessions. All should succeed." );
    var channels = [];
    var createResults = [];
    var closeResults = [];
    for( var i=0; i<(maxChannels - 1); i++ ) {
        addLog( "Create SecureChannel #" + ( i + 1 ) );
        channels.push( new OpenSecureChannelService() );
        createResults.push( channels[channels.length - 1].Execute( { RequestedSecurityPolicyUri: args.RequestedSecurityPolicyUri, MessageSecurityMode: args.MessageSecurityMode } ) );
        if( !createResults[i] ) {
            result = false;
            addError( "Aborting Step #1 Create SecureChannel #" + ( i + 1 ) + " failed." );
            break;
        }
        if (i < maxSessions) {
            addLog("Create Session #" + (i + 1));
            sessions[i] = new CreateSessionService({ Channel: channels[i] });
            if (!sessions[i].Execute()) {
                result = false;
                addError("Aborting Step #1 Create Session #" + (i + 1) + " failed.");
                break;
            }
            addLog("Activate Session #" + (i + 1));
            if (!ActivateSessionHelper.Execute({ Session: sessions[i] })) {
                result = false;
                addError("Aborting Step #1 Activate Session #" + (i + 1) + " failed.");
                break;
            }
            sessionThreads.push( new SessionThread() );
            sessionThreads[i].Start( { Session: sessions[i] } );
        }
        else {
            addSkipped( "Couldn't create Session #" + ( i + 1 ) + "because the maximum number of Sessions was reached. For this test case the max # of Sessions has to be at least (max # of SecureChannels - 1)" );
            result = false;
            break;
        }
        UaDateTime.CountDown( { Msecs: waitTime } );
    }//for i...

    // only continue if ALL secure channels were created successfully;
    // otherwise close the channels that were created successfully.
    if ( result && maxChannels <= 945 ) {
        // test case says to create 5 more SecureChannels, but without Sessions!
        addLog( "Step 2: Add 5 more [idle] SecureChannels, which should succeed!" );
        for( i=0; i<5; i++ ) {
            channels.push( new OpenSecureChannelService() );
            createResults.push( channels[channels.length - 1].Execute( { RequestedSecurityPolicyUri: args.RequestedSecurityPolicyUri, MessageSecurityMode: args.MessageSecurityMode } ) );
            // Allow the server to detect that the freshly created channel won't be used by the client
            UaDateTime.CountDown( { Msecs: Settings.ServerTest.SecureChannel.MinLifetimeOfSecureChannel, Message: "Wait to allow the system to detect the client is not activating the channel." } );
        }

        // close all channels with sessions; should be ok.
        addLog( "Step 3: Remove all Sessions (added in step #2); should be successful." );
        for( var i=0; i<sessions.length; i++ ) if( !CloseSessionHelper.Execute( { Session: sessions[i] } ) ) result = false;

        // close all channels that did not have a session; all except the last should fail with BadSecureChannelIdInvalid
        addLog( "Step 4: Remove all remaining SecureChannels, all-but-one should fail; the last channel should delete successfully." );
        for ( i = ( channels.length - 6 ); i < ( channels.length - 1 ); i++ ) if ( !CloseSecureChannelHelper.Execute( { Channel: channels[i], ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadSecureChannelIdInvalid, StatusCode.BadInvalidState], StatusCode.Good ) } ) ) result = false;
        if ( !CloseSecureChannelHelper.Execute( { Channel: channels[( channels.length - 1 )], ServiceResult: new ExpectedResults( { Expected: [StatusCode.Good] } ) } ) ) result = false;
        for ( i = 0; i < ( channels.length - 6 ); i++ ) if ( !CloseSecureChannelHelper.Execute( { Channel: channels[i], ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ) } ) ) result = false;
    }// all channels successful
    else {
        // cleanup all sessions, session threads and channels
        for( var t=0; t<sessionThreads.length; t++ ) {
            sessionThreads[t].End();
            UaDateTime.CountDown( { Msecs: 10 } );
        }
        for( var s=0; s<sessions.length; s++ ) {
            CloseSessionHelper.Execute( { Session: sessions[s] } );
        }
        for( var i=0; i<createResults.length; i++ ) {
            if( createResults[i] ) CloseSecureChannelHelper.Execute( { Channel: channels[i], ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ) } );
        }
    }
    UaDateTime.CountDown({ Seconds: 10, Message: "Wait after DoS attack to stabilize system..." });
    return( result );
}

Test.Execute( { Procedure: DoSAttempt007 } );