/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that all InputVariables of the ConnectionEndpoint are available in
                  the SubscribedDataSet associated with the DataSetReader referenced by
                  the PubSubConnectionEndpoint.
    Requirements: - Mode PublisherSubscriber or Subscriber is supported.
                  - Pre-configured PubSub ConnectionEndpoint exists or PubSubConnectionEndpoint 
                    was created by EstablishConnections Method.
                  - PubSubConnectionEndpoint references InputVariables.
                  - If PubSub configuration is not exposed, this test needs to be executed manually.
          Step 1: Browse any instance of PubSubConnectionEndpointType.
          Step 2: Read the Attribute Value of the Variable InputVariables.
          Step 3: Browse the SubscribedDataSet associated with the DataSetReader referenced
                  by the PubSubConnectionEndpoint from Step 1.
          Step 4: Repeat previous Steps for every existing PubSubConnectionEndpoint of the
                  AutomationComponent.
*/

function Test_010() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // Find a ConnectionEndpoint for this test
    var TestConnectionEndpoints = FindOrCreateFittingConnectionEndpoints( {
        FunctionalEntities: CU_Variables.AllFunctionalEntities,
        FEHasData: FEHasDataEnum.HasInput,
        Mode: [ 
            PubSubConnectionEndpointModeEnum.PublisherSubscriber,
            PubSubConnectionEndpointModeEnum.Subscriber
        ]
    } );
    
    // Step 1: Browse any instance of PubSubConnectionEndpointType.
    if( TestConnectionEndpoints.length > 0 ) {
        // Step 4: Repeat previous Steps for every existing PubSubConnectionEndpoint of the AutomationComponent.
        for( var i=0; i<TestConnectionEndpoints.length; i++ ) {
            TestConnectionEndpoint_mI = new MonitoredItem( TestConnectionEndpoints[i].ConnectionEndpointId );
            SetAllChildren_recursive( TestConnectionEndpoint_mI );
            // Step 2: Read the Attribute Value of the Variable InputVariables.
            var variables = GetConnectionEnpointVariables( TestConnectionEndpoint_mI );
            if( variables.InputVariables.length > 0 ) {
                // Mode must be 'Subscriber' or 'PublisherSubscriber'
                if( isDefined( TestConnectionEndpoint_mI.Mode ) ) {
                    if( ReadHelper.Execute( { NodesToRead: TestConnectionEndpoint_mI.Mode } ) ) {
                        var mode = TestConnectionEndpoint_mI.Mode.Value.Value.toInt32();
                        if( mode == 1 || mode == 3 ) { // PublisherSubscriber(1) || Subscriber(3)
                            TC_Variables.nothingTested = false;
                            // Step 3: Browse the SubscribedDataSet associated with the DataSetReader referenced
                            //         by the PubSubConnectionEndpoint from Step 1.
                            addLog( "Testing PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "':" );
                            var ToDataSetReader_targets = GetChildNodesByReferenceTypeId( TestConnectionEndpoint_mI, CU_Variables.Test.NonHierarchicalReferences.ToDataSetReader.NodeId );
                            if( ToDataSetReader_targets.length > 0 ) {
                                for( var v=0; v<variables.InputVariables.length; v++ ) {
                                    notImplemented( "Check if targetVariable '" + variables.InputVariables[v] + "' exists in the SubscribedDataSet associated with the DataSetReader '" + ToDataSetReader_targets[0].NodeId + "'." );
                                }
                            }
                            else {
                                addError( "No ToDataSetReader reference exists in PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "'." );
                                TC_Variables.Result = false;
                            }
                        }
                        else addLog( "Mode of PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "' is not 'Subscriber' or 'PublisherSubscriber'. Skipping node." );
                    }
                }
                else {
                    addError( "PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "' does not expose mandatory variable 'Mode'. Skipping node." );
                    TC_Variables.Result = false;
                }
            }
            else addLog( "PubSubConnectionEndpoint '" + TestConnectionEndpoint_mI.NodeId + "' does not expose InputVariables. Skipping node." );
            
            // Cleanup created connection endpoint and PubSubConfig
            cleanupConnectionEndpoint( TestConnectionEndpoints[i] );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No PubSubConnectionEndpoint exposing InputVariables with Mode 'Subscriber' or 'PublisherSubscriber' found in server. Skipping test." );
            TC_Variables.Result = false;
        }
        TestConnectionEndpoints = null;
    }
    else {
        addSkipped( "Could not find a FunctionalEntity exposing InputData variables and/or failed to create the ConnectionEndpoint. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_010 } );