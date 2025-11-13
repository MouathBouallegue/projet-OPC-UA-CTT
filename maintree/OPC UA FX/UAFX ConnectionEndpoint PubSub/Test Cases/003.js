/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that all instances of PubSubConnectionEndpointType are compliant
                  with the specification.
    Requirements: Pre-configured PubSub ConnectionEndpoint exists or PubSubConnectionEndpoint
                  was created by EstablishConnections Method. 
          Step 1: Browse any instance of PubSubConnectionEndpointType and verify that all
                  supported objects, variables and methods are exposed.
          Step 2: Read the Attribute DataType of all variables and verify that it matches
                  with the fully inherited PubSubConnectionEndpointType definition.
          Step 3: Repeat previous steps for all available instances of the PubSubConnectionEndpointType.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.result = true;
    
    // check if needed types are available in the server
    if( !isDefined( CU_Variables.Test.Enumeration.PubSubConnectionEndpointModeEnum ) )
        addError( "Type 'PubSubConnectionEndpointModeEnum' not found in server" );
        
    // Find a ConnectionEndpoint for this test
    var TestConnectionEndpoints = FindOrCreateFittingConnectionEndpoints( {
        FunctionalEntities: CU_Variables.AllFunctionalEntities
    } );

    // Step 1: Browse any instance of PubSubConnectionEndpointType and verify that all
    //         supported objects, variables and methods are exposed.
    // Step 2: Read the Attribute DataType of all variables and verify that it matches
    //         with the fully inherited PubSubConnectionEndpointType definition.
    // Step 3: Repeat previous steps for all available instances of the PubSubConnectionEndpointType.
    if( TestConnectionEndpoints.length > 0 ) {
        for( var t=0; t<TestConnectionEndpoints.length; t++ ) {
            TC_Variables.result = VerifyElementsOfNode( { 
                Node: new MonitoredItem( TestConnectionEndpoints[t].ConnectionEndpointId ),
                IsModellingRuleOptional: true,
                Elements: [ 
                    { 
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Mode" } ),
                        NodeClass: NodeClass.Variable,
                        DataType: CU_Variables.Test.Enumeration.PubSubConnectionEndpointModeEnum,
                        TypeDefinition: new UaNodeId( Identifier.BaseDataVariableType ),
                        ModellingRule: new UaNodeId( Identifier.ModellingRule_Mandatory ),
                        IsOptional: false
                    }
                ]
            } );
            
            // Cleanup created connection endpoint and PubSubConfig
            cleanupConnectionEndpoint( TestConnectionEndpoints[t] );
        }
        TestConnectionEndpoints = null;
    }
    else {
        addError( "No preconfigured ConnectionEndpoints found in the server and failed to create one. Aborting test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: Test_003 } );