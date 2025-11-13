include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX ControlGroup Methods";

CU_Variables.Test = new Object();

var ClientDescriptionWithSecondApplicationUri = new UaApplicationDescription();
ClientDescriptionWithSecondApplicationUri.ApplicationName.Locale = "en";    
ClientDescriptionWithSecondApplicationUri.ApplicationName.Text   = "OPC Unified Architecture Compliance Test Tool";
ClientDescriptionWithSecondApplicationUri.ApplicationType        = ApplicationType.Client;
ClientDescriptionWithSecondApplicationUri.ApplicationUri         = "urn:" + HostInfo.localHostName() +":OPCFoundation:UaComplianceTestTool" + "_SecondSession";
ClientDescriptionWithSecondApplicationUri.ProductUri             = "urn:OPCFoundation:UaComplianceTestTool"; 

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( !initializeStandardVariables( { TestObject: CU_Variables.Test } ) ) {
        addError( "Error while initializing. Aborting CU." );
        stopCurrentUnit();
    }
    else {
        // Find and initialize all instances of type 'ControlGroupType'
        if( isDefined( CU_Variables.Test.BaseObjectType.ControlGroupType.NodeId ) ) {
            CU_Variables.ControlGroupType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.ControlGroupType } );
        }
        else addError( "Type definition of 'ControlGroupType' not found in server, therefore no instances of this type can be browsed." );
        // Find and initialize all instances of type 'PubSubConnectionEndpointType'
        if( isDefined( CU_Variables.Test.BaseObjectType.ConnectionEndpointType.NodeId ) &&
            isDefined( CU_Variables.Test.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType.NodeId ) ) {
            CU_Variables.PubSubConnectionEndpointType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType } );
        }
        else addError( "Type definition of 'PubSubConnectionEndpointType' not found in server, therefore no instances of this type can be browsed." );
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );

function FindTwoControlGroupsWithSharedVariables() {
    var result = new Object();
    // Find 2 ControlGroups with shared variables
    for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
        var ListToBlock_Children_A = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListToBlock );
        var ListToRestrict_Children_A = GetChildNodes( CU_Variables.ControlGroupType_Instances[i].ListToRestrict );
        for( var j=0; j<CU_Variables.ControlGroupType_Instances.length; j++ ) {
            if( i == j ) continue;
            var ListToBlock_Children_B = GetChildNodes( CU_Variables.ControlGroupType_Instances[j].ListToBlock );
            var ListToRestrict_Children_B = GetChildNodes( CU_Variables.ControlGroupType_Instances[j].ListToRestrict );
            // check if shared variable exists in ListToBlock
            for( var a=0; a<ListToBlock_Children_A.length; a++ ) {
                for( var b=0; b<ListToBlock_Children_B.length; b++ ) {
                    if( ListToBlock_Children_A[a].BrowseName.Name != "MaxInactiveLockTime" && ListToBlock_Children_A[a].BrowseName.Name != "Lock" ) {
                        if( ListToBlock_Children_A[a].NodeId.equals( ListToBlock_Children_B[b].NodeId ) ) {
                            result.ControlGroupA = new MonitoredItem( CU_Variables.ControlGroupType_Instances[i].NodeId );
                            result.ControlGroupB = new MonitoredItem( CU_Variables.ControlGroupType_Instances[j].NodeId );
                            SetAllChildren_recursive( result.ControlGroupA );
                            SetAllChildren_recursive( result.ControlGroupB );
                            return( result );
                        }
                    }
                }
            }
            // check if shared variable exists in ListToRestrict
            for( var a=0; a<ListToRestrict_Children_A.length; a++ ) {
                for( var b=0; b<ListToRestrict_Children_B.length; b++ ) {
                    if( ListToRestrict_Children_A[a].BrowseName.Name != "MaxInactiveLockTime" && ListToRestrict_Children_A[a].BrowseName.Name != "Lock" ) {
                        if( ListToRestrict_Children_A[a].NodeId.equals( ListToRestrict_Children_B[b].NodeId ) ) {
                            result.ControlGroupA = new MonitoredItem( CU_Variables.ControlGroupType_Instances[i].NodeId );
                            result.ControlGroupB = new MonitoredItem( CU_Variables.ControlGroupType_Instances[j].NodeId );
                            SetAllChildren_recursive( result.ControlGroupA );
                            SetAllChildren_recursive( result.ControlGroupB );
                            return( result );
                        }
                    }
                }
            }
        }
    }
    return( false );
}