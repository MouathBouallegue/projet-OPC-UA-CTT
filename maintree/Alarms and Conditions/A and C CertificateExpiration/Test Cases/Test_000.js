/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Walk through the address space checking the type definition of 
            CertificateExpirationAlarmType type.
    
    Expectation:
        1   The type definition matches the UA Specifications (Part 9, Table 58), including the presense of the 'NormalState' property.

    How this test works:
    Compare 
*/

function Test_000() {

    var compareSubTypes = false;
    
    return CUVariables.AlarmTester.CompareTypeTest( 
        CUVariables.CertificateExpiration.NodeIdString,
        compareSubTypes );
}

Test.Execute( { Procedure: Test_000 } );