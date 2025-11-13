/*  Test prepared by OPC Foundation: compliance@opcfoundation.org
    Description:  
    Make sure that PercentDeadband filter treats a VQT filter as a VQ filter only.
        a. Write to the Value attribute, a value that will PASS the deadband filter. Call Publish()
        b. Write the same Value as last time, and then call Publish().
        c. Write the same Value as last time, but change the Quality; e.g. from "good" to "bad" etc. Call Publish().
        d. Repeat the previous call, and revert the Quality back to the original value. Call Publish().
        e. Write the exact same values as in the previous step. Call Publish().
        f. Repeat the last step, but also specify a timestamp that is *now*. Call Publish().
    Expected results:
        a. All service/operation results are Good.The Publish() call yields a DataChange where the value(s) match the value(s) previously written.
        b. All service/operation results are Good. The Publish() call yields a KeepAlive.
        c. All service/operation results are Good. The Publish() call yields a DataChange where the value(s) and quality/qualities match the value(s) previously written.
        d. All service/operation results are Good. The Publish() call yields a DataChange where the value(s) and quality/qualities match the value(s) previously written. Manual.
        e. All service/operation results are Good. The Publish() call yields a KeepAlive.
        f. All service/operation results are Good. The Publish() call yields a KeepAlive. */

function dataAccessPercentDeadband018() {
    var euRange = [];
    var originalStatus = [];
    var writesToPass = [];
    var newStatus = [];
    var items = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemType.Settings, Writable: true, SkipCreateSession: true } );

    if( !isDefined( items ) || items.length === 0 ) { addSkipped( "Static Analog" ); return( false ); }
    const DEADBAND = 10;
    const QUEUESIZE = 0;
     //Read the data type
    if( ReadHelper.Execute( { NodesToRead: items } ) ) {
         // Iterate & Get the items for each settings
        for ( var i=0; i<items.length; i++ ) {
            items[i].OriginalValue = items[i].Value.clone();
            originalStatus[i] = items[i].Value.StatusCode.StatusCode;
            // setup items characteristics
            items[i].QueueSize = QUEUESIZE;
            items[i].DiscardOldest = false;
            items[i].MonitoringMode = MonitoringMode.Reporting;
            items[i].Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBAND, DataChangeTrigger.Status );
        } // for (var i=0;

        //CreateMonitoredItems for all available Analog types
        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: items, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: MonitorBasicSubscription } ) ) {
            // Test 1: test the 10% deadband by writing a value that's expected to Pass
            print( "\n\n\n~~~~~~~~~~~~~ Test 1:Deadband testing: values expected to PASS filter ~~~~~~~~~~~~~~~~~" );
            for ( var i=0; i<items.length; i++ ) {
                // get the EURange, and generate some values to write to test the deadband
                euRange[i] = GetNodeIdEURange( items[i].NodeSetting );
                if( !isDefined( euRange[i] ) ) {
                    addError( "Test aborted: Setting '" + items[i].NodeSetting + "' did not yield a valid nodeId to test." );
                    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: items, SubscriptionId: MonitorBasicSubscription } );
                    return( false );
                }//if
                // get some values that will pass the deadband, and some that will fail the deadband
                var writePass = GetEURangeWriteValues( 1, euRange[i], DEADBAND, true, euRange[i].Low );
                writesToPass[i] = writePass[0];
                items[i].SafelySetValueTypeKnown( writePass[0], items[i].Value.Value.DataType );
            }//for
            WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
            PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
            PublishHelper.Execute();
            if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange but received Keep-alive." ) ) {
                for ( var i=0; i<writesToPass.length; i++ ) {
                    PublishHelper.SetItemValuesFromDataChange( items[i] );
                    Assert.CoercedEqual( writesToPass[i], items[i].Value.Value, "Expected to receive the value '" + writesToPass[i] + "' that was just written." );
                }
            }//if
            var publishCountBeforeFailTest = PublishHelper.ReceivedDataChanges.length;

            // Test 2: repeat the above steps, expect a keep alive
            print( "\n\n\n~~~~~~~~~~~~~ Test 2: Repeat step #1, expect KeepAlive ~~~~~~~~~~~~~~~~~" );
            WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
            PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
            PublishHelper.Execute();
            Assert.False( PublishHelper.CurrentlyContainsData(), "Publish: Keep-alive expected. The value in the last Write() was the same value as the previous Write() which should not cause a data change!" );

            // Test 3: write the previous value with bad quality; Expect to receive the datachange
            print( "\n\n\n~~~~~~~~~~~~~Test 3: Repeat last step, but specify a bad quality. Expect a datachange ~~~~~~~~~~~~~~~~~" );
            var writeOperationResults = [];
            for ( var i=0; i<items.length; i++ ) {
                items[i].Value.Set = "Value,StatusCode";
                //Change the status value
                if( items[i].Value.StatusCode.isGood() ) {
                    items[i].Value.StatusCode.StatusCode = StatusCode.Bad;
                    newStatus[i] = StatusCode.Bad; 
                }
                else {
                    items[i].Value.StatusCode.StatusCode = StatusCode.Good;
                    newStatus[i] = StatusCode.Good;
                }
                writeOperationResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadWriteNotSupported ] ) );
            } // for ( i=0;

            WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false, OperationResults: writeOperationResults } );
            if( WriteHelper.Response.Results[0].StatusCode !== StatusCode.BadWriteNotSupported ) {
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                for ( var i=0; i<writesToPass.length; i++ ) {
                    if( Assert.True( PublishHelper.CurrentlyContainsData(),"Expected Datachange, but received Keep-Alive" )) {
                        Assert.CoercedEqual( writesToPass[i], items[i].Value.Value, "Expected to receive the value '" + writesToPass[i] + "' that was just written." );
                        Assert.Equal( newStatus[i], items[i].Value.StatusCode.StatusCode, "StatusCode received in Publish() does not match the StatusCode in prior Write()." );
                    }
                }//for

                // Test 4: write the previous value with good quality; Expect a datachange
                print( "\n\n\n~~~~~~~~~~~~~Test 4: Repeat last step but with good quality; expecting a datachange ~~~~~~~~~~~~~~~~~" );
                for ( var i=0; i<items.length; i++ ) {
                   items[i].Value.Set = "Value,StatusCode";
                   //Change the status value
                   if( items[i].Value.StatusCode.isGood() ) {
                        items[i].Value.StatusCode.StatusCode = StatusCode.Bad;
                        newStatus[i] = StatusCode.Bad; 
                    }
                    else {
                        items[i].Value.StatusCode.StatusCode = StatusCode.Good;
                        newStatus[i] = StatusCode.Good;
                    }
                }
                WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange but received Keep-alive" ) ) {
                    for ( var i=0; i<writesToPass.length; i++ ) {
                        Assert.CoercedEqual( writesToPass[i], items[i].Value.Value, "Expected to receive the value '" + writesToPass[i] + "' that was just written." );
                        Assert.Equal( newStatus[i], items[i].Value.StatusCode.StatusCode, "StatusCode received in Publish() does not match the StatusCode in prior Write()." );
                    }//for
                }//if
                publishCountBeforeFailTest = PublishHelper.ReceivedDataChanges.length;

                print( "\n\n\n~~~~~~~~~~~~~Test 5: same values as before; expecting a KeepAlive ~~~~~~~~~~~~~~~~~" );
                WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                Assert.False( PublishHelper.CurrentlyContainsData(), "Unexpected dataChange for the written value '" + writesToPass[0] + "' Since there is no change in either the status or the value." );

                print( "\n\n\n~~~~~~~~~~~~~Test 6:  Deadband testing: write a Value, Quality, and Timestamp; expecting a KeepAlive ~~~~~~~~~~~~~~~~~" );
                for ( var i=0; i<items.length; i++ ) {
                    items[i].Value.Set = "Value,StatusCode,SourceTimestamp";
                    items[i].Value.SourceTimestamp = UaDateTime.utcNow();
                }
                WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
                PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );
                PublishHelper.Execute();
                Assert.False( PublishHelper.CurrentlyContainsData(), "Unexpected dataChange! Server queued a dataChange based on a new timestamp. Deadbands should not consider the timestamp filter request." );
                Assert.Equal( publishCountBeforeFailTest, PublishHelper.ReceivedDataChanges.length, "Expected the number of DataChanges to remain the same since there is only a change in the Timestamp." );

            }
            else {
                addSkipped( "Cannot continue test. Writing to VQT not supported." );
            }

        }
        else {
            addError( "Test aborted: Could not monitor the node specified by " + items[i].NodeSetting + "." );
        }//if( CreateMonitoredItemsHelper.Execute() )

        // clean-up
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: items, SubscriptionId: MonitorBasicSubscription } );
        PublishHelper.Clear();
        // Revert the items's value back to it's original state
        for ( var i=0; i<items.length; i++ ) {
            items[i].Value = items[i].OriginalValue;
            items[i].Value.StatusCode.StatusCode = originalStatus[i];
        } // for (var i=0;
       WriteHelper.Execute( { NodesToWrite: items, ReadVerification: false } );
       return( true );
    }
} // Function dataAccessPercentDeadband018()

Test.Execute( { Procedure: dataAccessPercentDeadband018 } );