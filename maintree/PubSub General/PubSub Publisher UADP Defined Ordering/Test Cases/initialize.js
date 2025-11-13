include( "./library/Base/safeInvoke.js" );
include( "./library/PubSub/UADPMessageDissector.js" );
include( "./library/PubSub/PubSubUtilities.js" );

const maxTimeToWaitForMessage = 10000;
const maxNumberOfMessages = 10;

var CU_Variables = new Object();
CU_Variables.TestNetworkMessages = [];
    
if( !Test.Connect() ) {
    addError( "Could not connect to UA Server. Aborting conformance unit." );
    stopCurrentUnit();
}
else {
    
    var configResult = ConfigurePubSubTest( "PeriodicFixed" );
    
    if( configResult.success ) {
        
        CU_Variables.SubscriberConfiguration = configResult.SubscriberConfiguration;
        CU_Variables.PublisherConfiguration  = configResult.PublisherConfiguration;
        
        // Restart server for CTT config changes to take effect
        UaOpcServer.restartServer();
        
        CU_Variables.TestNetworkMessages = CollectNetworkMessageData( {
            SubscriberConfiguration: CU_Variables.SubscriberConfiguration,
            Timeout:                 maxTimeToWaitForMessage,
            MaxNumberOfMessages:     maxNumberOfMessages,
            SuppressMessages:        true
        } );
        
        if( CU_Variables.TestNetworkMessages.length == 0 ) {
            addError( "Did not receive any NetworkMessages within " + maxTimeToWaitForMessage + " ms to test with.\nPlease make sure the server is sending messages.\nAborting Conformance Unit." );
            stopCurrentUnit();
        }
    }
    else {
        addError( "Error generating the CTT test configuration. Aborting conformance unit." );
        stopCurrentUnit();
    }
}