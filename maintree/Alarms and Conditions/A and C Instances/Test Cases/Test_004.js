/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Instances/Level/Test Cases/Test_004.js

    Description:    
        Confirm an Alarm from an instance 

    Test Requirements:
        Alarm requires confirmation, skip if instance does not support it 

    Expectation:
        The twostate variable reflects the confirmed state
        
    Description:
        Follows the same format as Test_003.  Since the previous test has already acknowledged alarms, 
        it is logical that this test should be a good state to do the confirm 
   
*/

function Test_004 () {

    this.TestName = "Test_004";

    this.States = {
        Initial: "Initial",
        Acknowledged: "Acknowledged",
        Confirmed: "Confirmed",
        WaitForConfirmedEvent: "WaitForConfirmedEvent",
        Failed: "Failed",
        Completed: "Completed",
    }

    this.TestCaseMap = new KeyPairCollection();
    this.ModelMapHelper = null;
    this.ConfirmMethod = new UaNodeId( Identifier.AcknowledgeableConditionType_Confirm );


    this.Initialize = function ( collector ) {
        var alarmTester = collector.GetAlarmTester();

        this.ModelMapHelper = alarmTester.GetAlarmUtilities().GetModelMapHelper();

        var alarmTypes = alarmTester.GetSupportedAlarmTypes();

        var typesToNotIgnore = [];

        var conditionTypeString = new UaNodeId( Identifier.conditionType ).toString();
        alarmTypes.Iterate( function ( alarmTypeString, alarmType ) {
            if ( alarmType.SpecAlarmTypeId != conditionTypeString ) {
                typesToNotIgnore.push( alarmTypeString );
            }
        } );

        collector.AddIgnoreSkips( typesToNotIgnore, this.TestName );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        var prefix = this.TestName + ":" + conditionIdString;

        if ( !this.CanRunTest( eventFields, testCase, collector ) ) {
            return;
        }

        var instance = collector.GetInstance( eventFields );

        if ( isDefined( instance ) ) {

            if ( !this.TestCaseMap.Contains( conditionIdString ) ) {

                var referenceDescriptionMap = this.ModelMapHelper.BuildAlarmReferenceDescriptionMap( instance );
                var items = [];
                var eventId = MonitoredItem.fromNodeIds( referenceDescriptionMap.Get( "EventId").NodeId.NodeId )[0];
                var message = MonitoredItem.fromNodeIds( referenceDescriptionMap.Get( "Message").NodeId.NodeId )[0];
                var time = MonitoredItem.fromNodeIds( referenceDescriptionMap.Get( "Time").NodeId.NodeId )[0];
                items.push( eventId );
                items.push( message );
                items.push( time );

                var items = {
                    Map: referenceDescriptionMap,
                    Items: items,
                    EventId: eventId,
                    Message: message,
                    Time: time
                };

                this.TestCaseMap.Set( conditionIdString,
                    {
                        State: this.States.Initial,
                        Instance: instance,
                        TestCase: testCase,
                        AcknowledgeTime: null,
                        ConfirmTime: null,
                        TestComment: null,
                        Confirm: null,
                        ConfirmedState: null,
                        Id: null,
                        Comment: null,
                        Items: items
                    }
                );
            }

            var localTestCase = this.TestCaseMap.Get( conditionIdString );

            if ( ReadHelper.Execute( { NodesToRead: localTestCase.Items.Items } ) ){
                collector.DebugPrint( this.TestName + ":" + conditionIdString + 
                " Read EventId [" + localTestCase.Items.EventId.Value.Value.toString() + 
                "] Message [" + localTestCase.Items.Message.Value.Value.toString() + "]" + 
                "] Time [" + localTestCase.Items.Time.Value.Value.toString() + "]" );
            }


            var debugTime = collector.GetSelectField( eventFields, "Time" ).toString();
            var debugEventId = collector.GetSelectField( eventFields,  "EventId" ).toString();
            var comment = collector.GetSelectField( eventFields, "Comment" );
            var message = collector.GetSelectField( eventFields, "Message" );
    
            collector.DebugPrint( this.TestName + ":" + conditionIdString + 
                " State [" + localTestCase.State + "]" +
                " Time [" + debugTime + "]" +
                " EventId [" + debugEventId + "]" +
                " Message [" + message + "]"
            );

            if ( localTestCase.State == this.States.Initial ) {

                if ( this.GetNodeIds( localTestCase ) ) {
                    // Only proceed if active and not acknowledged 
                    // starting from scratch is best from a timing perspective
                    if ( collector.ShouldAcknowledge( eventFields ) ) {
                        collector.DebugPrint(prefix + " AcknowledgeAlarm Start" );
                        var result = collector.AcknowledgeAlarm( eventFields, this.TestName + " Acknowledge for event " + collector.GetSelectField( eventFields, "EventId"),toString() );
                        localTestCase.AcknowledgeTime = collector.GetCallResponseTime();
                        collector.DebugPrint(prefix + " AcknowledgeAlarm complete " +  localTestCase.AcknowledgeTime.toString() );
                        if ( result.isGood() ) {
                            localTestCase.State = this.States.Acknowledged;
                        } else {
                            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                "Unable to Acknowledge alarm [ " + result.toString() + "]" );
                        }

                    }
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unable to retrieve required NodeIds:" +
                        "\r\n\tConfirm: " + localTestCase.Confirm.toString() +
                        "\r\n\tConfirmedState: " + localTestCase.ConfirmedState.toString() +
                        "\r\n\tConfirmedState.Id: " + localTestCase.Id.toString() +
                        "\r\n\tComment: " + localTestCase.Comment.toString() );
                }
            } else if ( localTestCase.State == this.States.Acknowledged ) {
                if ( this.IgnoreByTime( eventFields, collector, localTestCase.AcknowledgeTime ) ) {
                    collector.DebugPrint( prefix + " Skipping due to new event, expecting acknowledge event" );
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Skipping due to new event, expecting acknowledge event" );

                    localTestCase.TestsSkipped++;
                    localTestCase.State = this.States.Initial;
                    return;
                }

                if ( collector.IsAcknowledged( eventFields ) ) {
                    if ( collector.ShouldConfirm( eventFields ) ) {

                        var eventId = eventFields[ collector.EventIdIndex ];

                        localTestCase.TestComment = "Instance:" + this.TestName + " Confirming event " + eventId.toString();

                        var commentVariant = new UaVariant();
                        var comment = UaLocalizedText.New( {
                            Text: localTestCase.TestComment,
                            Locale: gServerCapabilities.DefaultLocaleId
                        } );

                        commentVariant.setLocalizedText( comment );
                        collector.DebugPrint(prefix + " Confirm Start event " + collector.GetSelectField( eventFields, "EventId"),toString() );

                        var result = collector.Call( {
                            MethodsToCall: [ {
                                MethodId: localTestCase.Confirm,
                                ObjectId: conditionId,
                                InputArguments: [ eventId, commentVariant ]
                            } ],
                            SuppressMessaging: true
                        } );

                        localTestCase.ConfirmTime = collector.GetCallResponseTime();

                        collector.DebugPrint(prefix + " Confirm End " + localTestCase.ConfirmTime.toString() );

                        if ( result.isGood() ) {

                            var itemsToRead = MonitoredItem.fromNodeIds( [ localTestCase.ConfirmedState, localTestCase.Id, localTestCase.Comment ] );
                            if ( ReadHelper.Execute( { NodesToRead: itemsToRead } ) ) {
                                if ( itemsToRead[ 1 ].Value.Value.toBoolean() ) {
                                    if ( itemsToRead[ 2 ].Value.Value.equals( commentVariant ) ) {
                                        localTestCase.State = this.States.WaitForConfirmedEvent;
                                    } else {
                                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                            "Unexpected comment on Read [" + itemsToRead[ 2 ].Value.Value.toString() +
                                            "] Expected [" + commentVariant.toString() + "]" );
                                    }
                                } else {
                                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                        "ConfirmedState has invalid State on Read " + itemsToRead[ 0 ].Value.Value.toString() +
                                        " [" + itemsToRead[ 0 ].Value.Value.toString() + "]" );
                                }
                            } else {
                                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                    "Read call failed: " + ReadHelper.Response.ServiceResult.toString() );
                            }
                        } else {
                            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                "Confirm call failed: " + result.toString() );
                        }
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Unable to confirm due to alarm state" );
                    }
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unexpected alarm state after Acknowledge" );
                }
            } else if ( localTestCase.State == this.States.WaitForConfirmedEvent ) {

                if ( this.IgnoreByTime( eventFields, collector, localTestCase.ConfirmTime ) ) {
                    collector.DebugPrint( prefix + " Skipping due to new event, expecting confirm event" );
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Skipping due to new event, expecting confirm event" );

                    localTestCase.TestsSkipped++;
                    localTestCase.State = this.States.Initial;
                    return;
                }

                var confirmedState = collector.GetSelectField( eventFields, "ConfirmedState" );
                var id = collector.GetSelectField( eventFields, "ConfirmedState.Id" ).toBoolean();
                var comment = collector.GetSelectField( eventFields, "Comment" ).toLocalizedText();

                if ( id ) {
                    if ( comment.Text == localTestCase.TestComment ) {
                        localTestCase.TestCase.TestsPassed++;
                        localTestCase.State = this.States.Completed;
                        collector.TestCompleted( conditionId, this.TestName );
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Unexpected comment on Event [" + comment.Text + "] Expected " +
                            localTestCase.TestComment );
                    }
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "ConfirmedState has invalid State on Event " + confirmedState.toString() + " [" + id + "]" );
                }
            }
        } else {
            collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                " does not have an instance, Skipping" );
            testCase.TestsSkipped++;
            collector.TestCompleted( conditionId, this.TestName );
        }
    }

    this.CanRunTest = function ( eventFields, testCase, collector ) {

        var canRunTest = false;

        if ( collector.IsAcknowledgeable( eventFields, true ) ) {
            var conditionId = collector.GetConditionId( eventFields );
            if ( collector.CanRunTest( conditionId, this.TestName ) ) {
                var confirmedStateVariant = collector.GetSelectField( eventFields, "ConfirmedState" );
                if ( confirmedStateVariant.DataType != 0 ) {
                    canRunTest = true;
                } else {
                    testCase.TestsSkipped++;
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionId.toString() +
                        " does not support ConfirmedState, Skipping" );

                    collector.TestCompleted( conditionId, this.TestName );
                }
            }
        }

        return canRunTest;
    }

    this.IgnoreByTime = function ( eventFields, collector, operationTime ) {
        var ignore = false;
        var alarmTime = collector.GetSelectField( eventFields, "Time" );
        var time = alarmTime.toDateTime();
        if ( isDefined( time ) ) {
            if ( time < operationTime ) {
                ignore = true;
            }
        }

        return ignore;
    }

    this.GetNodeIds = function ( localTestCase ) {
        var success = false;

        var referenceDescriptions = localTestCase.Instance.ReferenceDescriptions;

        var alarmSearchDefinitions = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Confirm" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "ConfirmedState" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Comment" } )
            } ];

        this.ModelMapHelper.FindReferences( referenceDescriptions, alarmSearchDefinitions );

        var initialSuccess = true;
        for ( var index = 0; index < alarmSearchDefinitions.length; index++ ) {
            if ( !this.FillValue( localTestCase, referenceDescriptions, alarmSearchDefinitions[ index ] ) ) {
                initialSuccess = false;
            }
        }

        if ( initialSuccess ) {
            var confirmedStateModel = this.ModelMapHelper.GetModelMap().Get( localTestCase.ConfirmedState );
            if ( isDefined( confirmedStateModel ) ) {
                var confirmedStateSearchDefinitions = [
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Id" } )
                    } ];
                this.ModelMapHelper.FindReferences( confirmedStateModel.ReferenceDescriptions, confirmedStateSearchDefinitions );
                if ( this.FillValue( localTestCase, confirmedStateModel.ReferenceDescriptions, confirmedStateSearchDefinitions[ 0 ] ) ) {
                    success = true;
                }
            }
        }

        return success;
    }

    this.FillValue = function ( localTestCase, referenceDescriptions, searchDefinition ) {
        var success = false;

        if ( isDefined( searchDefinition.ReferenceIndex ) ) {
            localTestCase[ searchDefinition.BrowseName.Name ] =
                referenceDescriptions[ searchDefinition.ReferenceIndex ].NodeId.NodeId;
            success = true;
        }

        return success;
    }

    this.CheckResults = function () {

        return CUVariables.AlarmCollector.CheckResults( this.TestName, CUVariables.PrintResults );
    }

    if ( isDefined( CUVariables.AutoRun ) ) {
        if ( !CUVariables.AutoRun ) {
            CUVariables.AlarmCollector.RunSingleTest( CUVariables, this.TestName, this );
            return this.CheckResults();
        } else if ( CUVariables.CheckResults ) {
            return this.CheckResults();
        }
    }
}

if ( isDefined( CUVariables.AutoRun ) ) {
    if ( !CUVariables.AutoRun ) {
        Test.Execute( { Procedure: Test_004 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_004 } );
    }
}



