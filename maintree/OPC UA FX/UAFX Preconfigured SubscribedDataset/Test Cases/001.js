/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that the server exposes the PublishSubscribe Object
    Requirements: At least one PreconfiguredSubscribedDataSet exists, if not skip entire CU
          Step 1: Browse the Server Object
          Step 2: Browse the PublishSubscribe object
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;

    // Step 1: Browse the Server Object
    var serverChildren = GetChildNodes( new MonitoredItem( new UaNodeId( Identifier.Server ) ) );
    if( serverChildren.length > 0 ) {
        for( var i=0; i<serverChildren.length; i++ ) {
            if( serverChildren[i].BrowseName.Name == "PublishSubscribe" ) {
                // Step 2: Browse the PublishSubscribe object
                addLog( "'PublishSubscribe' object found in the Server object of the server" );
                var pubSubChildren = GetChildNodes( serverChildren[i] );
                if( pubSubChildren.length > 0 ) {
                    for( var p=0; p<pubSubChildren.length; p++ ) {
                        if( pubSubChildren[p].BrowseName.Name == "SubscribedDataSets" ) {
                            addLog( "'SubscribedDataSets' object found in the 'PublishSubscribe' object of the server" );
                            break;
                        }
                        if( p == pubSubChildren.length - 1 ) {
                            addError( "Step 2: Could not find 'SubscribedDataSets' object in the 'PublishSubscribe' object of the server." );
                            TC_Variables.Result = false;
                        }
                    }
                }
                else {
                    addError( "Step 2: No nodes found in PublishSubscribe object." );
                    TC_Variables.Result = false;
                }
                break;
            }
            if( i == serverChildren.length - 1 ) {
                addError( "Step 1: Could not find 'PublishSubscribe' object in the Server object of the server." );
                TC_Variables.Result = false;
            }
        }
    }
    else {
        addError( "Step 1: No nodes found in Server object." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );