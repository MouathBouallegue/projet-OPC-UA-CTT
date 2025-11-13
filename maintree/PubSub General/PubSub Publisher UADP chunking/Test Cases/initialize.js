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

/**
 * Function to simplify skipping code if ChunkMessage is not activated
 * 
 * @param {NetworkMessage} networkMessage - The NetworkMessage to check the ChunkMessage flag on
 * @param {boolean} suppressSkippedMessage - (Optional) Set to suppress the skipped message (default=FALSE)
 *
 * @returns {boolean} Returns true if ExtendedFlags2.ChunkMessage flag is set to 1, false if set to 0 or not defined.
 */
function checkChunkMessageFlag( networkMessage, suppressSkippedMessage ) {
    if( !isDefined( networkMessage ) ) throw( "checkChunkMessageFlag(): NetworkMessage not defined" );
    if( !isDefined( networkMessage.PubSubDataSetReaderObject ) ) throw( "checkChunkMessageFlag(): Provided argument appears to be no NetworkMessage" );
    if( !isDefined( suppressSkippedMessage ) ) var suppressSkippedMessage = false;
    if( isDefined( networkMessage.NetworkMessageHeader.ExtendedFlags2.ChunkMessage ) && 
        networkMessage.NetworkMessageHeader.ExtendedFlags2.ChunkMessage == 1 ) return( true );
    if( !suppressSkippedMessage ) addSkipped( "Received NetworkMessage is no chunked message (Chunk Message flag is not set)." );
    return( false );
}