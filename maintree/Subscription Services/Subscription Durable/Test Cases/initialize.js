include( "./library/Base/safeInvoke.js" );

var readyForTest = false;

if ( !Test.Connect( { SkipCreateSession: true } ) ) {
    addError( "Could not connect to the UA Server. Aborting conformance unit Subscription Durable." );
    stopCurrentUnit();
}
else {
    Test.Disconnect();
    if ( gServerCapabilities.Endpoints.length > 0 ) {
        epgeneralChNone = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, TokenType: UserTokenType.UserName, FilterHTTPS: true } );
    }
    if( isDefined( epgeneralChNone ) && Test.Channel.Execute( { RequestedSecurityPolicyUri: epgeneralChNone.SecurityPolicyUri, MessageSecurityMode: epgeneralChNone.SecurityMode } ) ) {
        Test.Session = new CreateSessionService( { Channel: Test.Channel } );
        if ( Test.Session.Execute() ) {
            if ( ActivateSessionHelper.Execute( {
                Session: Test.Session,
                UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                    Session: Test.Session,
                    UserCredentials: UserCredentials.createFromSettings( PresetCredentials.AccessGranted1, UserTokenType.UserName )
                } )
            } ) ) {
                InstanciateHelpers( { Session: Test.Session } );
                var serverObjectNodeId = new UaNodeId( Identifier.Server );
                TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: [UaBrowsePath.New( { StartingNode: serverObjectNodeId, RelativePathStrings: ["SetSubscriptionDurable"] } )], OperationResults: [new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoMatch] )] } );
                if ( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].StatusCode.isGood() ) {
                    var setSubscriptionDurableNodeId = TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId;
                    var setSubscriptionDurableMethod = MonitoredItem.fromNodeIds( setSubscriptionDurableNodeId )[0];
                    if ( !isDefined( setSubscriptionDurableNodeId ) || !isDefined( setSubscriptionDurableMethod ) ) {
                        addSkipped( "Unable to find SetSubscriptionDurable method in server object. Skipping CU." );
                        Test.Disconnect();
                    }
                    else{ // check if SetSubscriptionDurable method is implemented
                        CallHelper.Execute( { 
                            MethodsToCall: [ { 
                                MethodId: setSubscriptionDurableNodeId,
                                ObjectId: serverObjectNodeId,
                                InputArguments: [
                                    UaVariant.New( { Type: BuiltInType.UInt32, Value: 1 } ),
                                    UaVariant.New( { Type: BuiltInType.UInt32, Value: 5 } )
                                ]
                            } ] 
                        } );
                        if( CallHelper.Response.Results[0].StatusCode.StatusCode == StatusCode.BadNotImplemented ){
                            addSkipped("SetSubscriptionDurable method is not implemented. Skipping CU.");
                            Test.Disconnect();
                        }
                        else {
                            readyForTest = true;
                        }
                    }
                    Test.PostTestFunctions.push( clearPublish );
                }
                else {
                    addSkipped( "Unable to find SetSubscriptionDurable method in server object. Skipping CU." );
                    Test.Disconnect();
                }
            }
        }
    }
    else {
        addSkipped( "This Conformance Unit requires the support of Username. Unable to connect to server with username. Aborting CU." );
    }

    if( !readyForTest ) {
        stopCurrentUnit();
    }
}

// after each test, lets Reset the PublishHelper
function clearPublish() {
    print( "\n\n** Post Test Function: clearPublish() **\n" );
    var serviceResults = new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNoSubscription] );
    PublishHelper.Execute( {
        AckAllAvailableSequenceNumbers: true,
        SkipValidation: true,
        SuppressMessaging: false
    } );
    PublishHelper.Clear();
}