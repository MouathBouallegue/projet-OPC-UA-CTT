/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        "Add a VERY LARGE comment (lengths shown below), i.e. in a loop: 
        - 500
        - 1000
        - 2500
        - 5000"

    Test Requirements:
        Up to the limit on the size of a string or 5000 which ever is less

    Expectation:
        Service result: Good
        Operation results: Good or BadOutOfRange

    How this test works:
*/

function Err_007 () {

    this.TestName = "Err_007";
    this.States = {
        Initial: "Initial",
        Wait500: "Wait500",
        Wait1000: "Wait1000",
        Wait2500: "Wait2500",
        Wait5000: "Wait5000",
        WaitCustom: "WaitCustom",
        Skipped: "Skipped",
        Failed: "Failed",
        Complete: "Complete"
    }

    this.MaxLengths = [ 500, 1000, 2500, 5000 ];

    this.TestCaseMap = new KeyPairCollection();
    this.CompareStringLength = true;
    this.MaxStringLength = 5000;
    this.Message = "";

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
                    LengthIndex: 0,
                    CommentTime: null,
                    Comment: null,
                } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );
        print( conditionIdString + " State " + localTestCase.State );
        var runAnotherComment = false;
        if ( localTestCase.State == this.States.Initial ) {
            runAnotherComment = true;
        } else if ( localTestCase.State.indexOf( "Wait" ) == 0 ) {
            if ( this.CanCompareComments( eventFields, localTestCase, collector ) ) {
                var commentVariant = collector.GetSelectField( eventFields, "Comment" );
                if ( collector.ValidateDataType( commentVariant, BuiltInType.LocalizedText ) ) {
                    var comment = commentVariant.toLocalizedText();
                    if ( isDefined( comment ) ) {
                        if ( comment.Text == localTestCase.Comment ) {
                            // Increment the state, and the index
                            localTestCase.LengthIndex++;
                            if ( localTestCase.Comment.length <= this.MaxStringLength &&
                                localTestCase.LengthIndex < this.MaxLengths.length ) {
                                runAnotherComment = true;
                            } else {
                                //  TestCompleted
                                localTestCase.TestCase.TestsPassed++;
                                localTestCase.State = this.States.Complete;
                                collector.TestCompleted( conditionId, this.TestName );
                            }
                        } else {
                            localTestCase.TestCase.TestsFailed++;
                            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                                conditionIdString + " Unexpected Event Comment Expected " +
                                localTestCase.Comment + " Actual " + comment.Text );
                            localTestCase.State = this.States.Failed;
                            collector.TestCompleted( conditionId, this.TestName );
                        }
                    } else {
                        localTestCase.TestCase.TestsFailed++;
                        collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                            conditionIdString + " Invalid Event Comment" );
                        localTestCase.State = this.States.Failed;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                } else {
                    localTestCase.TestCase.TestsFailed++;
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                        conditionIdString + " Invalid Event Comment DataType" );
                    localTestCase.State = this.States.Failed;
                    collector.TestCompleted( conditionId, this.TestName );
                }
            }
        }

        if ( runAnotherComment ) {
            var newComment = this.GetString( localTestCase, collector );
            if ( newComment.length > 0 ) {

                localTestCase.Comment = newComment;

                var result = collector.AddComment( eventFields, localTestCase.Comment,
                    gServerCapabilities.DefaultLocaleId,
                    Identifier.ConditionType_AddComment );

                localTestCase.CommentTime = collector.GetCallResponseTime();

                if ( result.isGood() || result.StatusCode == StatusCode.BadOutOfRange ) {
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Activity,
                        conditionIdString + "Compare Comment Success: Comment length " +
                        localTestCase.Comment.length + " Result " + result.toString() );
                    this.UpdateCommentState( newComment, localTestCase );
                } else {
                    localTestCase.State = this.States.Failed;
                    localTestCase.TestCase.TestsFailed++;
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                        conditionIdString + " Unable to Comment with length of " +
                        localTestCase.Comment.length + " result " + result.toString() +
                        " Expecting Good, or BadOutOfRange" );
                    collector.TestCompleted( conditionId, this.TestName );
                }
            } else {
                addError( "Unexpected Error - comment to write is zero length" );
                stopCurrentUnit();
            }
        }
    }

    this.MakeCall = function ( localTestCase ) {
        var makeCall = false;

        if ( isDefined( localTestCase ) ) {
            if ( localTestCase.State != this.States.Skipped &&
                localTestCase.State != this.States.Failed &&
                localTestCase.State != this.States.Complete ) {
                makeCall = true;
            }
        }
        return makeCall;
    }

    this.GetStringLength = function ( localTestCase ) {
        var stringLength = 0;

        if ( this.MakeCall( localTestCase ) ) {
            if ( localTestCase.LengthIndex < this.MaxLengths.length ) {
                stringLength = this.MaxLengths[ localTestCase.LengthIndex ];
                if ( stringLength > this.MaxStringLength ) {
                    stringLength = this.MaxStringLength;
                }
            }
        }

        return stringLength;
    }

    this.GetString = function ( localTestCase, collector ) {

        if ( this.CompareStringLength ) {
            if ( isDefined( gServerCapabilities.MaxStringLength ) && 
                gServerCapabilities.MaxStringLength > 0 ) {
                if ( this.MaxStringLength > gServerCapabilities.MaxStringLength ) {
                    this.MaxStringLength = gServerCapabilities.MaxStringLength;
                }
            }
            print( this.TestName + " Setting max String Length to " + this.MaxStringLength );
            this.CompareStringLength = false;
        }

        if ( this.Message.length == 0 ) {
            var message = "";
            for ( var index = 0; index < this.MaxStringLength; index++ ) {
                message += collector.GenerateGuidCharacter();
            }
            this.Message = message;
        }

        var string = "";

        var stringLength = this.GetStringLength( localTestCase );
        if ( stringLength > 0 ) {

            var buildString = localTestCase.ConditionId.toString() + ":Length Index[" +
                localTestCase.LengthIndex + "] ActualLength = " + stringLength + ":";

            if ( buildString.length > stringLength ) {
                string = buildString.substring( 0, stringLength );
            } else {
                var requiredCharacters = stringLength - buildString.length;
                string = buildString + this.Message.substring( 0, requiredCharacters );
            }
        }

        return string;
    }

    this.CanCompareComments = function ( eventFields, localTestCase, collector ) {

        var canCompare = false;

        var eventTime = collector.GetSelectField( eventFields, "Time" );

        if ( collector.ValidateDataType( eventTime, BuiltInType.DateTime ) ) {
            var existingEventTime = eventTime.toDateTime();
            if ( localTestCase.CommentTime.msecsTo( existingEventTime ) > 0 ) {
                canCompare = true;
            } else {
                localTestCase.TestCase.TestsSkipped++;
                localTestCase.State = this.States.Skipped;
                collector.AddMessage( localTestCase.TestCase, collector.Categories.Skipped,
                    localTestCase.ConditionId.toString() + " Non Comment Event - Skipping" );
                collector.TestCompleted( localTestCase.ConditionId, this.TestName );
            }
        } else {
            localTestCase.TestCase.TestsFailed++;
            localTestCase.State == this.States.Failed;
            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                conditionIdString + " Unable to get Event Time" );
            collector.TestCompleted( conditionId, this.TestName );
        }

        return canCompare;
    }

    this.UpdateCommentState = function ( newComment, localTestCase ) {
        if ( newComment.length == this.MaxLengths[ 0 ] ) {
            localTestCase.State = this.States.Wait500;
        } else if ( newComment.length == this.MaxLengths[ 1 ] ) {
            localTestCase.State = this.States.Wait500;
        } else if ( newComment.length == this.MaxLengths[ 2 ] ) {
            localTestCase.State = this.States.Wait500;
        } else if ( newComment.length == this.MaxLengths[ 3 ] ) {
            localTestCase.State = this.States.Wait500;
        } else {
            localTestCase.State = this.States.WaitCustom;
        };
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
        Test.Execute( { Procedure: Err_007 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_007 } );
    }
}