/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the AggregatedHealthDataType exists in the Types Folder.
         Step 1: Browse the VariableTypes Folder. 
         Step 2: Browse the AggregatedHealthDataType.
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse the VariableTypes Folder
    if( isDefined( CU_Variables.Test.Structure.AggregatedHealthDataType.NodeId ) ) {
        // Step 2: Browse the AggregatedHealthDataType
        TC_Variables.result = VerifyElementsOfNode( { 
            Node: CU_Variables.Test.Structure.AggregatedHealthDataType,
            Elements: []
        } );
    }
    else {
        addError( "'AggregatedHealthDataType' not found in ObjectTypes folder" );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );