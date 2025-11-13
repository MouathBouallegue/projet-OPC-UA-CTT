/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Create two subscriptions (in two sessions). Run event collection.
        2	Individually acknowledge events in one session
        3	Ack event (already acked in first subscription) in second subscription 


    Expectation:
        1   Same event received in both subscription, each having the same EventId.
        2   all events can be acknowledged.  Second subscription also receives Acks. The retain=FALSE."
        3   Should return with already  already Acked
    
    How this test works:
*/

function Err_004 () {

    this.TestName = "Err_004";
    this.ExtraSession = null;
    this.ExtraBuffer = null;
    this.AcknowledgeNodeId = new UaNodeId( Identifier.AcknowledgeableConditionType_Acknowledge );

    this.States = {
        Initial: "Initial",
        UnableToAcknowledge: "UnableToAcknowledge",
        WaitingForAcknowledgedEvent: "WaitingForAcknowledgedEvent",
        Completed: "Completed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.IdsToRemove = [];

    this.Initialize = function () {

        this.ExtraSession = new Object();
        this.ExtraSession.SelectFields = new KeyPairCollection();
        this.ExtraSession.SelectFields.Set( "EventId", this.CreateSelectField( 0, "EventId" ) );
        this.ExtraSession.SelectFields.Set( "EventType", this.CreateSelectField( 1, "EventType" ) );
        this.ExtraSession.SelectFields.Set( "Time", this.CreateSelectField( 2, "Time" ) );
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

        CUVariables.Err_004_ExtraSession = this.ExtraSession;
        this.ExtraSession.ThreadStartTime = null;
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
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !this.CanRunTest( eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        var eventId = collector.GetSelectField( eventFields, "EventId" );
        var ackedState = collector.GetTwoState( eventFields, "AckedState" );
        var activeState = collector.GetSelectField( eventFields, "ActiveState.Id" ).toBoolean();

        print( this.TestName + ":" + conditionIdString + " ackedState " + ackedState + " activeState[" + activeState + "]" );

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                //            if ( !ackedState ) {
                this.TestCaseMap.Set( conditionIdString, {
                    Comment: "Err_004 Initial Acknowledgement EventId " + eventId.toString(),
                    State: this.States.Initial,
                    AcknowledgementTime: null,
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {

            print( this.TestName + ":" + conditionIdString + " TWO ackedState " + ackedState + " activeState[" + activeState + "] state " + localTestCase.State );


            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields ) ) {
                    // Just ack it.  Worry about the second ack after it comes back around
                    var result = collector.AcknowledgeAlarm( eventFields, localTestCase.Comment );
                    if ( result.isGood() ) {
                        localTestCase.State = this.States.WaitingForAcknowledgedEvent;
                        localTestCase.AcknowledgementTime = collector.GetCallResponseTime();
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                            " Unable to Acknowledge Alarm: Status " + result.toString() );
                        localTestCase.State = this.States.UnableToAcknowledge;
                        testCase.TestsFailed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                }else{
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Waiting in Initial State due to not able to acknowledge" );
                }
            } else if ( localTestCase.State == this.States.WaitingForAcknowledgedEvent ) {
                if ( CUVariables.Acknowledge.IgnoreAcknowledgeByTime( eventFields, collector,
                    localTestCase.AcknowledgementTime ) ) {
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Skipping due to new event" );

                    localTestCase.TestsSkipped++;
                    localTestCase.State = this.States.Initial;
                    return;
                }

                if ( !collector.ValidateRetain( eventFields ) ) {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Retain Flag in unexpected State" );
                    testCase.TestsFailed++;
                }

                var comment = UaVariant.New( {
                    Type: BuiltInType.LocalizedText,
                    Value: UaLocalizedText.New( {
                        Text: "Err_004 Second Acknowledgement EventId " + eventId.toString(),
                        Locale: gServerCapabilities.DefaultLocaleId
                    } )
                } );

                this.ExtraSession.Call.Execute( {
                    MethodsToCall: [ {
                        MethodId: this.AcknowledgeNodeId,
                        ObjectId: conditionId,
                        InputArguments: [ eventId, comment ]
                    } ],
                    SuppressMessaging: true
                } );

                var status = new UaStatusCode( this.ExtraSession.Call.Response.Results[ 0 ].StatusCode );

                if ( status.StatusCode == StatusCode.BadConditionBranchAlreadyAcked ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Unexpected status doing acknowledge in second session: " + status.toString() );
                    testCase.TestsFailed++;
                }

                localTestCase.State = this.States.Completed;
                collector.TestCompleted( conditionId, this.TestName );
            }
        }
    }

    this.PostLoopAction = function ( collector ) {
        if ( this.IdsToRemove.length > 0 ) {
            this.ExtraSession.AlarmThread.RemoveEntry( this.IdsToRemove );
        }
    }

    this.CanRunTest = function ( eventFields, testCase, collector ) {
        var run = false;

        if ( CUVariables.Acknowledge.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {

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