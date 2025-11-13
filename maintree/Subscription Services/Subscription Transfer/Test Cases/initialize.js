include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/safeInvoke.js" );

include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/Helpers.js" );

var items = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: 2, Writable: false, SkipCreateSession: false } );
if ( items.length === 0 || items.length < 2 ) {
    addSkipped( "No items to test with. Please check settings." );
    stopCurrentUnit();
}
else {
    
    var WritableItems = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Number: 2, Writable: true, SkipCreateSession: false } );
    
    if ( !isDefined( gServerCapabilities ) || !isDefined( gServerCapabilities.Endpoints ) ) {
        Test.Connect();
        Test.Disconnect();
    }
    if ( gServerCapabilities.Endpoints.length > 0 ) {
        var epGeneralChU;
        var epGeneralChA;
        var epGeneralChC;

        for ( var i = 0; i < gServerCapabilities.Endpoints.length; i++ ) {
            if ( UaEndpointDescription.FindTokenType( { Endpoint: gServerCapabilities.Endpoints[i], TokenType: UserTokenType.UserName } ) ) epGeneralChU = gServerCapabilities.Endpoints[i]; break;
        }
        for ( i = 0; i < gServerCapabilities.Endpoints.length; i++ ) {
            if ( UaEndpointDescription.FindTokenType( { Endpoint: gServerCapabilities.Endpoints[i], TokenType: UserTokenType.Anonymous } ) ) epGeneralChA = gServerCapabilities.Endpoints[i]; break;
        }
        for ( i = 0; i < gServerCapabilities.Endpoints.length; i++ ) {
            if ( UaEndpointDescription.FindTokenType( { Endpoint: gServerCapabilities.Endpoints[i], TokenType: UserTokenType.Certificate } ) ) epGeneralChC = gServerCapabilities.Endpoints[i]; break;
        }

        if ( isDefined( epGeneralChU ) ) {
            if( !Test.Connect( {
                OpenSecureChannel: {
                    RequestedSecurityPolicyUri: epGeneralChU.SecurityPolicyUri,
                    MessageSecurityMode: epGeneralChU.SecurityMode
                }
            } ) ) {
                addError( "Unable to connect to UA Server. Unable to continue tests within this Conformance Unit. Aborting Conformance Unit testing of \"Subscription Transfer\"." );
                stopCurrentUnit();
            }
            else {
                var expectedServiceResults = new ExpectedAndAcceptedResults( [StatusCode.BadServiceUnsupported, StatusCode.BadNotImplemented], StatusCode.Good );
                TransferSubscriptionsHelper.Execute( { SubscriptionIds: new Subscription(), SourceSession: Test.Session, DestinationSession: Test.Session, SendInitialValues: true, ServiceResult: expectedServiceResults, OperationResults: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadSubscriptionIdInvalid] ), SuppressMessaging: true } );
                if ( expectedServiceResults.containsExpectedStatus( TransferSubscriptionsHelper.Response.ResponseHeader.ServiceResult ) ) {
                    Test.Disconnect();
                    stopCurrentUnit();
                }
            }
        }
        else {
            addError( "Unable to connect to UA Server. Unable to continue tests within this Conformance Unit. Aborting Conformance Unit testing of \"Subscription Transfer\"." );
            stopCurrentUnit();
        }
        CloseSessionHelper.Execute({ Session: Test.Session });
    }
}