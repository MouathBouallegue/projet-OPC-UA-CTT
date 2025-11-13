/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_000.js

    Description:    
        1	Walk through the address space checking the type definition of OneShotShelve, 
        TimedShelve, and Unshelve methods. Also check the statemachine in the type system.
        2   Check if MaxTimeShelved is defined correctly in the type system

   
    Expectation:
        1   Method signatures match the specifications and the statemachine definition is correct
        2   The MaxTimeShelved property exist in the type

        
    How this test works:
        Retrieve the object model from the server, search for all alarm types,
        then verify the AlarmConditionType against the Spec
*/

function Test_000 () {

    var compareSubTypes = false;
    return CUVariables.AlarmTester.CompareTypeTest( CUVariables.Shelve.AlarmConditionTypeString,
        compareSubTypes );
}

Test.Execute( { Procedure: Test_000 } );
