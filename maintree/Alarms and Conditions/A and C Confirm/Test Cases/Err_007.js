/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	create event subscription and find condition in subscription
        2	Invoke acknowledge method passing an invalid ConditionId to the call service
        3	Repeat for multiple events

    Expectation:
        1    Confirmable condition notification is received where confirmedState=FALSE
        2    Bad_NodeIdInvalid
        3    Bad_NodeIdInvalid
   
    How this test works:
*/

function Err_007 () {

    this.TestName = "Err_007";
    this.UnknownNodeId = null;

    this.States = {
        Initial: "Initial",
        Completed: "Completed",
        Unexpected: "Unexpected"
    }

    this.TestCaseMap = new KeyPairCollection();
    this.MultipleTestTime = null;
    this.MultipleTestComplete = false;

    this.Initialize = function ( collector ) {

        this.UnknownNodeId = new UaNodeId.fromString( Settings.Advanced.NodeIds.Invalid.Unknown1 );

        // Set up a timer for a chance to call acknowledge on multiple events
        this.MultipleTestTime = CUVariables.Confirm.GetRunMultipleTestTime( collector );
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

                var result = collector.CommentCallEx( this.UnknownNodeId,
                    localTestCase.EventId,
                    "Confirm with Invalid node id " + this.UnknownNodeId.toString(), 
                    gServerCapabilities.DefaultLocaleId,
                    Identifier.AcknowledgeableConditionType_Confirm );

                localTestCase.ConfirmedTime = collector.GetCallResponseTime();
    
                if ( this.CheckBadStatusCode( result ) ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Unexpected Confirm result for node id " + this.UnknownNodeId.toString() + 
                        " expected BadNodeIdUnknown actual " + result.toString() );
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
        CUVariables.Confirm.MultipleTest( collector, this );
    }

    // Callback for Multiple Test
    this.CreateMethod = function( key, testCase, collector ){
        var invalid = new UaVariant();
        invalid.setByteString( collector.GenerateEventId() );
        return {
            MethodId: CUVariables.Confirm.MethodId,
            ObjectId: this.UnknownNodeId,
            InputArguments: [ testCase.EventId, UaLocalizedText.New(
                {
                    Text: "MultiConfirm with unknown node id",
                    Locale: gServerCapabilities.DefaultLocaleId
                } ) ]
        };
    }

    this.CheckBadStatusCode = function ( statusCode ) {
        var expectedStatusCode = false;

        if ( statusCode.StatusCode == StatusCode.BadNodeIdUnknown ) {
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
        Test.Execute( { Procedure: Err_007 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_007 } );
    }
}