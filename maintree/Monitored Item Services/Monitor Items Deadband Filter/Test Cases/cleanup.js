print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Value Change' TEST SCRIPTS COMPLETE ******\n" );

if( isDefined( MonitorBasicSubscription ) ){
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: MonitorBasicSubscription } );
    revertOriginalValuesScalarStatic();
}
Test.Disconnect();

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Items Deadband Filter' TESTING COMPLETE ******\n" );