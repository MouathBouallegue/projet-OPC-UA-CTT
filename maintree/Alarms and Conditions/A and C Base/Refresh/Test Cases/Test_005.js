/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Test_005.js
        Test is shared between [ConditionRefresh][ConditionRefresh2]

    Description:    
        Verify the structure of a RefreshStopEventType event.

    Requirements: 
        This test will use a cached version of an event that should have been previously received.
    
    Expectation:
        The event should match

    How this test works:
        If there is no saved event, then this should trigger refresh to get a start/end event
*/

function Test_005 () {

    return CUVariables.Refresh.VerifySystemEvent( CUVariables, "Test_005", "EndEvent" );
}

Test.Execute( { Procedure: Test_005 } );
