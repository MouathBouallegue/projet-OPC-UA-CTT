/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Create two sessions with a valid configuration for events. 
        Then call ConditionRefresh2 in the first Session specifying 
        the SubscriptionId and MonitoredItemId from the second Session.

    Requirements: 
        Server must support 2 or more sessions.
    
    Expectation:
        Server is declining the request
        BadUserAccessDenied
        BadSubscriptionInvalid
*/

function Err_006 () {

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
        extraAlarmThread.Subscription.SubscriptionId, 
        extraAlarmThread.EventMonitoredItem.MonitoredItemId );

    extraAlarmThread.End();
    
    if ( result.StatusCode == StatusCode.BadSubscriptionIdInvalid || 
        result.StatusCode == StatusCode.BadUserAccessDenied ){
        success = true;
    }else{
        addError( "Invalid response, expecting BadSubscriptionIdInvalid or BadUserAccessDenied, received " + result.toString() );
    }
    
    return success;
}

Test.Execute( { Procedure: Err_006 } );

