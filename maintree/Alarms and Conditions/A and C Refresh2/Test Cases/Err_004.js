/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Specify a valid SubscriptionId but specify an invalid MonitoredItemId.

    
    Expectation:
        Invocation fails.
        BadMonitoredItemIdInvalid
*/

function Err_004 () {

    var success = false;
    var callHelper = CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;

    var result = CUVariables.Refresh.CallRefreshDetails( CUVariables, callHelper, 
        CUVariables.AlarmThreadHolder.AlarmThread.Subscription.SubscriptionId, 
        0 );
    
    if ( result.StatusCode == StatusCode.BadMonitoredItemIdInvalid ){
        success = true;
    }else{
        addError( "Invalid response, expecting BadMonitoredItemIdInvalid, received " + result.toString() );
    }
            
    return success;
}

Test.Execute( { Procedure: Err_004 } );
