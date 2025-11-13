/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Level/Test Cases/Test_003.js
        Test is shared by Exclusive/NonExclusive Limit/Level Conformance Units

    Description:   
        Ensure that a filter can be created that restrict to only receive event that are of HighHigh state.
    
    Test Requirements:
        If HighHigh alarms are supported.

    Expectation:
        Server accepts the subscription/monitoring request and returns the correct events
       
*/

include( "./maintree/Alarms And Conditions/A and C Base/Limit/Test Cases/filtertest.js" );

function Test_003 ( args ) {

    var filterTester = new FilterTest( {
        TestName: "Test_003",
        FilterToTest: "HighHigh",
        LimitHelper: CUVariables.LimitHelper
    } );
        
    return filterTester.RunTest();
}

Test.Execute( { Procedure: Test_003 } );
