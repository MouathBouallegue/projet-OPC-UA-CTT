/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Specify an empty Comment. (the default locale is defined and the string is empty)
        2	Confirm that the ConditionId now has no comment
    
    Expectation:
        1	Success
        2	The event that is received does not include a comment

    How this test works:
*/

function Test_003 () {

    this.TestName = "Test_003";
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

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }


        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString,
                {
                    TestCase: testCase,
                    State: this.States.Initial,
                    InitialFields: eventFields,
                    CommentTime: null,
                    Retry: false,
                    Comment: null,
                } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        print( conditionIdString + " State " + localTestCase.State );

        if ( localTestCase.State == this.States.Initial ) {
            var retain = collector.GetSelectField( eventFields, "Retain" ).toBoolean();
            if ( retain ) {

                localTestCase.Comment = "";

                var localeId = gServerCapabilities.DefaultLocaleId;
                if ( localeId.length == 0 ) {
                    localeId = "en";
                }
                print( conditionIdString + " Adding Comment " );

                var result = collector.AddComment( eventFields, localTestCase.Comment,
                    localeId,
                    Identifier.ConditionType_AddComment );

                localTestCase.CommentTime = collector.GetCallResponseTime();

                if ( result.isGood() ) {
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
                if ( localTestCase.CommentTime.msecsTo( existingEventTime ) > 0 ) {
                    var commentVariant = collector.GetSelectField( eventFields, "Comment" );
                    if ( collector.ValidateDataType( commentVariant, BuiltInType.LocalizedText ) ) {
                        var comment = commentVariant.toLocalizedText();
                        if ( isDefined( comment ) ) {
                            if ( comment.Text == localTestCase.Comment ) {
                                localTestCase.TestCase.TestsPassed++;
                                localTestCase.State = this.States.Complete;
                            } else {
                                localTestCase.TestCase.TestsFailed++;
                                collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                                    conditionIdString + " Unexpected Event Comment Expected " +
                                    localTestCase.Comment + " Actual " + comment.Text );
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
                collector.TestCompleted( conditionId, this.TestName );
            }
            collector.TestCompleted( conditionId, this.TestName );
        }
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