/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Err_001.js
        Test is shared between [ConditionRefresh][ConditionRefresh2]

    Description:    
        Specify an invalid SubscriptionId.

    Requirements
        No Subscription shall exist in the session
    
    Expectation:
        Invocation fails.
        BadSubscriptionIdInvalid
*/

function Err_001 () {

    var success = false;

    var callHelper = CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;
    
    var result = CUVariables.Refresh.CallRefreshDetails( CUVariables, callHelper, 12345, 
        CUVariables.AlarmThreadHolder.AlarmThread.EventMonitoredItem.ClientHandle  );
    
    if ( result.StatusCode == StatusCode.BadSubscriptionIdInvalid ){
        success = true;
    }else{
        addError( "Invalid response, expecting BadSubscriptionIdInvalid, received " + result.toString() );
    }
    
    return success;
}

Test.Execute( { Procedure: Err_001 } );

