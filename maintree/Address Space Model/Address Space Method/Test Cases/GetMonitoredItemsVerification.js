/*  Test prepared by Shane Kurr: shane.kurr@opcfoundation.org; 
    Description: Check if GetMonitoredItems is available in the server. If it is, create a subscription, add one or more monitored items to the 
    subscription, and call GetMonitoredItems. Then verify all monitored items are returned.*/

function methodTest001() {
    var result = true;

    // make sure GetMonitoredItems exists at the ServerObject
    // we will use TranslateNodeIdsToBrowsePaths to find it
    if( !TranslateBrowsePathsToNodeIdsHelper.Execute( { BrowsePaths: [ "GetMonitoredItems" ], Node: new UaNodeId( Identifier.Server ) } ) ) return( false );

    // Get monitored items to be added to subscription
    var monitoredItems = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, 0, TimestampsToReturn.Both, true );
    if ( !isDefined( monitoredItems ) || monitoredItems.length === 0  ) {
        addSkipped( "Static Scalar NodeIds must be set for test to run" );
        return( false );
    }

    // Create subscription, add monitored items to subscription
    var subscriptionObject = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionObject, Session: Test.Session } ) ) {
        addError( "Create Subscription failed" );
        return( false );
    }   
    if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: monitoredItems, SubscriptionId: subscriptionObject } ) ) {
        addError( "Create Monitored Items failed" );
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionObject } );
        return( false );
    }

    // Create array of client handles for results to be checked against
    var clientHandles = [];
    for( var i=0; i<monitoredItems.length; i++ ) clientHandles[i] = monitoredItems[i].ClientHandle;

    // Call GetMonitoredItems
    if( CallHelper.Execute( { 
        MethodsToCall: 
            {   MethodId: new UaNodeId( Identifier.Server_GetMonitoredItems ),
                ObjectId: new UaNodeId( Identifier.Server ),
                InputArguments: UaVariant.New( { Type: BuiltInType.UInt32, Value:subscriptionObject.SubscriptionId } )
            }     
    } ) ) {
        // Copy results to a new array to be compared with clientHandles
        var results = CallHelper.Response.Results[0].OutputArguments[1].toUInt32Array();
        var clientHandlesReceived = [];
        for( var i=0; i<results.length; i++ ) clientHandlesReceived[i] = parseInt( results[i] );   

        // Verify all handles from subscription were received
        for( var i=0; i < clientHandles.length; i++ ) {
            var index = clientHandlesReceived.indexOf( parseInt( clientHandles[i] ) );
            if( index >= 0 ) clientHandlesReceived.splice( index, 1 );
            else {
                addError( "Client Handle: " + clientHandles[i] + " was not received." );
                result = false;
            } // close else
        }// close for

        // Check for extra handles received, or if any handles were duplicated, duplicate handles are allowed if valid
        if( clientHandlesReceived.length > 0 ) {
            for( var i=0; i < clientHandlesReceived.length; i++ ) {
                if( clientHandles.indexOf( parseInt( clientHandlesReceived[i] ) ) < 0 ) {
                    addError( "Client Handle: " + clientHandlesReceived[i] + " was received but is not valid." );
                    result = false;
                }// close inner if
            }// close inner for
        }// close outer if
    }// close CallHelper if, add error and fail if Callhelper fails
    else {
        addError( "GetMonitoredItems call failed" );
        result = false;
    }

    // Delete all Subscriptions and Monitored Items
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItems, SubscriptionId: subscriptionObject } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionObject } );
    return( result );
}

Test.Execute( { Procedure: methodTest001 } );