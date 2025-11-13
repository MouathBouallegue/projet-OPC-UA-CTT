/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Check the object type definition exists in the Type system (address space) 
        and that it complies with the official definition (check the specification).
    
    Expectation:
        All references, properties, methods, and sub-types match the definition. 
        All mandatory items exist and are correct. 
        All optional items are checked for compliance ONLY IF they exist.

    How this test works:
        1. AlarmTester is auto initialized to read all the alarm types in the server by reading the address space
        2. Compare the Server ConditionType to the definition in Opc.Ua.NodeSet2.Part9.xml
*/

function Test_001() {

    var conditionTypeNodeIdString = new UaNodeId( Identifier.ConditionType ).toString();
    var compareSubTypes = true;

    CUVariables.AlarmTester.CompareTypeTest( conditionTypeNodeIdString,
        compareSubTypes );

    return ( true );
}

Test.Execute( { Procedure: Test_001 } );