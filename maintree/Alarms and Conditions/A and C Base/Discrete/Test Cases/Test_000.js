/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Discrete/Test Cases/Test_001.js
        Test is shared by Discrete/OffNormal/SystemOffNormal Conformance Units

    Description:    
        1	Walk through the address space checking the type definition of the conformance unit type.
        2	Walk through the address space looking for Instances of conformance unit type and verify they comply to the type definition.

    Expectation:
        1   The type definition matches the UA Specifications (Part 9, Table 56), including the presense of the 'NormalState' property.
        2   For any instance found, the Instances are typed correctly.

    How this test works:
*/

function Test_000() {

    if ( !isDefined( CUVariables.AlarmTypeString ) ) {
        throw ( "Invalid Test Setup" );
    }

    var compareSubTypes = false;

    var typeCheck = CUVariables.AlarmTester.CompareTypeTest( 
        CUVariables.AlarmTypeString,
        compareSubTypes );

    var instanceCheck = CUVariables.AlarmTester.CompareInstanceTest(
        CUVariables.AlarmTypeString );

    return typeCheck && instanceCheck;
}

Test.Execute( { Procedure: Test_000 } );