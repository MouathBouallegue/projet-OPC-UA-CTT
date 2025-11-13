include( "./library/ServiceBased/Helpers.js" );

// Connect to the server
if( ! Test.Connect() ) {
    addError( "Unable to connect and establish a session");
    stopCurrentUnit();
}
else {
    print( "\n\n\n***** CONFORMANCE UNIT 'Address Space Method' TESTING BEGINS ******\n" );
} //activateSession