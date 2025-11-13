/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse Assets folder for Assets that include a reference to a Connector of ClampBlockType
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // Run test for all AutomationComponents found in AddressSpace
    if( CU_Variables.Test.AutomationComponents.length > 0 ) {
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            addLog( "=== Start of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
            
            TC_Variables.connectorOfClampBlockTypeFound = false;
            
            // Browse Assets folder for Assets that include a reference to a Connector where the Connector is of ClampBlockType
            if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets ) ) {
                
                if( CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets.length > 0 ) {
                    // iterate through assets
                    for( var i=0; i < CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets.length; i++ ) {
                        
                        if( isDefined( CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].Connectors ) ) {
                            
                            // iterate through every reference of the Connectors folder
                            var connectorsFolderReferenceDescriptions = CU_Variables.Test.AutomationComponents[ac].Assets.AllTopLevelAssets[i].Connectors.References.ReferenceDescriptions;
                            for( var i=0; i < connectorsFolderReferenceDescriptions.length; i++ ) {
                                // if node is of ClampBlockType or subtype
                                if( 
                                    isDefined( CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType ) &&
                                    isNodeOfTypeOrSubType( 
                                        new MonitoredItem( connectorsFolderReferenceDescriptions[i].NodeId.NodeId ),
                                        CU_Variables.Test.BaseObjectType.AssetConnectorType.ClampBlockType
                                    )
                                ) {
                                    TC_Variables.connectorOfClampBlockTypeFound = true;
                                    break;
                                }
                            }
                            
                        }
                        // do not check further Assets if a Connector of ClampBlockType was found
                        if( TC_Variables.connectorOfClampBlockTypeFound ) break;
                        
                    }
                    
                    if( !TC_Variables.connectorOfClampBlockTypeFound ) { addError( "No Asset with a Connector of ClampBlockType found." ); TC_Variables.result = false; }
                    
                }
                else {
                    addError( "No Assets found in the Assets folder of the configured AutomationComponentInstance. Aborting test." );
                    TC_Variables.result = false;
                }
                
            }
            else {
                addError( "'Assets' folder is not available in the configured AutomationComponentInstance. Aborting test." );
                TC_Variables.result = false;
            }
            
            addLog( "=== End of test for AutomationComponent '" + CU_Variables.Test.AutomationComponents[ac].NodeId + "' ===" );
        }
    }
    else {
        addSkipped( "No AutomationComponent found in AddressSpace. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: test } );