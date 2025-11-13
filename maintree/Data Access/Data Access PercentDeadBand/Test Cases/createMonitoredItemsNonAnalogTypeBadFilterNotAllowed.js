/*  Test prepared by Kevin Herron: kevin@inductiveautomation.ocm
    Description:
        Create a monitoredItem of non Analog type (a node that does not have an
        EURange property), and specify a PercentDeadband of 10%.
    Expected results:
        ServiceLevel: “Good”.
        OperationLevel: Bad_FilterNotAllowed */

function createMonitoredItemErr612003()
{
    const DEADBANDVALUE = 10;

    var item = MonitoredItem.fromSetting("/Server Test/NodeIds/Static/All Profiles/Scalar/Bool");
    if (item === undefined || item === null) MonitoredItem.fromSetting("/Server Test/NodeIds/Static/All Profiles/Scalar/String");
    if (item === undefined || item === null )
    {
        addSkipped( "No analog values without EURange property available for testing." );
        return( false );
    }

    // Set the filter to PercentDeadband
    item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBANDVALUE, DataChangeTrigger.StatusValue );

    // create the monitored items, which we expect to fail
    var expectedResult = [ new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed ) ];
    expectedResult[0].addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported );
    CreateMonitoredItemsHelper.Execute( { 
                ItemsToCreate: item, 
                TimestampsToReturn: TimestampsToReturn.Both,
                SubscriptionId: MonitorBasicSubscription,
                OperationResults: expectedResult
                } );

    // delete the monitored items, which should fail.
    expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
    DeleteMonitoredItemsHelper.Execute( { 
            ItemsToDelete: item, 
            SubscriptionId: MonitorBasicSubscription, 
            ServiceResult: expectedResult } );

    PublishHelper.Clear();
    return( true );
}

Test.Execute( { Procedure: createMonitoredItemErr612003 } );