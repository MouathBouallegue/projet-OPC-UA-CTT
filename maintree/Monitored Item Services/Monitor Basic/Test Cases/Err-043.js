/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Call ModifyMonitoredItems for a MonitoredItem in a subscription which was already created in another session.
    Expectation: SeviceResult: BadSubscriptionIdInvalid. The parameter of the MonitoredItem did not change.
*/

function MonitorBasicErr043() {

    var result = true;
    var testItem = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: true } )[0];
    
    if( testItem === null || testItem === undefined ) {
        addSkipped( "No writable test item defined. Skipping test." );
        return( false );
    }
    
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: testItem, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription } ) ) {
        // now open the second session
        var newSessionCreator = SessionCreator.Connect();
        if( newSessionCreator.result ) {
            testItem.SamplingInterval = MonitorBasicSubscription.PublishingInterval * 2;
            if ( !ModifyMonitoredItemsHelper.Execute( { SubscriptionId: MonitorBasicSubscription, ItemsToModify: testItem, ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) } ) ) result = false;
        }
        SessionCreator.Disconnect( newSessionCreator );
        InstanciateHelpers( { Session: Test.Session } );
        // call Publish(), as we want to consume the initial data values 
        PublishHelper.Execute();
        if ( !Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a DataChangeNotification beacause we just wrote a value to the MonitoredItem." ) ) result = false;
        PublishHelper.SetItemValuesFromDataChange( [testItem] );
        UaVariant.Increment( { Item: testItem } );
        WriteHelper.Execute( { NodesToWrite: testItem, ReadVerification: false } );
        PublishHelper.WaitInterval( { Subscription: MonitorBasicSubscription } );
        PublishHelper.Execute();
        if( !Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a DataChangeNotification beacause we just wrote a value to the MonitoredItem." ) );
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: testItem, SubscriptionId: MonitorBasicSubscription } );
    }
    else {
        addError( "CreateMonitoredItems failed. Abort test." );
        result = false;
    }
    return ( result );
}

Test.Execute( { Procedure: MonitorBasicErr043 } );
