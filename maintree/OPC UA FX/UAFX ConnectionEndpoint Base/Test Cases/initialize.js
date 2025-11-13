include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX ConnectionEndpoint Base";

CU_Variables.Test = new Object();

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( !initializeStandardVariables( { TestObject: CU_Variables.Test } ) ) {
        addError( "Error while initializing. Aborting CU." );
        stopCurrentUnit();
    }
    else {
        CU_Variables.AllFunctionalEntities = [];
        
        for( var ac=0; ac<CU_Variables.Test.AutomationComponents.length; ac++ ) {
            var allFunctionalEntitiesOfAC = CU_Variables.Test.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities;
            for( var fe=0; fe<allFunctionalEntitiesOfAC.length; fe++ ) {
                allFunctionalEntitiesOfAC[fe].ParentAutomationComponent = CU_Variables.Test.AutomationComponents[ac];
            }
            CU_Variables.AllFunctionalEntities = CU_Variables.AllFunctionalEntities.concat( allFunctionalEntitiesOfAC );
        }
        // Find and initialize all instances of type 'ConnectionEndpointType' or subtypes
        if( isDefined( CU_Variables.Test.BaseObjectType.ConnectionEndpointType.NodeId ) ) {
            CU_Variables.ConnectionEndpointType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.ConnectionEndpointType, IncludeSubTypes: true } );
            if( CU_Variables.ConnectionEndpointType_Instances.length == 0 ) {
                
                // If no ConnectionEndpointType instance is available, try to create one using EstablishConnections
                addLog( "No ConnectionEndpointType instance found in AddressSpace. Trying to create one using EstablishConnections..." );
                var foundFunctionalEntityWithConnectionEndpointFolder = false;
                for( var i=0; i<CU_Variables.AllFunctionalEntities.length; i++ ) {
                    if( isDefined( CU_Variables.AllFunctionalEntities[i].ConnectionEndpoints ) ) {
                        foundFunctionalEntityWithConnectionEndpointFolder = true;
                        // Create ConnectionEndpoint
                        var callResult = callEstablishConnectionsMethod_CreateConnectionEndpointCmd( {
                            AutomationComponent: CU_Variables.AllFunctionalEntities[i].ParentAutomationComponent,
                            FunctionalEntityNodeId: CU_Variables.AllFunctionalEntities[i].NodeId,
                            Name: "ConnectionEndpoint_Base_temporary_ConnectionEndpoint" + i,
                            OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.Uncertain ) ]
                        } );
                        
                        var successfullyCreatedTemporaryConnectionEndpoint = true;
                        
                        if( callResult !== false && callResult.success ) {
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].FunctionalEntityNodeResult, "Received unexpected StatusCode for FunctionalEntityNodeResult" ) ) successfullyCreatedTemporaryConnectionEndpoint = false;
                            if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointResult, "Received unexpected StatusCode for ConnectionEndpointResult" ) ) successfullyCreatedTemporaryConnectionEndpoint = false;
                            CU_Variables.AllFunctionalEntities[i].TemporaryEndpointId = callResult.ConnectionEndpointConfigurationResults[0].ConnectionEndpointId;
                            if( successfullyCreatedTemporaryConnectionEndpoint ) {
                                refreshBaseVariablesModelMap( CU_Variables.SessionThread );
                                CU_Variables.ConnectionEndpointType_Instances = FindAndInitializeAllNodesOfType( { Type: CU_Variables.Test.BaseObjectType.ConnectionEndpointType, IncludeSubTypes: true } );
                            }
                        }
                        else successfullyCreatedTemporaryConnectionEndpoint = false;
                        if( !successfullyCreatedTemporaryConnectionEndpoint ) {
                            addSkipped( "No ConnectionEndpointType instance found in AddressSpace and trying to create one using EstablishConnections failed. Aborting CU." );
                            stopCurrentUnit();
                        }
                    }
                    else addLog( "FunctionalEntity '" + CU_Variables.AllFunctionalEntities[i].NodeId + "' has no ConnectionEndpoints folder. Skipping node." );
                }
                if( !foundFunctionalEntityWithConnectionEndpointFolder ) {
                    addSkipped( "No FunctionalEntity exposing a ConnectionEndpoint folder found in Server. Aborting CU." );
                    stopCurrentUnit();
                }
                
            }
        }
        else {
            addError( "Type definition of 'ConnectionEndpointType' not found in server, therefore no instances of this type can be browsed. Aborting CU." );
            stopCurrentUnit();
        }
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );