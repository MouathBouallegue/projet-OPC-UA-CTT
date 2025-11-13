/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Create a valid Subscription to monitor Events subscribing to events of the Server Object 
        and call ConditionRefresh2 to verify everything is working fine. Then 
        invoke ConditionRefresh2 again and specify an invalid SubscriptionId.

    
    Expectation:
        2nd Invocation fails.
        BadSubscriptionIdInvalid
*/

function Err_002 () {

    var success = false;
    var callHelper = CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;

    var result = CUVariables.Refresh.CallRefreshDetails( CUVariables, callHelper, 
        CUVariables.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId, 
        CUVariables.AlarmThreadHolder.AlarmThread.EventMonitoredItem.MonitoredItemId  );
    
    if ( result.isGood() ){
        wait( 1000 );
        result = CUVariables.Refresh.CallRefreshDetails( CUVariables, callHelper, 
            12345, CUVariables.AlarmThreadHolder.AlarmThread.EventMonitoredItem.ClientHandle );
        if ( result.StatusCode == StatusCode.BadSubscriptionIdInvalid ){
            success = true;
        }else{
            addError( "Invalid response, expecting BadSubscriptionIdInvalid, received " + result.toString() );
        }
            
    }else{
        addError("First call to refresh should succeed, was " + result.toString() ); 
    }
    
    return success;
}

Test.Execute( { Procedure: Err_002 } );
