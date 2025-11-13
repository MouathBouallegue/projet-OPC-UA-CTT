/*  Test prepared by compliance@opcfoundation.org
    Description:
    CreateMonitoredItems for all available numeric Analog types specifying a DeadbandPercent of 10, and a filter of STATUS_VALUE_TIMESTAMP_2.
                Write a value that is +20% than the value received. Call Publish() #2 
                Write a value that is -11% than the value received. Call Publish() #3
                Write a value that is +10% than the value received. Call Publish() #4
                Write a value that is -1% higher than the value received. Call Publish() #5
                Write a new value to the timestamp, but the same value and status code from the last Write() call. Call Publish() #6.
                Write a new value to the StatusCode, but the same value and timestamp from the last Write() call. Call Publish() #7. */

function AddValue( items, ValueToAdd ) {
    if( isDefined( items.Value ) && isDefined( items.Value.Value ) ) {
        var tempValue;
        tempValue = UaVariantToSimpleType( items.Value.Value );
        tempValue = tempValue + ValueToAdd;
        items.SafelySetValueTypeKnown( tempValue, items.Value.Value.DataType );
    }
    else {
        addError( "AddValue() failed for " + items.NodeSetting + "." );
        return( false );
    } //if 
} // Function AddValue()

function TestPercentDeadBand( deadBand, valuePercent, statusFilter ) {
    var originalStatus = [];
    var items = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemType.Settings, Writable: true, SkipCreateSession: true } );
    if( !isDefined( items ) || items.length === 0 ) {
        addSkipped( "Static Analog" );
        return( false );
    } //if

    //Getting EURange once is good enough as it doesnt keep changing
    for( var i = 0; i < items.length; i++ ) {
        items[i].EURange = GetNodeIdEURange( items[i].NodeSetting );
        if( items[i].EURange === null || items[i].EURange === undefined ) {
            addError( "Test aborted: Setting '" + items[i].NodeSetting + "' did not yield a valid nodeId containing an EURange to test." );
            return ( false );
        }
        addLog( items[i].NodeSetting + ": EURange is '" + items[i].EURange + "'." );
    }

    //Read the data type
    if( ReadHelper.Execute( { NodesToRead: items } ) ) {
        // Iterate & Get the items for each settings
        for ( var i=0; i<items.length; i++ ) {
            items[i].OriginalValue = items[i].Value.clone();
            originalStatus[i] = items[i].Value.StatusCode.StatusCode;
            // setup items characteristics
            items[i].QueueSize = 1;
            items[i].DiscardOldest = false;
            items[i].MonitoringMode = MonitoringMode.Reporting;
            // Specify a DeadbandPercent of 10 and a filter of STATUS_0/STATUSVALUE_1/STATUS_VALUE_TIMESTAMP_2 only.
            items[i].Filter = Event.GetDataChangeFilter( DeadbandType.Percent, deadBand, statusFilter );
            addLog( items[i].NodeSetting + ": initial value is '" + items[i].OriginalValue .Value+ "'." );
        } // for (var i=0;

        // set the initial value as a starting point for all nodes; set a value that is in the middle of the EURange.
        _setValuesToMiddleValue( items );

        //CreateMonitoredItems for all available Analog types
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items,TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription } ) ) {
            // Test 1: Call Publish() #1
            print( "\n\n\n~~~~~~~~~~~~~ Test 1: Call Publish() #1 ~~~~~~~~~~~~~~~~~" );
            // get the initial data-change
            PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
            PublishHelper.Execute( { FirstPublish: true } );
            Assert.True( PublishHelper.CurrentlyContainsData(), "Publish: Response does not contain the initial data-change!" );

            // Test 2 to 5: Write a value that is +20%, -11%, 10%, -1% than the value received. Call Publish() #2 to #5. Here j=0 to 3.
            // Publish #2 and #3 yield data.
            for ( var j=0; j<2; j++ ) {
                print( "\n\n\n~~~~~~~~~~~~~ Test ", j+2, ": Write a value that is ",valuePercent[j] , "% than the value received. Call Publish() #", j+2," ~~~~~~~~~~~~~~~~~" );
                for ( var i=0; i<items.length; i++ ) {
                    // increment value, wait, and write, we expect success!
                    items[i].Value.Set = "Value,StatusCode";
                    // Find percent and increment value by percent!
                    var euPercent = GetEURangeValueFromPercent( items[i].EURange, valuePercent[j] );
                    var newValue = AddAnalogValue(items[i].Value.Value,euPercent);
                    items[i].SafelySetValueTypeKnown(newValue,items[i].Value.Value.DataType);
                    addLog( items[i].NodeSetting + ": new value becomes '" + items[i].Value.Value + "'. Expecting DataChange notification." );
                } // for ( i=0;

                // Writes Changed Items for tests 2 to 3.
                WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected Publish #", j+2, " to yield data." ) ) addLog( "Publish received dataChange notifications." );
            } // for ( var j=0;

            // Publish #4 and #5 is a keep-alive.
            for ( var j=2; j<valuePercent.length; j++ ) {
                print( "\n\n\n~~~~~~~~~~~~~ Test ", j+2, ": Write a value that is ",valuePercent[j] , "% than the value received. Call Publish() #", j+2," ~~~~~~~~~~~~~~~~~" );
                for ( i=0; i<items.length; i++ ) {
                    if (items[i].EURange.High !== items[i].EURange.Low) {
                        var euPercent = GetEURangeValueFromPercent( items[i].EURange, valuePercent[j] );
                        var newValue = AddAnalogValue( items[i].Value.Value, euPercent, false );
                        items[i].SafelySetValueTypeKnown( newValue, items[i].Value.Value.DataType );

                        addLog( items[i].NodeSetting + ": new value becomes '" + items[i].Value.Value + "'. Expecting NO DataChange notification." );
                    }
                    else {
                        addWarning(items[i].NodeSetting + ": EURange.Low is the same as EURange.High. Skipping this node.");
                    }
                } // for ( i=0;

                // Writes Changed Items for tests 4 to 5.
                WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                if( !Assert.False( PublishHelper.CurrentlyContainsData(), "Publish: Received data change, but expected only keep alive!" ) ) addLog( "Received\n" + PublishHelper.PrintDataChanges() );
            } // for ( j=2;
            // Test 6: Write a new value to the timestamp, but the same value and status code from the last Write() call. Call Publish() #6. 
            // The last Write() operation is either: Good or Bad_WriteNotSupported. Publish #6 is a keep-alive.
            print( "\n\n\n~~~~~~~~~~~~~ Test 6: Write a new value to the timestamp, but the same value and status code from the last Write() call. Call Publish() #6 ~~~~~~~~~~~~~~~~~" );
            for ( var i=0; i<items.length; i++ ) {
                items[i].Value.SourceTimestamp = UaDateTime.utcNow();
            } // for ( i=0;
            WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
            if( WriteHelper.Response.Results.StatusCode === StatusCode.BadWriteNotSupported ) {
                addNotSupported( "Write.Response.Results is Bad_WriteNotSupported." );
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                Assert.True( PublishHelper.CurrentlyContainsData(), "Publish: Response does not contain the data-change!" );
            }
            else {
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                Assert.False( PublishHelper.CurrentlyContainsData(), "Publish: Received data change, but expected only keep alive!" );
            }
            
            // Test 7: Write a new value to the StatusCode, but the same value and timestamp from the last Write() call. Call Publish() #7. 
            // Publish #7 is a data-change.
            print( "\n\n\n~~~~~~~~~~~~~ Test 7: Write a new value to the StatusCode, but the same value and timestamp from the last Write(). Call Publish() #7 ~~~~~~~~~~~~~~~~~" );
            var expectedResults = [];
            for ( var i=0; i<items.length; i++ ) {
                expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadWriteNotSupported ] ) );
                // Get the original Values beforeapplying a change
                items[i].Value.Set = "Value,StatusCode";              
                //Change the status value
                if( items[i].Value.StatusCode.isGood() ) items[i].Value.StatusCode.StatusCode = StatusCode.Bad;
                else items[i].Value.StatusCode.StatusCode = StatusCode.Good;
            } // for ( i=0;
            WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false, OperationResults: expectedResults } );
            if( WriteHelper.Response.Results[0].StatusCode === StatusCode.BadWriteNotSupported ) {
                addNotSupported( "Write.Response.Results is Bad_WriteNotSupported. Skipping test because Server does not support writing to the StatusCode." );
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                Assert.False( PublishHelper.CurrentlyContainsData(), "Publish: Received data change, but expected only keep alive!" );
            }
            else {
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                Assert.True( PublishHelper.CurrentlyContainsData(), "Publish: Response does not contain the data-change!" );
            }
        } // if( CreateMonitoredItemsHelper.Execute(
        else {
                addError( "Test aborted: Could not monitor the node specified by " + items[i].NodeSetting + "." );
                return( false );
        } // if( CreateMonitoredItemsHelper.Execute(
    }// ReadHelper.Execute()
    // Clean-up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: items, SubscriptionId: MonitorBasicSubscription } );
    PublishHelper.Clear();
    // Revert the items's value back to it's original state
    for ( var i=0; i<items.length; i++ ) {
        items[i].Value = items[i].OriginalValue;
        items[i].Value.StatusCode.StatusCode = originalStatus[i];
    } // for (var i=0;
    WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
    return( true );
} // Function TestPercentDeadBand()

function CreateMonitoredItems017() {
    const DEADBAND = 10;
    var valuePercentageAdd = [ 20, -11, 10, -1 ];
    var statusFilterValue = DataChangeTrigger.StatusValueTimestamp;
    return( TestPercentDeadBand( DEADBAND, valuePercentageAdd,  statusFilterValue ) );
} // Function CreateMonitoredItems017()

Test.Execute( { Procedure: CreateMonitoredItems017 } );