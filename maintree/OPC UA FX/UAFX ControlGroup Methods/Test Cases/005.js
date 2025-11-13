/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that only nodes of NodeClass Variable or Method are exposed by instances
                 of ControlItemFolderType. 
         Step 1: Browse the Folder ListToBlock of any Instance of the ControlGroupType.
         Step 2: Browse the Folder ListToRestrict of any Instance of the ControlGroupType.
         Step 3: Repeat previous steps for all instances of ControlGroupType exposed by the
                 FunctionalEntities.
*/

function Test_005() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // Step 3: Repeat previous steps for all instances of ControlGroupType exposed by the
    //         FunctionalEntities.
    for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
        // Step 1: Browse the Folder ListToBlock of any Instance of the ControlGroupType.
        // Step 2: Browse the Folder ListToRestrict of any Instance of the ControlGroupType.
        var foldersToTest = [ "ListToBlock", "ListToRestrict" ];
        for( var f=0; f<foldersToTest.length; f++ ) {
            if( isDefined( CU_Variables.ControlGroupType_Instances[i][foldersToTest[f]] ) ) {
                var childVariables = GetChildNodes( CU_Variables.ControlGroupType_Instances[i][foldersToTest[f]] );
                // set AttributeIds to NodeClass and splice out 'Lock' object
                for( var s=0; s<childVariables.length; s++ ) {
                    childVariables[s].AttributeId = Attribute.NodeClass;
                    if( childVariables[s].BrowseName.Name == "Lock" ) { childVariables.splice( s, 1 ); s--; }
                }
                if( childVariables.length > 0 ) {
                    TC_Variables.nothingTested = false;
                    if( ReadHelper.Execute( { NodesToRead: childVariables } ) ) {
                        for( var s=0; s<childVariables.length; s++ ) {
                            var nodeClass = childVariables[s].Value.Value.toInt32();
                            if( nodeClass != NodeClass.Variable && nodeClass != NodeClass.Method ) {
                                addError( "NodeClass attribute of node '" + childVariables[s].NodeId + "' is neither Variable nor Method" );
                                TC_Variables.Result = false;
                            }
                        }
                    }
                    else TC_Variables.Result = false;
                }
                else addLog( [foldersToTest[f]] + " folder of node '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' does not contain any nodes other than 'Lock'. Skipping node." )
            }
            else {
                addError( "Mandatory node '" + [foldersToTest[f]] + "' not found on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'" );
                TC_Variables.Result = false;
            }
        }
    }
    
    if( TC_Variables.nothingTested ) {
        addSkipped( "No ControlGroupType instances with variables/methods in ListToBlock/ListToRestrict folder found in server." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );