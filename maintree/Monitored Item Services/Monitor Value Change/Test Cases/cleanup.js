print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Value Change' TEST SCRIPTS COMPLETE ******\n" );

if( isDefined( MonitorBasicSubscription ) ){
    PublishHelper.UnregisterSubscription( MonitorBasicSubscription );
    if( isDefined( DeleteSubscriptionsHelper ) ) {
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: MonitorBasicSubscription } );
        revertOriginalValuesScalarStatic();
        revertOriginalValuesArrayStatic();
    }
}
Test.Disconnect();
Test.PostTestFunctions = [];


print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Value Change' TESTING COMPLETE ******\n" );