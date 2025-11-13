/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Instances/Level/Test Cases/Test_003.js

    Description:    
        Acknowledge an alarm from an instance

    Expectation:
        The twostate variable reflects the acknowledged state 
   
*/

function Test_003 () {

    this.TestName = "Test_003";

    this.States = {
        Initial: "Initial",
        Acknowledged: "Acknowledged",
        WaitForAcknowledgedEvent: "WaitForAcknowledgedEvent",
        Failed: "Failed",
        Completed: "Completed",
    }

    this.TestCaseMap = new KeyPairCollection();
    this.ModelMapHelper = null;

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

        if ( !this.CanRunTest( eventFields, collector ) ) {
            return;
        }


        var instance = collector.GetInstance( eventFields );

        if ( isDefined( instance ) ) {

            if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
                this.TestCaseMap.Set( conditionIdString,
                    {
                        State: this.States.Initial,
                        Instance: instance,
                        TestCase: testCase,
                        AcknowledgeTime: null,
                        TestComment: null,
                        Acknowledge: null,
                        AckedState: null,
                        Id: null,
                        Comment: null
                    }
                );
            }

            var localTestCase = this.TestCaseMap.Get( conditionIdString );

            print( conditionIdString + " State " + localTestCase.State +
                " active state " + collector.GetSelectField( eventFields, "ActiveState" ) +
                " acked state " + collector.GetSelectField( eventFields, "AckedState" ) +
                " comment " + collector.GetSelectField( eventFields, "Comment" ) );

            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields ) ) {
                    var eventId = eventFields[ collector.EventIdIndex ];

                    localTestCase.TestComment = "Instance:" + this.TestName + " Acknowledging event " + eventId.toString();

                    var commentVariant = new UaVariant();
                    var comment = UaLocalizedText.New( {
                        Text: localTestCase.TestComment,
                        Locale: gServerCapabilities.DefaultLocaleId
                    } );

                    commentVariant.setLocalizedText( comment );

                    if ( this.GetNodeIds( localTestCase ) ) {

                        var status = collector.Call( {
                            MethodsToCall: [ {
                                MethodId: localTestCase.Acknowledge,
                                ObjectId: conditionId,
                                InputArguments: [ eventId, commentVariant ]
                            } ],
                            SuppressMessaging: true
                        } );

                        localTestCase.AcknowledgeTime = collector.GetCallResponseTime();

                        if ( status.isGood() ) {
                            // Now read.
                            localTestCase.State = this.States.Acknowledged;

                            var itemsToRead = MonitoredItem.fromNodeIds( [ localTestCase.AckedState, localTestCase.Id, localTestCase.Comment ] );
                            if ( ReadHelper.Execute( { NodesToRead: itemsToRead } ) ) {
                                if ( itemsToRead[ 1 ].Value.Value.toBoolean() ) {
                                    if ( itemsToRead[ 2 ].Value.Value.equals( commentVariant ) ) {
                                        localTestCase.State = this.States.WaitForAcknowledgedEvent;
                                    } else {
                                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                            "Unexpected comment on Read [" + itemsToRead[ 2 ].Value.Value.toString() +
                                            "] Expected [" + commentVariant.toString() + "]" );
                                    }
                                } else {
                                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                        "AckedState has invalid State on Read " + itemsToRead[ 0 ].Value.Value.toString() +
                                        " [" + itemsToRead[ 0 ].Value.Value.toString() + "]" );
                                }
                            } else {
                                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                    "Read call failed: " + ReadHelper.Response.ServiceResult.toString() );
                            }
                        } else {
                            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                                "Acknowledge call failed: " + status.toString() );
                        }
                    } else {
                        collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                            "Unable to retrieve required NodeIds:" +
                            "\r\n\tAcknowledge: " + localTestCase.Acknowledge.toString() +
                            "\r\n\tAckedState: " + localTestCase.AckedState.toString() +
                            "\r\n\tAckedState.Id: " + localTestCase.Id.toString() +
                            "\r\n\tComment: " + localTestCase.Comment.toString() );
                    }
                }
            } else if ( localTestCase.State == this.States.WaitForAcknowledgedEvent ) {
                var ackedState = collector.GetSelectField( eventFields, "AckedState" );
                var id = collector.GetSelectField( eventFields, "AckedState.Id" ).toBoolean();
                var comment = collector.GetSelectField( eventFields, "Comment" ).toLocalizedText();

                if ( !id ) {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "AckedState has invalid State on Event " + ackedState.toString() + " [" + id + "]" );
                }
                if ( comment.Text == localTestCase.TestComment ) {
                    localTestCase.TestCase.TestsPassed++;
                    collector.TestCompleted( conditionId, this.TestName );
                    localTestCase.State = this.States.Completed;
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unexpected comment on Event [" + comment.Text + "] Expected " +
                        localTestCase.TestComment );
                }
            }
        } else {
            collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                " does not have an instance, Skipping" );
            testCase.TestsSkipped++;
        }
    }

    this.CanRunTest = function ( eventFields, collector ) {

        var canRunTest = false;

        if ( collector.IsAcknowledgeable( eventFields, true ) ) {
            if ( collector.CanRunTest( collector.GetConditionId( eventFields ), this.TestName ) ) {
                canRunTest = true;
            }
        }

        return canRunTest;
    }

    this.GetNodeIds = function ( localTestCase ) {
        var success = false;

        var referenceDescriptions = localTestCase.Instance.ReferenceDescriptions;

        var alarmSearchDefinitions = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Acknowledge" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "AckedState" } )
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
            var ackedStateModel = this.ModelMapHelper.GetModelMap().Get( localTestCase.AckedState );
            if ( isDefined( ackedStateModel ) ) {
                var ackedStateSearchDefinitions = [
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Id" } )
                    } ];
                this.ModelMapHelper.FindReferences( ackedStateModel.ReferenceDescriptions, ackedStateSearchDefinitions );
                if ( this.FillValue( localTestCase, ackedStateModel.ReferenceDescriptions, ackedStateSearchDefinitions[ 0 ] ) ) {
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
        Test.Execute( { Procedure: Test_003 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_003 } );
    }
}


