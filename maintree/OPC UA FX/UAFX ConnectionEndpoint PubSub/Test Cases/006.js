/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify for a Unidirectional Connection that a ToDataSetReader reference
                  exists and a ToDataSetWriter reference is not set.
    Requirements: - Mode Subscriber is supported.
                  - Pre-configured PubSub ConnectionEndpoint exists or PubSubConnectionEndpoint 
                    was created by EstablishConnections Method.
                  - InputVariables exists.
                  - If PubSub configuration is not exposed, this test needs to be executed manually.
          Step 1: Browse for a FunctionalEntity supporting a PubSubConnectionEndpoint.
          Step 2: Read the Attribute Value of variable Mode.
          Step 3: Browse the PubSubConnectionEndpoint.
*/

function Test_006( connectionEndpoint ) {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    var suppressMessages = false;
    
    TC_Variables.PubSubConnectionEndpointType_Instances = [];
    
    // if this TC is executed by another one (TC 008) only check the passed ConnectionEndpoint and suppress messages
    if( isDefined( connectionEndpoint ) ) {
        TC_Variables.PubSubConnectionEndpointType_Instances = [ connectionEndpoint ];
        suppressMessages = true;
    }
    else {
        // Find a ConnectionEndpoint for this test
        var TestConnectionEndpoints = FindOrCreateFittingConnectionEndpoints( {
            FunctionalEntities: CU_Variables.AllFunctionalEntities,
            FEHasData: FEHasDataEnum.InputOnly,
            Mode: PubSubConnectionEndpointModeEnum.Subscriber
        } );
        if( TestConnectionEndpoints.length > 0 ) {
            TestConnectionEndpoint_mI = new MonitoredItem( TestConnectionEndpoints[0].ConnectionEndpointId );
            SetAllChildren_recursive( TestConnectionEndpoint_mI );
            TC_Variables.PubSubConnectionEndpointType_Instances = [ TestConnectionEndpoint_mI ];
        }
        else {
            if( !suppressMessages ) addSkipped( "Could not find a FunctionalEntity exposing only InputData variables or failed to create the ConnectionEndpoint. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    
    // Step 1: Browse for a FunctionalEntity supporting a PubSubConnectionEndpoint
    if( TC_Variables.PubSubConnectionEndpointType_Instances.length > 0 ) {
        for( var i=0; i<TC_Variables.PubSubConnectionEndpointType_Instances.length; i++ ) {
            // check if ConnectionEndpoint is unidirectional (has InputVariables only)
            var variables = GetConnectionEnpointVariables( TC_Variables.PubSubConnectionEndpointType_Instances[i] );
            if( variables.InputVariables.length > 0 && variables.OutputVariables.length == 0 ) {
                if( !suppressMessages ) addLog( "Testing unidirectional PubSubConnectionEndpoint '" + TC_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "':" );
                // Step 2: Read the Attribute Value of variable Mode
                if( isDefined( TC_Variables.PubSubConnectionEndpointType_Instances[i].Mode ) ) {
                    if( ReadHelper.Execute( { NodesToRead: TC_Variables.PubSubConnectionEndpointType_Instances[i].Mode } ) ) {
                        var mode = TC_Variables.PubSubConnectionEndpointType_Instances[i].Mode.Value.Value.toInt32();
                        if( mode == 3 ) { // Subscriber(3)
                            TC_Variables.nothingTested = false;
                            // Step 3: Browse the PubSubConnectionEndpoint
                            var ToDataSetReader_targets = GetChildNodesByReferenceTypeId( TC_Variables.PubSubConnectionEndpointType_Instances[i], CU_Variables.Test.NonHierarchicalReferences.ToDataSetReader.NodeId );
                            if( ToDataSetReader_targets.length > 0 ) {
                                if( !suppressMessages ) notImplemented( "Check if ToDataSetReader target node '" + ToDataSetReader_targets[0].NodeId + "' points to a non Null DataSet" );
                            }
                            else {
                                if( !suppressMessages ) addError( "No ToDataSetReader reference exists in PubSubConnectionEndpoint '" + TC_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "'." );
                                TC_Variables.Result = false;
                            }
                            var ToDataSetWriter_targets = GetChildNodesByReferenceTypeId( TC_Variables.PubSubConnectionEndpointType_Instances[i], CU_Variables.Test.NonHierarchicalReferences.ToDataSetWriter.NodeId );
                            if( ToDataSetWriter_targets.length > 0 ) {
                                if( !suppressMessages ) addError( "At least one ToDataSetWriter reference exists in PubSubConnectionEndpoint '" + TC_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "', which is not correct." );
                                TC_Variables.Result = false;
                            }
                        }
                        else if( !suppressMessages ) addError( "Mode of PubSubConnectionEndpoint '" + TC_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is not 'Subscriber'." );
                    }
                }
                else {
                    if( !suppressMessages ) addError( "PubSubConnectionEndpoint '" + TC_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' does not expose mandatory variable 'Mode'. Skipping node." );
                    TC_Variables.Result = false;
                }
            }
            else if( !suppressMessages ) addLog( "PubSubConnectionEndpoint '" + TC_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is not unidirectional (with InputVariables). Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            if( !suppressMessages ) addSkipped( "No unidirectional (has InputVariables) PubSubConnectionEndpoint with Mode 'Subscriber' found in server. Skipping test." );
            TC_Variables.Result = false;
        }
        // Cleanup created connection endpoint and PubSubConfig
        if( isDefined( TestConnectionEndpoints ) ) cleanupConnectionEndpoint( TestConnectionEndpoints[0] );
        TestConnectionEndpoints = null;
    }
    else {
        if( !suppressMessages ) addSkipped( "No preconfigured ConnectionEndpoints found in the server and failed to create one. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_006 } );