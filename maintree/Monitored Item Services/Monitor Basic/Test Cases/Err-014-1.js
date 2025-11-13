/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Create a MonitoredItem using a StringArray while specifying invalid IndexRange as being outside of the bounds of the array.
        Expected Results: ServiceResult = Good. Operation level result = Bad_IndexRangeNoData */

function createMonitoredItems591Err028() {
    var iString = UaNodeId.fromString( Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.String );
    if( iString == null ) {
        addSkipped( "String Array nodeId is not configured in Static > AllProfiles > Arrays. Skipping test." );
        return( false );
    }
    var monitoredItems = MonitoredItem.fromNodeIds( [ iString ], 
        Attribute.Value, "99995:99999", MonitoringMode.Reporting, true, null, 1, 1000, TimestampsToReturn.Both );
    if( !isDefined( monitoredItems ) || monitoredItems.length < 1 ) { addError( "Test aborted because the monitoredItems are not correctly configured." ); return( false ); }
    if( !MonitorBasicSubscription.SubscriptionCreated ) {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return( false );
    }

    // we expect the call to fail, Bad_IndexRangeInvalid
    var expectedResults = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeNoData );
    // however, we acknowledge that the calls may succeed too:
    expectedResults.addExpectedResult( StatusCode.Good );
    // go ahead and create the monitoredItems and then wait
    CreateMonitoredItemsHelper.Execute( { ItemsToCreate: monitoredItems, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription,  OperationResults: expectedResults } );
    
    PublishHelper.WaitInterval( { Items: monitoredItems, Subscription: MonitorBasicSubscription } );
    // call Publish() if applicable... if GOOD then publish, otherwise skip publish
    if( createMonItemsResp.Results[0].StatusCode.isGood() ) {
        if( PublishHelper.Execute( { FirstPublish: true } ) ) {
            if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange notification." ) ) {
                var receivedCode = PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.StatusCode.StatusCode;
                if( receivedCode === StatusCode.Good || receivedCode === StatusCode.BadIndexRangeNoData ) {
                    addLog( "Received expected StatusCode in PublishResponse dataChange notification message: " + receivedCode );
                }
                else {
                    addError( "Expected to receive StatusCode Good or Bad_IndexRangeNoData in PublishResponse, but received: " + receivedCode );
                }
            }
        }
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItems, SubscriptionId: MonitorBasicSubscription } );
    }
    else {
        addLog( "Skipping Publish call since Server did not create the monitored item." );
    }
    return( true );
}

Test.Execute( { Procedure: createMonitoredItems591Err028 } );