include( "./library/Base/safeInvoke.js" );
include( "./library/Information/_Base/NodeContainsSubStructure.js" );

/* This conformance unit is a little scary because it is trying to break the server by pushing it to its limits.
   In testing, this has caused bad behavior from Servers that become non-response.
   Therefore, in this conformance unit each test will execute within its own connection/channel */

const MAX_ALLOWED_SIZE = 10000;    // a fail-safe to use if a server claims to support more operations than this

function connect() {
    if( !Test.Connect() ) {
        addError( "Unable to connect to Server. Check settings." );
        stopCurrentUnit();
        return( false );
    }
    else return( true );
}

function resetConnection() {
    Test.Disconnect();
    return connect();
}

if( connect() ) {
    Test.PostTestFunctions.push( resetConnection );
}