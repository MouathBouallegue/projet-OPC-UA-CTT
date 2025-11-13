/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Refresh/Test Cases/Err_003.js
        Test is not shared

    Description:    
        Create a valid Subscription to monitor Events. 
        Invoke ConditionRefresh again and specify an invalid SubscriptionId.

    
    Expectation:
        2nd Invocation fails.
        BadSubscriptionIdInvalid
*/

function Err_003 () {

    var success = false;

    var callHelper = CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;

    var result = CUVariables.Refresh.CallRefreshDetails( CUVariables, callHelper, 
        CUVariables.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId, 
        CUVariables.AlarmThreadHolder.AlarmThread.EventMonitoredItem.MonitoredItemId  );
    
    if ( result.isGood() ){
        wait( 1000 );
        result = CUVariables.Refresh.CallRefreshDetails( CUVariables, callHelper, 
            12345, CUVariables.AlarmThreadHolder.AlarmThread.EventMonitoredItem.MonitoredItemId );
        if ( result.StatusCode == StatusCode.BadSubscriptionIdInvalid ){
            success = true;
        }else{
            addError( "Invalid response, expecting BadSubscriptionIdInvalid, received " + result.toString() );
        }
            
    }else{
        addError("First call to refresh should succeed" ); 
    }
    
    return success;}

Test.Execute( { Procedure: Err_003 } );

