/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Create two sessions with a valid configuration for events. 
        Then call ConditionRefresh2 in the first Session specifying 
        the SubscriptionId from the first session and MonitoredItemId 
        from the second Session.

    Requirements: 
        Server must support 2 or more sessions.
    
    Expectation:
        Server is declining the request
        BadMonitoredItemIdInvalid
*/

function Err_007 () {

    var success = false;

    var extraAlarmThread = new AlarmThread();
    extraAlarmThread.Start( {
        EventNodeId: new UaNodeId( Identifier.Server ),
        SelectFields: CUVariables.AlarmThreadHolder.SelectFields
    } );

    if ( !extraAlarmThread.ItemCreated ) {
        addError( "Unable to create second thread" );
        stopCurrentUnit();
        return false;
    }

    extraAlarmThread.StartPublish();

    wait( 500 );
    var callHelper = CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;

    var result = CUVariables.Refresh.CallRefreshDetails( CUVariables, callHelper, 
        CUVariables.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId, 
        extraAlarmThread.EventMonitoredItem.MonitoredItemId );

    extraAlarmThread.End();
    
    if ( result.StatusCode == StatusCode.BadMonitoredItemIdInvalid ){
        success = true;
    }else{
        addError( "Invalid response, expecting BadMonitoredItemIdInvalid, received " + result.toString() );
    }
    
    return success;
}

Test.Execute( { Procedure: Err_007 } );

