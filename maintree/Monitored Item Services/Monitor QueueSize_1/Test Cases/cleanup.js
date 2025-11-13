print( "\n\n\n***** CONFORMANCE UNIT 'Monitor QueueSize 01' TEST SCRIPTS COMPLETE ******\n" );

Test.PreTestFunctions = [];
DeleteSubscriptionsHelper.Execute( { SubscriptionIds: MonitorQueueSize1Subscription } );
Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor QueueSize 01' TESTING COMPLETE ******\n" );