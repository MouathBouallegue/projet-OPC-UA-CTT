include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );

include( "./library/Base/assertions.js" );
include( "./library/ServiceBased/Helpers.js" );

const CUNAME = "Address Space UserWriteAccess";

    if( !Test.Connect() ) {
        addError( "Unable to connect to the Server. Check settings." );
        stopCurrentUnit();
    }

print( "****** CONFORMANCE UNIT '" + CUNAME + "' TESTING BEGINS ******" );
