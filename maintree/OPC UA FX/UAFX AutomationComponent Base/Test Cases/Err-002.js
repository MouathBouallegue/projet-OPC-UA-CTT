/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify the behavior of the CloseConnections Method if the syntax of the
                 provided NodeId for the requested ConnectionEndpoint was invalid. 
         Step 1: Call CloseConnections. Provide a Null as ConnectionEndpoint in the ConnectionEndpoints
                 argument and set Remove to TRUE.
*/

function Test_Err_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.AllFunctionalEntities.length > 0 ) {
        // Step 1: Call CloseConnections. Provide a Null as ConnectionEndpoint in the ConnectionEndpoints
        //         argument and set Remove to TRUE.
        var callResult = callCloseConnectionsMethod( {
            AutomationComponent: CU_Variables.AllFunctionalEntities[0].ParentAutomationComponent,
            AllowEmptyConnectionEndpoint: true,
            ConnectionEndpoints: null,
            Remove: true,
            SkipResultValidation: true
        } );
        if( callResult.success ) {
            if( Assert.Equal( 1, callResult.Results.length, "Received unexpected array length for 'Results'" ) ) {
                if( !Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid ), callResult.Results[0], "Received unexpected StatusCode in Results[0]" ) ) TC_Variables.Result = false;
            }
            else TC_Variables.Result = false;
        }
        else {
            addError( "Failed to call CloseConnections method on AC '" + CU_Variables.AllFunctionalEntities[0].ParentAutomationComponent.NodeId + "'" );
            TC_Variables.Result = false;
        }
            
    }
    else {
        addSkipped( "No FunctionalEntities found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_002 } );