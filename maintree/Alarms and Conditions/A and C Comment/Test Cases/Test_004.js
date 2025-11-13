/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	Specify a string using an available local (other than english)
        2	Confirm that the ConditionId now has the localized txt
        3	repeat for all supported locale above 
    
    Test Requirements:
        1   Multiple locale are available on the server
        2
        3   Support by CTT and application 

    Expectation:
        1   Success
        2   Event notification received with the Comment. [note may require a session for that locale]
        3   Repeat

    How this test works:
*/

function Test_004 () {

    this.TestName = "Test_004";
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
    this.MultipleLocales = null;
    this.Locale = null;

    this.MeetsRequirements = function () {
        if ( this.MultipleLocales == null ) {
            this.MultipleLocales = false;
            if ( isDefined( gServerCapabilities.LocaleIdArray ) &&
                isDefined( gServerCapabilities.LocaleIdArray.length ) &&
                gServerCapabilities.LocaleIdArray.length > 1 ) {
                this.MultipleLocales = true;
                this.Locale = gServerCapabilities.LocaleIdArray[ 1 ];
            }
        }

        return this.MultipleLocales;
    }

    this.CanRunTest = function ( conditionId, testCase, collector ) {

        var canRunTest = false;

        // Can run test initiates the state machine for this test
        if ( collector.CanRunTest( conditionId, this.TestName ) ) {
            if ( this.MeetsRequirements() ){
                canRunTest = true;
            } else {
                testCase.TestsSkipped++;
                collector.AddMessage( testCase, collector.Categories.Skipped, 
                    conditionId.toString() + " skipped due to only one supported Locale" );
                collector.TestCompleted( conditionId, this.TestName );
            }

        }

        return canRunTest;
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !this.CanRunTest( conditionId, testCase, collector ) ) {
            return;
        }


        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            this.TestCaseMap.Set( conditionIdString,
                {
                    TestCase: testCase,
                    State: this.States.Initial,
                    InitialFields: eventFields,
                    CommentTime: null,
                    Comment: null,
                } );
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( localTestCase.State == this.States.Initial ) {
            localTestCase.Comment = conditionIdString + ":" + this.TestName + ":" + 
            UaDateTime.utcNow().toString();

            var result = collector.AddComment( eventFields, localTestCase.Comment,
                this.Locale,
                Identifier.ConditionType_AddComment );

            localTestCase.CommentTime = collector.GetCallResonseTime();

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
                    localTestCase.TestCase.TestsSkipped++;
                    localTestCase.State = this.States.Skipped;
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Skipped,
                        conditionIdString + " Non Comment Event - Skipping" );
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
        Test.Execute( { Procedure: Test_004 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_004 } );
    }
}