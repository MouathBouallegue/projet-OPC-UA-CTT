/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Specify an item which is an multi-dimensional array. Do this for all supported data types.
                    Create a subscription, add the specified item, and call Publish().
    Expectation:    ServiceResult = Good.
                    Verify that all of the items return array values in the Publish call.
    Note:           This test case only applies, when the server supports multi-dimensional arrays.
 */

function monitorValueChanges041() {
    var TC_Variables = new Object();
    TC_Variables.result = true;

    // Get the multi dimensional array nodes from CTT settings
    TC_Variables.MDArrays = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.MDArrays.Settings );
    if ( TC_Variables.MDArrays.length < 1 ) {
        addSkipped( "No MultiDimensionalArray items configured. Please check settings." );
        return ( false );
    }
    // Read the ArrayDimensions
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        TC_Variables.MDArrays[i].AttributeId = Attribute.ArrayDimensions;
    }
    ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays } );
    // Store the received value for the ArrayDimensions attribute
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        TC_Variables.MDArrays[i].ArrayDimensions = TC_Variables.MDArrays[i].Value.Value.toUInt32Array();
        TC_Variables.MDArrays[i].AttributeId = Attribute.Value;
    }
    // Are the configured nodes multi dimensional arrays?
    for( var i = TC_Variables.MDArrays.length - 1; i > -1; i-- ) {
        if ( TC_Variables.MDArrays[i].ArrayDimensions.length < 2 ) {
            addSkipped( "The node configured as multi dimensional array: '" + TC_Variables.MDArrays[i].NodeSetting + "', can not be used for testing because the ArrayDimension attribute indicates that it is not a multi dimensional array. Received value for ArrayDimensions: " + TC_Variables.MDArrays[i].ArrayDimensions + "." );
            TC_Variables.MDArrays.splice( i, 1 );
        }
    }
    // Can we use the configured arrays for this test?
    ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays } );
    for( var i = TC_Variables.MDArrays.length - 1; i > -1; i-- ) {
        if ( ReadHelper.Response.ResponseHeader.ServiceResult.isNotGood() ) return ( false );
        if ( ReadHelper.Response.Results[i].StatusCode.isNotGood() ) {
            addSkipped( "The node configured as multi dimensional array: '" + TC_Variables.MDArrays[i].NodeSetting + "', can not be used for testing. Reading the value attribute failed." );
            TC_Variables.MDArrays.splice( i, 1 );
        }
        else {
            getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
        }
    }
    // Now create the monitoredItems
    CreateMonitoredItemsHelper.Execute( { ItemsToCreate: TC_Variables.MDArrays, SubscriptionId: MonitorBasicSubscription } );
    if ( CreateMonitoredItemsHelper.Response.ResponseHeader.ServiceResult.isNotGood() ) return ( false );
    for( var i = TC_Variables.MDArrays.length - 1; i > -1; i-- ) {
        if ( CreateMonitoredItemsHelper.Response.Results[i].StatusCode.isNotGood() ) {
            TC_Variables.MDArrays.splice( i, 1 );
        }
    }
    if ( TC_Variables.MDArrays.length < 1 ) {
        addSkipped( "The creation of all MonitoredItems failed." );
        return ( false );
    }

    // Call Publish
    PublishHelper.WaitInterval( { Items: TC_Variables.MDArrays, Subscription: MonitorBasicSubscription } );
    PublishHelper.Execute();
    if ( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive the initial values." ) ) {
        var counter = 0;
        while ( PublishHelper.CurrentlyContainsData() && counter < TC_Variables.MDArrays.length ) {
            PublishHelper.WaitInterval( { Items: TC_Variables.MDArrays, Subscription: MonitorBasicSubscription } );
            PublishHelper.Execute();
            counter++;
        }
        // now to compare the value in the Publish response to the value read,
        for ( var t = 0; t < PublishHelper.ReceivedDataChanges.length; t++ ) {
            for ( var i = 0; i < PublishHelper.ReceivedDataChanges[t].MonitoredItems.length; i++ ) {
                for ( var s = 0; s < TC_Variables.MDArrays.length; s++ ) {
                    if ( TC_Variables.MDArrays[s].ClientHandle == PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].ClientHandle ) {
                        if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Double || TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Float || TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Variant ) {
                            if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Double ) {
                                getMatrixValues( { Item: TC_Variables.MDArrays[s] } );
                                var a = new UaInt32s();
                                var b = new UaDoubles();
                                PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value.toDoubleMatrix( a, b );
                            }
                            if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Float ) {
                                getMatrixValues( { Item: TC_Variables.MDArrays[s] } );
                                var a = new UaInt32s();
                                var b = new UaFloats();
                                PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value.toFloatMatrix( a, b );
                            }
                            if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Variant ) {
                                getMatrixValues( { Item: TC_Variables.MDArrays[s] } );
                                var a = new UaInt32s();
                                var b = new UaVariants();
                                PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value.toVariantMatrix( a, b );
                            }
                            for ( var u = 0; u < b.length; u++ ) {
                                if ( !Assert.Equal( TC_Variables.MDArrays[s].MatrixValues[u], b[u], "Unexpected value for item: " + TC_Variables.MDArrays[s].NodeSetting + "." ) ) {
                                    TC_Variables.result = false;
                                }
                            }
                            print( TC_Variables.MDArrays[s].NodeSetting + ": Verification done." );
                            continue;
                        }
                        if ( !Assert.Equal( TC_Variables.MDArrays[s].Value.Value, PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value, "Unexpected value for item: " + TC_Variables.MDArrays[s].NodeSetting + "." ) ) {
                            TC_Variables.result = false;
                        }
                        else {
                            print( TC_Variables.MDArrays[s].NodeSetting + ": Verification succeeded." );
                        }
                    }
                }
            }
        }
    }
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.MDArrays, SubscriptionId: MonitorBasicSubscription } );
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: monitorValueChanges041 } );