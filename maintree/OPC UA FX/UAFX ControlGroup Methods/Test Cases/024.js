/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse all ControlGroupType instances and verify that Nodes exposed in ListOfRelated
                 are not exposed in ListToRestrict and ListToBlock.
*/

function Test_024() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            var ListOfRelated_Children = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListOfRelated );
            var ListToRestrict_Children = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListToRestrict );
            var ListToBlock_Children = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListToBlock );
            
            if( ListOfRelated_Children.length == 0 ) {
                addLog( "No Variables/Methods available in ListOfRelated of the ControlGroup '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "'. Skipping node." );
                continue;
            }
            // check if no element of ListOfRelated is shared with ListToRestrict and ListToBlock
            for( var c=0; c<ListOfRelated_Children.length; c++ ) {
                // ListToRestrict
                for( var r=0; r<ListToRestrict_Children.length; r++ ) {
                    if( ListOfRelated_Children[c].NodeId.equals( ListToRestrict_Children[r].NodeId ) ) {
                        addError( "ListOfRelated and ListToRestrict folders of ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' share node '" + ListOfRelated_Children[c].NodeId + "'." );
                        TC_Variables.Result = false;
                    }
                }
                // ListToBlock
                for( var b=0; b<ListToBlock_Children.length; b++ ) {
                    if( ListOfRelated_Children[c].NodeId.equals( ListToBlock_Children[b].NodeId ) ) {
                        addError( "ListOfRelated and ListToBlock folders of ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' share node '" + ListOfRelated_Children[c].NodeId + "'." );
                        TC_Variables.Result = false;
                    }
                }
            }
            TC_Variables.nothingTested = false;
            if( !TC_Variables.Result ) break;
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No ControlGroupType instance has elements in the ListOfRelated folder. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_024 } );