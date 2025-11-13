/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Add multiple (separate) comments to a single Event in a single "Call".
        2	Confirm that the ConditionId now include the comment (new event generated)
    
    Expectation:
        1   Success
        2   At least Event notification is received with one of the comments issued.

    Note: in a load-balanced scenario there might not be any way to assure order of execution if the methods were invoked in by separate CPUs/Servers etc.

    How this test works:
*/

function Test_002 () {

    this.TestName = "Test_002";
    this.States = {
        Initial: "Initial",
        Commented: "Commented",
        FailedToComment: "FailedToComment",
        WaitingForConfirmation: "WaitingForConfirmation",
        FailedConfirmation: "FailedConfirmation",
        Skipped: "Skipped",
        Completed: "Completed"
    };


    this.TestCaseMap = new KeyPairCollection();
    this.CommentCount = 2;

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }


        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString,
                {
                    ConditionId: conditionId,
                    TestCase: testCase,
                    State: this.States.Initial,
                    Retry: false,
                    InitialFields: eventFields,
                    CommentTime: null,
                    Comments: [],
                    EventId: eventFields[ collector.EventIdIndex ]
                } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        print( conditionIdString + " State " + localTestCase.State );
        // Mantis 8315 - Comment could be null
        var commentVariant = collector.GetSelectField( eventFields, "Comment" );
        if ( commentVariant.DataType > 0 ) {
            print( conditionIdString + " Check the comment " + commentVariant.toString() );
        }

        if ( localTestCase.State == this.States.Initial ) {
            var retain = collector.GetSelectField( eventFields, "Retain" ).toBoolean();
            if ( retain ) {
                var result = this.SendComments( conditionIdString, localTestCase, collector );

                if ( result ) {
                    localTestCase.InitialFields = eventFields;
                    localTestCase.State = this.States.WaitingForConfirmation;
                } else {
                    localTestCase.State = this.States.FailedToComment;
                    localTestCase.TestCase.TestsFailed++;
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                        conditionIdString + " Unable to Comment " + result.toString() );
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else {
                collector.AddMessage( localTestCase.TestCase, collector.Categories.Activity,
                    conditionIdString + " Waiting for opportunity to comment" );
            }
        } else if ( localTestCase.State == this.States.WaitingForConfirmation ) {
            localTestCase.State = this.States.FailedConfirmation;

            var eventTime = collector.GetSelectField( eventFields, "Time" );

            if ( collector.ValidateDataType( eventTime, BuiltInType.DateTime ) ) {
                var existingEventTime = eventTime.toDateTime();

                print( conditionIdString + " event time " + eventTime.toString() + " comment time " + localTestCase.CommentTime.toString() +
                    " comment " + collector.GetSelectField( eventFields, "Comment" ) );

                if ( localTestCase.CommentTime.msecsTo( existingEventTime ) >= 0 ) {
                    var commentVariant = collector.GetSelectField( eventFields, "Comment" );
                    if ( collector.ValidateDataType( commentVariant, BuiltInType.LocalizedText ) ) {
                        var comment = commentVariant.toLocalizedText();
                        if ( isDefined( comment ) ) {

                            var success = false;
                            for ( var index = 0; index < localTestCase.Comments.length; index++ ) {
                                if ( comment.Text == localTestCase.Comments[ index ] ) {
                                    success = true;
                                    break;
                                }
                            }

                            if ( success ) {
                                localTestCase.TestCase.TestsPassed++;
                                localTestCase.State = this.States.Complete;
                            } else {
                                localTestCase.TestCase.TestsFailed++;
                                collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                                    conditionIdString + " Unexpected Event Comment Received" + comment.Text );
                            }
                        } else {
                            localTestCase.TestCase.TestsFailed++;
                            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                                conditionIdString + " Invalid Event Comment" );
                        }
                    }
                    else {
                        localTestCase.TestCase.TestsFailed++;
                        collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                            conditionIdString + " Unable to get Event Comment" );
                    }
                } else {
                    if ( localTestCase.Retry == false ) {
                        collector.AddMessage( localTestCase.TestCase, collector.Categories.Skipped,
                            conditionIdString + " Non Comment Event - Skipping and retrying" );
                        localTestCase.TestCase.TestsSkipped++;
                        localTestCase.State = this.States.Initial;
                        localTestCase.Retry = true;
                        return;
                    } else {
                        localTestCase.TestCase.TestsSkipped++;
                        localTestCase.State = this.States.Skipped;
                        collector.AddMessage( localTestCase.TestCase, collector.Categories.Skipped,
                            conditionIdString + " Non Comment Event - Skipping" );
                    }
                }
            } else {
                localTestCase.TestCase.TestsFailed++;
                collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                    conditionIdString + " Unable to get Event Time" );
            }
            collector.TestCompleted( conditionId, this.TestName );
        }
    }

    this.SendComments = function ( conditionIdString, localTestCase, collector ) {

        var methods = [];
        for ( var index = 0; index < this.CommentCount; index++ ) {
            var comment = conditionIdString + ":" + this.TestName + ":" +
                index + ":" + UaDateTime.utcNow().toString();
            localTestCase.Comments.push( comment );

            var commentText = UaLocalizedText.New( {
                Text: comment,
                Locale: gServerCapabilities.DefaultLocaleId
            } );
            var commentVariant = new UaVariant();
            commentVariant.setLocalizedText( commentText );

            methods.push( {
                MethodId: new UaNodeId( Identifier.ConditionType_AddComment ),
                ObjectId: localTestCase.ConditionId,
                InputArguments: [ localTestCase.EventId, commentVariant ]
            } );
        }

        var callHelper = collector.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;
        var result = callHelper.Execute( {
            MethodsToCall: methods,
            SuppressMessaging: true
        } );

        localTestCase.CommentTime = collector.GetCallResponseTime();

        return result;
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
        Test.Execute( { Procedure: Test_002 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_002 } );
    }
}