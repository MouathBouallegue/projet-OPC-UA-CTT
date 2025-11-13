/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	create event subscription and find condition in subscription
        2	Invoke acknowledge method passing an invalid existing Objectid As the conditionId 
            (not an Alarm instance or valid condition, but a valid Object - i.e. server object or some other object) 
            to the call service
        3	Repeat for multiple events

    Expectation:
        1    Confirmable condition notification is received where confirmedState=FALSE
        2    Bad_NodeIdUnknown
        3    Bad_NodeIdUnknown
   
    How this test works:
*/

function Err_009 () {

    this.TestName = "Err_009";

    this.ServerNodeId = null;

    this.States = {
        Initial: "Initial",
        Completed: "Completed",
        Unexpected: "Unexpected"
    }

    this.TestCaseMap = new KeyPairCollection();
    this.MultipleTestTime = null;
    this.MultipleTestComplete = false;

    this.Initialize = function ( collector ) {

        this.ServerNodeId = new UaNodeId( Identifier.Server );

        // Set up a timer for a chance to call acknowledge on multiple events
        this.MultipleTestTime = UaDateTime.utcNow();
        var maxTestTime = collector.GetMaximumTestTime() * 0.8;
        this.MultipleTestTime.addMilliSeconds( parseInt( maxTestTime.toString() ) );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Confirm.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge( eventFields ) ) {
                this.TestCaseMap.Set( conditionIdString, {
                    ConditionId: conditionId,
                    EventId: collector.GetSelectField( eventFields, "EventId" ),
                    TestCase: testCase,
                    State: this.States.Initial,
                    ConfirmedTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {

            if ( localTestCase.State == this.States.Initial ) {
                if ( collector.ShouldAcknowledge( eventFields )) {
                    print(this.TestName + ":" + conditionIdString + " Acknowledging" );

                    addCommentResult = collector.AcknowledgeAlarm( eventFields,
                        this.TestName + " Acknowledging Alarm",
                        gServerCapabilities.DefaultLocaleId );
                    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                        " Acknowledge Alarm " +  addCommentResult.toString());
    
                    return;
                }

                var nodeIdToUse = this.ServerNodeId;

                var result = collector.CommentCallEx( nodeIdToUse,
                    localTestCase.EventId,
                    "Confirm with Server node id " + this.ServerNodeId.toString(), 
                    gServerCapabilities.DefaultLocaleId,
                    Identifier.AcknowledgeableConditionType_Confirm );

                localTestCase.ConfirmedTime = collector.GetCallResponseTime();

                if ( this.CheckBadStatusCode( result ) ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Confirmed with Server node id " + this.ServerNodeId.toString() + 
                        " Status " + result.toString() );
                    testCase.TestsFailed++;
                }

                collector.TestCompleted( conditionId, this.TestName );
                localTestCase.State = this.States.Completed;
            } else if ( localTestCase.State == this.States.Completed ) {
                localTestCase.State = this.States.Unexpected;
            }
        }
    }

    this.NonEventCheck = function ( collector ) {
        if ( !this.MultipleTestComplete ) {
            if ( UaDateTime.utcNow() > this.MultipleTestTime ) {

                var identifier = new UaNodeId( Identifier.AcknowledgeableConditionType_Confirm );

                var keys = this.TestCaseMap.Keys();
                var checkMap = new KeyPairCollection();
                var methods = [];
                for ( var index = 0; index < keys.length; index++ ) {
                    var key = keys[ index ];
                    var testCase = this.TestCaseMap.Get( key );
                    if ( testCase.State == this.States.Completed ) {
                        var invalid = new UaVariant();
                        invalid.setByteString( collector.GenerateEventId() );
                        methods.push( {
                            MethodId: identifier,
                            ObjectId: this.ServerNodeId,
                            InputArguments: [ testCase.EventId, UaLocalizedText.New(
                                {
                                    Text: "MultiConfirm with Server node id",
                                    Locale: gServerCapabilities.DefaultLocaleId
                                } ) ]
                        } );
                        checkMap.Set( key, testCase );
                    }
                }

                if ( methods.length > 0 ) {
                    var callHelper = collector.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;
                    callHelper.Execute( {
                        MethodsToCall: methods,
                        SuppressMessaging: true
                    } );

                    print( this.TestName + " performing multi acknowledgement call for " + methods.length + " events" );


                    if ( isDefined( callHelper.Response ) && isDefined( callHelper.Response.Results ) ) {
                        var checkKeys = checkMap.Keys();
                        var results = callHelper.Response.Results;
                        for ( index = 0; index < results.length; index++ ) {
                            var result = results[ index ];
                            if ( !this.CheckBadStatusCode( result.StatusCode ) ) {
                                var key = checkKeys[ index ];
                                var testCase = checkMap.Get( key );
                                collector.AddMessage( testCase, collector.Categories.Error, testCase.ConditionId.toString() +
                                    " Unexpected error doing multiple acknowledge: " + result.toString() );
                                testCase.TestsFailed++;
                            }
                        }
                    } else {
                        addError( this.TestName + " Call for multiple Confirmments failed " );
                        stopCurrentUnit();
                    }
                } else {
                    print( this.TestName + " Received no events to acknowledge" );
                }

                this.MultipleTestComplete = true;
            }
        }
    }

    this.NonEventCheck = function ( collector ) {
        CUVariables.Confirm.MultipleTest( collector, this,
            new ExpectedAndAcceptedResults( [
                StatusCode.BadNodeIdUnknown,
                StatusCode.BadMethodInvalid
            ] )  );
    }

    // Callback for Multiple Test
    this.CreateMethod = function( key, testCase ){
        return {
            MethodId: CUVariables.Confirm.MethodId,
            ObjectId: this.ServerNodeId,
            InputArguments: [ testCase.EventId, UaLocalizedText.New(
                {
                    Text: "MultiConfirm with Server node id",
                    Locale: gServerCapabilities.DefaultLocaleId
                } ) ]
        };
    }

    this.CheckBadStatusCode = function ( statusCode ) {
        var expectedStatusCode = false;

        if ( statusCode.StatusCode == StatusCode.BadNodeIdUnknown ||
             statusCode.StatusCode == StatusCode.BadMethodInvalid ) {
            expectedStatusCode = true;
        }

        return expectedStatusCode;
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
        Test.Execute( { Procedure: Err_009 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_009 } );
    }
}