/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Read the Attribute Value of the Variable CleanupTimeout.
    Requirements: ConnectionEndpoint is persistent (IsPersistent flag is set TRUE)
*/

function Test_007() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
        
    for( var i=0; i<CU_Variables.ConnectionEndpointType_Instances.length; i++ ) {
        if( !isDefined( CU_Variables.ConnectionEndpointType_Instances[i].IsPersistent ) ) {
            addError( "Mandatory node 'IsPersistent' not found in ConnectionEndpointType instance '" + CU_Variables.ConnectionEndpointType_Instances[i].NodeId + "'. Skipping instance." );
            break;
        }
        if( !isDefined( CU_Variables.ConnectionEndpointType_Instances[i].CleanupTimeout ) ) {
            addError( "Mandatory node 'CleanupTimeout' not found in ConnectionEndpointType instance '" + CU_Variables.ConnectionEndpointType_Instances[i].NodeId + "'. Skipping instance." );
            break;
        }
        if( ReadHelper.Execute( { NodesToRead: [CU_Variables.ConnectionEndpointType_Instances[i].IsPersistent, CU_Variables.ConnectionEndpointType_Instances[i].CleanupTimeout] } ) ) {
            var isPersistent = CU_Variables.ConnectionEndpointType_Instances[i].IsPersistent.Value.Value.toBoolean();
            // check if IsPersistent = TRUE
            if( isPersistent ) {
                TC_Variables.nothingTested = false;
                var cleanupTimeout = CU_Variables.ConnectionEndpointType_Instances[i].CleanupTimeout.Value.Value.toDouble();
                // check if CleanupTimeout is negative
                if( !Assert.LessThan( 0, cleanupTimeout, "Value of CleanupTimeout variable of ConnectionEndpointType instance '" + CU_Variables.ConnectionEndpointType_Instances[i].NodeId + "' is not a negative number." ) ) TC_Variables.Result = false;
            }
            else addLog( "Variable IsPersistent of ConnectionEndpointType instance '" + CU_Variables.ConnectionEndpointType_Instances[i].NodeId + "' is set to FALSE. Skipping instance." );
        }
    }
    
    if( TC_Variables.nothingTested ) {
        addSkipped( "No instance of type ConnectionEndpointType or a subtype (with IsPersistent flag set to TRUE) found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_007 } );