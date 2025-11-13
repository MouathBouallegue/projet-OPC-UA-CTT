print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Basic' TEST SCRIPTS COMPLETE ******\n" );

// disconnect from server
if ( isDefined( PublishHelper ) ) PublishHelper.Clear();
subSessionThread.End();
Test.Disconnect();
Test.PostTestFunctions = [];

print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Basic' TESTING COMPLETE ******\n" );