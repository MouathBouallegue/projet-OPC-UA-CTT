/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the product is capable of supporting the datatypes Boolean,
                 Sbyte, Int16, UInt16, Int32, UInt32 and Float as output data
         Step 1: Browse the OutputData folder of existing FunctionalEntities
*/

function Test_004() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse the OutputData folder of existing FunctionalEntities
    for( var f=0; f<CU_Variables.AllFunctionalEntities.length; f++ ) {
        if( isDefined( CU_Variables.AllFunctionalEntities[f].OutputData ) ) {
            var outputDataVariables = GetOutputDataVariables( { OutputDataFolder: CU_Variables.AllFunctionalEntities[f].OutputData } );
            for( var i=0; i<outputDataVariables.length; i++ ) {
                var dataType = GetDataTypeOfNodeByNodeId( outputDataVariables[i].NodeId );
                var valueRank = GetValueRankOfNodeByNodeId( outputDataVariables[i].NodeId );
                for( var n=0; n<CU_Variables.OutputNodeOfTypeExists.length; n++ ) {
                    if( !CU_Variables.OutputNodeOfTypeExists[n] && CU_Variables.RequiredDataTypes[n].equals( dataType ) && valueRank == -1 ) {
                        CU_Variables.OutputNodeOfTypeExists[n] = true;
                        CU_Variables.OutputNodeOfTypeFoundNode[n] = outputDataVariables[i].NodeId.clone();
                        CU_Variables.OutputNodeOfType_FE[n] = CU_Variables.AllFunctionalEntities[f];
                        addLog( "Found OutputData variable '" + outputDataVariables[i].NodeId + "' for type '" + Identifier.toString( CU_Variables.RequiredDataTypes[n] ) + "' in FE '" + CU_Variables.AllFunctionalEntities[f].NodeId + "'" );
                    }
                }
            }
            if( !ArrayContains( CU_Variables.OutputNodeOfTypeExists, false ) ) break;
        }
    }
    
    // Print missing DataTypes
    for( var n=0; n<CU_Variables.OutputNodeOfTypeExists.length; n++ ) {
        if( !Assert.True( CU_Variables.OutputNodeOfTypeExists[n], "Could not find an OutputData variable of type '" + Identifier.toString( CU_Variables.RequiredDataTypes[n] ) + "' in the AddressSpace" ) ) TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_004 } );