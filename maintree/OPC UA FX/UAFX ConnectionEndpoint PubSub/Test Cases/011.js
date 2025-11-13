/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify for Unidirectional Connections with Heartbeat that either no InputVariables
                  or no OutputVariables exist.
    Requirements: - Mode PublisherSubscriber is supported.
                  - Pre-configured PubSubConnectionEndpoint exists or PubSubConnectionEndpoint
                    was created by EstablishConnections Method.
          Step 1: Browse any instance of PubSubConnectionEndpointType.
          Step 2: Read Attribute Value of variable InputVariables.
          Step 3: Read Attribute Value of variable OutputVariables.
          Step 4: Repeat previous Steps for every existing PubSubConnectionEndpoint of the
                  AutomationComponent.
*/

function Test_011() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // Find a ConnectionEndpoint for this test
    var TestConnectionEndpoints = FindOrCreateFittingConnectionEndpoints( {
        FunctionalEntities: CU_Variables.AllFunctionalEntities,
        FEHasData: FEHasDataEnum.InputXorOutput,
        Mode: PubSubConnectionEndpointModeEnum.PublisherSubscriber
    } );
    
    // Step 1: Browse any instance of PubSubConnectionEndpointType
    if( TestConnectionEndpoints.length > 0 ) {
        // Step 4: Repeat previous Steps for every existing PubSubConnectionEndpoint of the AutomationComponent.
        for( var i=0; i<TestConnectionEndpoints.length; i++ ) {
            TestConnectionEndpoint_mI = new MonitoredItem( TestConnectionEndpoints[i].ConnectionEndpointId );
            SetAllChildren_recursive( TestConnectionEndpoint_mI );
            // check if ConnectionEndpoint is unidirectional
            var variables = GetConnectionEnpointVariables( TestConnectionEndpoint_mI );
            if( ( variables.InputVariables.length == 0 && variables.OutputVariables.length > 0 ) || ( variables.InputVariables.length > 0 && variables.OutputVariables.length == 0 ) ) {
                addLog( "Testing unidirectional PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "':" );
                if( isDefined( TestConnectionEndpoint_mI.Mode ) ) {
                    if( ReadHelper.Execute( { NodesToRead: TestConnectionEndpoint_mI.Mode } ) ) {
                        var mode = TestConnectionEndpoint_mI.Mode.Value.Value.toInt32();
                        if( mode == 1 ) { // PublisherSubscriber(1)
                            TC_Variables.nothingTested = false;
                            // Step 2: Read Attribute Value of variable InputVariables.
                            // Step 3: Read Attribute Value of variable OutputVariables.
                            var variables = GetConnectionEnpointVariables( TestConnectionEndpoint_mI );
                            if( variables.InputVariables.length > 0 ) {
                                if( !Assert.Equal( 0, variables.OutputVariables.length, "Unexpected length of OutputVariables. As InputVariables are referenced, OutputVariables shall not be referenced." ) ) TC_Variables.Result = false;
                            }
                            else {
                                if( !Assert.GreaterThan( 0, variables.OutputVariables.length, "Unexpected length of OutputVariables. As InputVariables are not referenced, at least one OutputVariable shall be referenced." ) ) TC_Variables.Result = false;
                            }
                        }
                        else addLog( "Mode of PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "' is not 'PublisherSubscriber'. Skipping node." );
                    }
                }
                else {
                    addError( "PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "' does not expose mandatory variable 'Mode'. Skipping node." );
                    TC_Variables.Result = false;
                }
            }
            else addLog( "PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "' is not unidirectional. Skipping node." );
            
            // Cleanup created connection endpoint and PubSubConfig
            cleanupConnectionEndpoint( TestConnectionEndpoints[i] );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No unidirectional PubSubConnectionEndpoint with Mode 'PublisherSubscriber' found in server. Skipping test." );
            TC_Variables.Result = false;
        }
        TestConnectionEndpoints = null;
    }
    else {
        addSkipped( "Could not find a FunctionalEntity exposing InputData or OutputData variables only and/or failed to create the ConnectionEndpoint. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_011 } );