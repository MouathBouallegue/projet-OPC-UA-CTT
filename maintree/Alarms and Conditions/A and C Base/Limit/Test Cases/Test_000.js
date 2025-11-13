/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Level/Test Cases/Test_000.js
        Test is shared by Exclusive/NonExclusive Limit/Level Conformance Units

    Description:    
        Walk through the address space checking the type definition of Desired Alarm Type.
        Walk through the address space looking for Instances of Desired Alarm Type types and verify they comply to the type definition.

    Expectation:
        The type definition matches the UA Specifications.
        Instances are typed correctly, if they exist

       
*/

function Test_000 ( ) {

    var limitHelper = CUVariables.LimitHelper;

    var compareSubTypes = false;
    var typeCheck = CUVariables.AlarmTester.CompareTypeTest( 
        limitHelper.AlarmTypeString,
        compareSubTypes );

    var instanceCheck = CUVariables.AlarmTester.CompareInstanceTest(
        limitHelper.AlarmTypeString );

    return typeCheck && instanceCheck;
}

Test.Execute( { Procedure: Test_000 } );
