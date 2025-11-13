/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Level/Test Cases/Test_005.js
        Test is shared by Exclusive/NonExclusive Limit/Level Conformance Units

    Description:   
        Ensure that a filter can be created that restrict to only receive event that are of Low state.
    
    Test Requirements:
        If Low alarms are supported.

    Expectation:
        Server accepts the subscription/monitoring request and returns the correct events
       
*/

include( "./maintree/Alarms And Conditions/A and C Base/Limit/Test Cases/filtertest.js" );

function Test_005 ( args ) {

    var filterTester = new FilterTest( {
        TestName: "Test_005",
        FilterToTest: "Low",
        LimitHelper: CUVariables.LimitHelper
    } );
        
    return filterTester.RunTest();
}

Test.Execute( { Procedure: Test_005 } );
