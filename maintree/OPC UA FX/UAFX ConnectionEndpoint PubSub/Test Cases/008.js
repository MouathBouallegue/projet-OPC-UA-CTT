/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse every FunctionalEntity of the AutomationComponent examining all ConnectionEndpoints
                 and apply the appropiate test from Test Case 4 - 7 depending on the supported
                 communication Mode.
*/

function applyTest( testNr, connectionEndpoint ) {
    var result = false;
    switch( testNr ) {
        case 4:
            result = Test_004( connectionEndpoint );
            break;
        case 5:
            result = Test_005( connectionEndpoint );
            break;
        case 6:
            result = Test_006( connectionEndpoint );
            break;
        case 7:
            result = Test_007( connectionEndpoint );
            break;
        default:
    }
    if( result ) addLog( "TC 00" + testNr + " returned success for ConnectionEndpoint '" + connectionEndpoint.NodeId + "'" );
    else addError( "TC 00" + testNr + " failed for ConnectionEndpoint '" + connectionEndpoint.NodeId + "'" );
    return ( result );
}

function Test_008() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( typeof( Test_004 ) !== 'undefined' && typeof( Test_005 ) !== 'undefined' &&
        typeof( Test_006 ) !== 'undefined' && typeof( Test_007 ) !== 'undefined') {
            
        // Browse every FunctionalEntity
        if( CU_Variables.PubSubConnectionEndpointType_Instances.length > 0 ) {
            for( var i=0; i<CU_Variables.PubSubConnectionEndpointType_Instances.length; i++ ) {
                // Read the Attribute Value of variable Mode
                if( isDefined( CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode ) ) {
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode } ) ) {
                        var mode = CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode.Value.Value.toInt32();
                        // check if ConnectionEndpoint is bidirectional or unidirectional and apply the correct test
                        var variables = GetConnectionEnpointVariables( CU_Variables.PubSubConnectionEndpointType_Instances[i] );
                        if( variables.InputVariables.length > 0 && variables.OutputVariables.length > 0 ) {
                            if( mode == 1 ) {
                                addLog( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is bidirectional with Mode 'PublisherSubscriber'. Applying Test 004." );
                                TC_Variables.Result = applyTest( 4, CU_Variables.PubSubConnectionEndpointType_Instances[i] );
                            }
                            else {
                                addError( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is bidirectional, but Mode is not 'PublisherSubscriber'. It does not match any of the TC 004-007." );
                                TC_Variables.Result = false;
                            }
                        }
                        else if( variables.InputVariables.length > 0 && variables.OutputVariables.length == 0 ) {
                            if( mode == 1 ) {
                                addLog( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is unidirectional (has InputVariables only) with Mode 'PublisherSubscriber'. Applying Test 005." );
                                TC_Variables.Result = applyTest( 5, CU_Variables.PubSubConnectionEndpointType_Instances[i] );
                            }
                            else if( mode == 3 ) {
                                addLog( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is unidirectional (has InputVariables only) with Mode 'Subscriber'. Applying Test 006." );
                                TC_Variables.Result = applyTest( 6, CU_Variables.PubSubConnectionEndpointType_Instances[i] );
                            }
                            else {
                                addError( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is unidirectional (has InputVariables only), but Mode is 'Publisher'. It does not match any of the TC 004-007." );
                                TC_Variables.Result = false;
                            }
                        }
                        else if( variables.InputVariables.length == 0 && variables.OutputVariables.length > 0 ) {
                            if( mode == 1 ) {
                                addLog( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is unidirectional (has OutputVariables only) with Mode 'PublisherSubscriber'. Applying Test 005." );
                                TC_Variables.Result = applyTest( 5, CU_Variables.PubSubConnectionEndpointType_Instances[i] );
                            }
                            else if( mode == 2 ) {
                                addLog( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is unidirectional (has OutputVariables only) with Mode 'Publisher'. Applying Test 007." );
                                TC_Variables.Result = applyTest( 7, CU_Variables.PubSubConnectionEndpointType_Instances[i] );
                            }
                            else {
                                addError( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is unidirectional (has OutputVariables only), but Mode is 'Subscriber'. It does not match any of the TC 004-007." );
                                TC_Variables.Result = false;
                            }
                        }
                        else if( variables.InputVariables.length == 0 && variables.OutputVariables.length == 0 ) {
                            addError( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' has neither InputVariables nor OutputVariables. It does not match any of the TC 004-007." );
                            TC_Variables.Result = false;
                        }
                    }
                }
                else {
                    addError( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' does not expose mandatory variable 'Mode'. Skipping node." );
                    TC_Variables.Result = false;
                }
                if( !TC_Variables.Result ) break;
            }
        }
        else {
            addSkipped( "No FunctionalEntity with a preconfigured PubSubConnectionEndpoint found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Test cases 004-007 must be selected for this test to run." );
        TC_Variables.Result = false;
    }
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_008 } );