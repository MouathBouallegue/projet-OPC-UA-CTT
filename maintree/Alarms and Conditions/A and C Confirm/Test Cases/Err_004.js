/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Create two subscriptions (in two sessions). Run event collection.
        2	Individually Confirm events in one session
        3	Confirm event (already acked in first subscription) in second subscription 


    Expectation:
        1   Same event received in both subscription, each having the same EventId.
        2   all events can be Confirmed.  Second subscription also receives Acks. The retain=FALSE."
        3   Should return with already  already Acked
    
    How this test works:
*/

function Err_004 () {

    this.TestName = "Err_004";
    this.ExtraSession = null;
    this.ExtraBuffer = null;
    this.ConfirmNodeId = new UaNodeId( Identifier.AcknowledgeableConditionType_Confirm );

    this.States = {
        Initial: "Initial",
        WaitingForAcknowledgeEvent: "WaitingForAcknowledgeEvent",
        UnableToConfirm: "UnableToConfirm",
        WaitingForConfirmEvent: "WaitingForConfirmEvent",
        WaitingForSecondaryConfirmEvent: "WaitingForSecondaryConfirmEvent",
        ReadyForTest: "ReadyForTest",
        Skipped: "Skipped",
        Failed: "Failed",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();
    this.WaitingForSecondary = new KeyPairCollection();

    this.IdsToRemove = [];

    this.Initialize = function () {

        this.ExtraSession = new Object();
        this.ExtraSession.SelectFields = new KeyPairCollection();
        this.ExtraSession.EventIdIndex = 0;
        this.ExtraSession.EventTypeIndex = 1;
        this.ExtraSession.TimeIndex = 2;
        this.ExtraSession.SelectFields.Set( "EventId", this.CreateSelectField( this.ExtraSession.EventIdIndex, "EventId" ) );
        this.ExtraSession.SelectFields.Set( "EventType", this.CreateSelectField( this.ExtraSession.EventTypeIndex, "EventType" ) );
        this.ExtraSession.SelectFields.Set( "Time", this.CreateSelectField( this.ExtraSession.TimeIndex, "Time" ) );
        this.ExtraSession.EventItem = new UaNodeId( Identifier.Server );
        this.ExtraSession.AlarmThread = new AlarmThread();

        this.ExtraSession.AlarmThread.Start( {
            EventNodeId: this.ExtraSession.EventItem,
            SelectFields: this.ExtraSession.SelectFields
        } );

        this.ExtraSession.AlarmThread.StartPublish();
        this.ExtraSession.Call = new CallService( this.ExtraSession.AlarmThread.SessionThread.Session );

        this.ExtraSession.Running = true;

        this.ExtraSession.Shutdown = function ( extraSession ) {
            if ( extraSession.Running ) {
                extraSession.AlarmThread.End();
                extraSession.Running = false;
            }
        }

        this.ExtraSession.ThreadStartTime = null;
        CUVariables.Err_004_ExtraSession = this.ExtraSession;
    }

    this.Shutdown = function () {
        this.ExtraSession.Shutdown( this.ExtraSession );
    }

    this.CreateSelectField = function ( index, id ) {
        return {
            Index: index,
            Identifier: Identifier.BaseEventType,
            BrowsePaths: [ id ]
        };
    }

    this.PreLoopAction = function ( collector ) {
        this.ExtraBuffer = this.ExtraSession.AlarmThread.GetBuffer();

        this.IdsToRemove = [];

        for ( var index = 0; index < this.ExtraBuffer.events.length; index++ ) {
            if ( !isDefined( this.ExtraSession.ThreadStartTime ) ) {
                this.ExtraSession.ThreadStartTime = collector.GetSelectFieldFromMap(
                    this.ExtraBuffer.events[ index ].EventFieldList.EventFields,
                    "Time",
                    this.ExtraSession.SelectFields ).toDateTime();
            }

            this.IdsToRemove.push( this.ExtraBuffer.events[ index ].EventHandle );
        }

        if ( this.WaitingForSecondary.Length() > 0 ) {

            for ( var index = 0; index < this.ExtraBuffer.events.length; index++ ) {
                var eventFields = this.ExtraBuffer.events[ index ].EventFieldList.EventFields;
                var eventIdString = eventFields[ this.ExtraSession.EventIdIndex ].toString();
                var initialEvent = this.WaitingForSecondary.Get( eventIdString );
                if ( isDefined( initialEvent ) ) {
                    var conditionId = collector.GetConditionId( initialEvent );
                    var conditionIdString = conditionId.toString();
                    var localTestCase = this.TestCaseMap.Get( conditionIdString );
                    if ( isDefined( localTestCase ) ) {
                        print( this.TestName + ":" + conditionIdString + " Preloop running Confirm Test" );
                        this.TestConfirmCondition( initialEvent, localTestCase, collector );
                        this.WaitingForSecondary.Remove( eventIdString );
                    }
                }
            }

            this.WaitingForSecondary.Iterate( function ( key, initialEvent, args ) {
                var conditionId = args.Collector.GetConditionId( initialEvent );
                var conditionIdString = conditionId.toString();
                var localTestCase = args.This.TestCaseMap.Get( conditionIdString );
                if ( isDefined( localTestCase ) ) {
                    args.Collector.Error( args.This.TestName, conditionId, localTestCase, args.This.States.Failed,
                        "Acknowledged Alarm extra event not received for event " + key );
                }
            }, { This: this, Collector: collector } );

            this.WaitingForSecondary = new KeyPairCollection();
        }
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !this.CanRunTest( eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                this.TestCaseMap.Set( conditionIdString, {
                    TestCase: testCase,
                    State: this.States.Initial,
                    AcknowledgeTime: null,
                    ConfirmTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {

            print( this.TestName + ":" + conditionIdString + " State: " + localTestCase.State );

            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields ) ) {
                    print( this.TestName + ":" + conditionIdString + " Acknowledging" );

                    var acknowledgeResult = collector.AcknowledgeAlarm( eventFields,
                        this.TestName + " Acknowledging Alarm",
                        gServerCapabilities.DefaultLocaleId );

                    localTestCase.AcknowledgeTime = collector.GetCallResponseTime();

                    if ( acknowledgeResult.isGood() ) {
                        localTestCase.State = this.States.WaitingForAcknowledgeEvent;
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Acknowledge Alarm " + acknowledgeResult.toString() );
                        localTestCase.State = this.States.Failed;
                        testCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                }else{
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Waiting in Initial State due to not able to acknowledge" );
                }
            } else if ( localTestCase.State == this.States.WaitingForAcknowledgeEvent ) {

                if ( CUVariables.Confirm.IgnoreConfirmByTime( eventFields, collector,
                    "Acknowledge", localTestCase.AcknowledgeTime ) ) {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Skipping due to new event" );
                    collector.Skip( this.TestName, conditionId, localTestCase, this.States.Initial );
                    return;
                }

                if ( collector.ShouldConfirm( eventFields ) ) {
                    var eventId = collector.GetSelectField( eventFields, "EventId" );

                    var found = false;
                    for ( var index = 0; index < this.ExtraBuffer.events.length; index++ ) {
                        var possibleEvent = this.ExtraBuffer.events[ index ].EventFieldList.EventFields;
                        var possibleEventId = possibleEvent[ 0 ];
                        if ( possibleEventId.equals( eventId ) ) {
                            localTestCase.State = this.States.ReadyForTest;
                            found = true;
                            print( this.TestName + ":" + conditionIdString + " TestEvent running Confirm Test" );
                            this.TestConfirmCondition( eventFields, localTestCase, collector );
                            break;
                        }
                    }
                    if ( !found ) {
                        print( this.TestName + ":" + conditionIdString + " Adding " + eventId.toString() + " to secondary" );
                        this.WaitingForSecondary.Set( eventId.toString(), eventFields );
                    }
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed, "Acknowledged Alarm should be confirmable" );
                }
            }
        }
    }

    this.TestConfirmCondition = function ( eventFields, localTestCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var eventId = eventFields[ collector.EventIdIndex ];
        var eventIdString = eventId.toString();

        var result = collector.ConfirmAlarm( eventFields,
            this.TestName + " Initial Confirm EventId " + eventIdString,
            gServerCapabilities.DefaultLocaleId );

        if ( result.isGood() ) {

            // Now Confirm in second subscription
            localTestCase.ConfirmTime = collector.GetCallResponseTime();
            var comment = UaVariant.New( {
                Type: BuiltInType.LocalizedText,
                Value: UaLocalizedText.New( {
                    Text: this.TestName + " Second Confirm EventId " + eventId.toString(),
                    Locale: gServerCapabilities.DefaultLocaleId
                } )
            } );

            this.ExtraSession.Call.Execute( {
                MethodsToCall: [ {
                    MethodId: this.ConfirmNodeId,
                    ObjectId: conditionId,
                    InputArguments: [ eventId, comment ]
                } ],
                SuppressMessaging: true
            } );

            var status = new UaStatusCode( this.ExtraSession.Call.Response.Results[ 0 ].StatusCode );

            if ( status.StatusCode == StatusCode.BadConditionBranchAlreadyConfirmed ) {
                localTestCase.TestCase.TestsPassed++;
                localTestCase.State = this.States.Completed;
                collector.TestCompleted( conditionId, this.TestName );
            } else {
                collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                    "Secondary Confirm expected BadConditionBranchAlreadyConfirmed, Actual: " + status.toString() );
            }
        } else {
            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                "Initial Confirm Failed: " + result.toString() );
        }
    }

    this.PostLoopAction = function ( collector ) {
        if ( this.IdsToRemove.length > 0 ) {
            this.ExtraSession.AlarmThread.RemoveEntry( this.IdsToRemove );
        }
    }

    this.CanRunTest = function ( eventFields, testCase, collector ) {

        var run = false;

        if ( CUVariables.Confirm.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            var time = collector.GetSelectField( eventFields, "Time" ).toDateTime();
            if ( isDefined( time ) ) {
                if ( isDefined( this.ExtraSession.ThreadStartTime ) ) {
                    if ( time > this.ExtraSession.ThreadStartTime ) {
                        run = true;
                    } else {
                        print( collector.GetConditionId( eventFields ).toString() +
                            " Unable to process event due to being before start of extra session " +
                            " Event Time " + time.toString() + " start time " + this.ExtraSession.ThreadStartTime.toString() );
                    }
                } else {
                    print( collector.GetConditionId( eventFields ).toString() +
                        " Unable to process event due to being before start of extra session " +
                        " Event Time " + time.toString() );
                }
            } else {
                print( collector.GetConditionId( eventFields ).toString() +
                    " does not have a transition time!" );
            }
        }

        return run;
    }


    this.CheckResults = function () {

        CUVariables.AlarmCollector.DebugFinalState( this.TestName, this.TestCaseMap );

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
        Test.Execute( { Procedure: Err_004 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_004 } );
    }
}