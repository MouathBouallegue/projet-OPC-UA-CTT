/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Specify an item which is a multi-dimensional array and use the IndexRange parameter to specify which element(s) within the array should constitute a value change. The IndexRange in this case is the first index of all dimensions. Do this for all supported data types.
                    Write to each data-type outside of the index range (e.g. elements 0, 1 and 5) and then call Publish().
    Expectation:    ServiceResult=GOOD.
                    For the first Publish call, verify that changing the value within that index range constitutes a value change.
                    For the second Publish call, verify that changing the value of an item outside of the specified range does not constitute a value change, in other words there should not be any dataChanges received in the 2nd call.
    Note:           This test case only applies, when the server supports multi-dimensional arrays.
 */

function monitorValueChanges042() {
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
    // Specify the IndexRange
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        var indexString = "1,1";
        for ( var s = 0; s < TC_Variables.MDArrays[i].ArrayDimensions.length; s++ ) {
            if ( s < 2 ) continue;
            indexString += ",1";
        }
        TC_Variables.MDArrays[i].IndexRange = indexString;
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
    if( TC_Variables.MDArrays.length < 1 ) {
        addSkipped( "There are no nodes that can be used for testing. Aborting." );
        return ( true );
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

    // Call Publish: Expecting the initial data
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
                        if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Double || TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Variant ) {
                            if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Double ) {
                                getMatrixValues( { Item: TC_Variables.MDArrays[s] } );
                                var a = new UaInt32s();
                                var b = new UaDoubles();
                                PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value.toDoubleMatrix( a, b );
                            }
                            if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Variant ) {
                                getMatrixValues( { Item: TC_Variables.MDArrays[s] } );
                                var a = new UaInt32s();
                                var b = new UaVariants();
                                PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value.toVariantMatrix( a, b );
                            }
                            if ( !Assert.Equal( TC_Variables.MDArrays[s].MatrixValues.length, b.length, "Unexpected length for flat array: " + TC_Variables.MDArrays[s].NodeSetting + "." ) ) {
                                TC_Variables.result = false;
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
    // Write to Index [0,0,...,0] and call Publish: Expecting no DataChangeNotification
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        var indexString = "0,0";
        for ( var s = 0; s < TC_Variables.MDArrays[i].ArrayDimensions.length; s++ ) {
            if ( s < 2 ) continue;
            indexString += ",0";
        }
        TC_Variables.MDArrays[i].IndexRange = indexString;
    }
    ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays } );
    var expectedResults = [];
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        UaVariant.Increment( { Item: TC_Variables.MDArrays[i] } );
        expectedResults.push( new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadWriteNotSupported ) );
    }
    WriteHelper.Execute( { NodesToWrite: TC_Variables.MDArrays, OperationResults: expectedResults, ReadVerification: false } );
    if( WriteHelper.Response.Results[0].StatusCode == StatusCode.BadWriteNotSupported ) {
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.MDArrays, SubscriptionId: MonitorBasicSubscription } );
        addSkipped( "Writing to IndexRange is not supported in the server. Aborting." );
        return ( true );
    }
    PublishHelper.WaitInterval( { Items: TC_Variables.MDArrays, Subscription: MonitorBasicSubscription } );
    PublishHelper.Execute();
    if ( Assert.False( PublishHelper.CurrentlyContainsData(), "Expected to receive no DataChangeNotification." ) ) {
        PublishHelper.Clear();
    }
    // Write to Index [1,1,...,1] and call Publish: Expecting a DataChangeNotification for each MonitoredItem
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        var indexString = "1,1";
        for ( var s = 0; s < TC_Variables.MDArrays[i].ArrayDimensions.length; s++ ) {
            if ( s < 2 ) continue;
            indexString += ",1";
        }
        TC_Variables.MDArrays[i].IndexRange = indexString;
    }
    ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays } );
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        UaVariant.Increment( { Item: TC_Variables.MDArrays[i] } );
    }
    WriteHelper.Execute( { NodesToWrite: TC_Variables.MDArrays, ReadVerification: false } );
    PublishHelper.WaitInterval( { Items: TC_Variables.MDArrays, Subscription: MonitorBasicSubscription } );
    PublishHelper.Execute();
    if ( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a DataChangeNotification." ) ) {
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
                        if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Double || TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Variant ) {
                            if ( TC_Variables.MDArrays[s].Value.Value.DataType == BuiltInType.Double ) {
                                getMatrixValues( { Item: TC_Variables.MDArrays[s] } );
                                var a = new UaInt32s();
                                var b = new UaDoubles();
                                PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value.toDoubleMatrix( a, b );
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
    PublishHelper.Clear();
    // Write to the entire multi dimensional array and call Publish: Expecting a DataChangeNotification
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        var indexString = "";
        TC_Variables.MDArrays[i].IndexRange = indexString;
    }
    ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays } );
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        UaVariant.Increment( { Item: TC_Variables.MDArrays[i] } );
    }
    WriteHelper.Execute( { NodesToWrite: TC_Variables.MDArrays, ReadVerification: false } );
    PublishHelper.WaitInterval( { Items: TC_Variables.MDArrays, Subscription: MonitorBasicSubscription } );
    PublishHelper.Execute();
    if ( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a DataChangeNotification." ) ) {
        var counter = 0;
        while ( PublishHelper.CurrentlyContainsData() && counter < TC_Variables.MDArrays.length ) {
            PublishHelper.WaitInterval( { Items: TC_Variables.MDArrays, Subscription: MonitorBasicSubscription } );
            PublishHelper.Execute();
            counter++;
        }
        // now to compare the value in the Publish response to the value read,
        counter = 0;
        for ( var t = 0; t < PublishHelper.ReceivedDataChanges.length; t++ ) {
            counter += PublishHelper.ReceivedDataChanges[t].MonitoredItems.length;
            for ( var i = 0; i < PublishHelper.ReceivedDataChanges[t].MonitoredItems.length; i++ ) {
                for ( var s = 0; s < TC_Variables.MDArrays.length; s++ ) {
                    if ( TC_Variables.MDArrays[s].ClientHandle == PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].ClientHandle ) {
                        TC_Variables.ValuesInPublish = MonitoredItem.fromSettings( TC_Variables.MDArrays[s].NodeSetting)[0];
                        TC_Variables.ValuesInPublish.Value.Value = PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value;
                        getMatrixValues( { Item: TC_Variables.MDArrays[s] } );
                        getMatrixValues( { Item: TC_Variables.ValuesInPublish } );
                        for( var u = TC_Variables.MDArrays[s].Dimensions.length - 1; u > 0; u-- ) {
                            var indexValue = TC_Variables.MDArrays[s].Dimensions[u] * ( indexValue + 1 );
                        }
                        if ( !Assert.Equal( TC_Variables.MDArrays[s].MatrixValues[indexValue], TC_Variables.ValuesInPublish.MatrixValues[0], "Unexpected value for item: " + TC_Variables.MDArrays[s].NodeSetting + "." ) ) {
                            TC_Variables.result = false;
                        }
                        else {
                            print( TC_Variables.MDArrays[s].NodeSetting + ": Verification succeeded." );
                        }
                    }
                }
            }
        }
        if ( !Assert.Equal( TC_Variables.MDArrays.length, counter, "Unexpected number of MonitoredItems in Publish." ) ) TC_Variables.result = false;
    }
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.MDArrays, SubscriptionId: MonitorBasicSubscription } );
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: monitorValueChanges042 } );