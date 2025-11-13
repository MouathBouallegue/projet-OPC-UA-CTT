/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description: 
        For conditions that are Active, change the Quality of a condition 
        such as disconnecting from the alarm source (e.g. PLC etc.)
    
    Expectation:
        A ConditionType event notification is received.

    How this test works:
        It is expected that this test cases will require manual interaction 
        - somone has to trigger the PLC/datasource disconnection - 
        
*/

function Test_004() {

    notImplemented( "This is a manual test case and requires to disconnect the DataSource" );
    return true;
}

Test.Execute( { Procedure: Test_004 } );




