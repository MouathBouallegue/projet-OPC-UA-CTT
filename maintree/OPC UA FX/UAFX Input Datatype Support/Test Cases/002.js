/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the product is capable of supporting the datatypes Boolean,
                 Sbyte, Int16, UInt16, Int32, UInt32 and Float as input data
         Step 1: Browse the InputData folder of existing FunctionalEntities
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse the InputData folder of existing FunctionalEntities
    for( var f=0; f<CU_Variables.AllFunctionalEntities.length; f++ ) {
        if( isDefined( CU_Variables.AllFunctionalEntities[f].InputData ) ) {
            var inputDataVariables = GetInputDataVariables( { InputDataFolder: CU_Variables.AllFunctionalEntities[f].InputData } );
            for( var i=0; i<inputDataVariables.length; i++ ) {
                var dataType = GetDataTypeOfNodeByNodeId( inputDataVariables[i].NodeId );
                var valueRank = GetValueRankOfNodeByNodeId( inputDataVariables[i].NodeId );
                for( var n=0; n<CU_Variables.InputNodeOfTypeExists.length; n++ ) {
                    if( !CU_Variables.InputNodeOfTypeExists[n] && CU_Variables.RequiredDataTypes[n].equals( dataType ) && valueRank == -1 ) {
                        CU_Variables.InputNodeOfTypeExists[n] = true;
                        CU_Variables.InputNodeOfTypeFoundNode[n] = inputDataVariables[i].NodeId.clone();
                        CU_Variables.InputNodeOfType_FE[n] = CU_Variables.AllFunctionalEntities[f];
                        addLog( "Found InputData variable '" + inputDataVariables[i].NodeId + "' for type '" + Identifier.toString( CU_Variables.RequiredDataTypes[n] ) + "' in FE '" + CU_Variables.AllFunctionalEntities[f].NodeId + "'" );
                    }
                }
            }
            if( !ArrayContains( CU_Variables.InputNodeOfTypeExists, false ) ) break;
        }
    }
    
    // Print missing DataTypes
    for( var n=0; n<CU_Variables.InputNodeOfTypeExists.length; n++ ) {
        if( !Assert.True( CU_Variables.InputNodeOfTypeExists[n], "Could not find an InputData variable of type '" + Identifier.toString( CU_Variables.RequiredDataTypes[n] ) + "' in the AddressSpace" ) ) TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );