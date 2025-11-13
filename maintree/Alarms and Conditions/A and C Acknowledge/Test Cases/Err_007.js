/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	create event subscription and find condition in subscription
        2	Invoke acknowledge method passing an invalid ConditionId to the call service
        3	Repeat for multiple events

    Expectation: - See Mantis 6944 for clarification
        1    Acknowledgeable condition notification is received where AckedState=FALSE
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
        this.MultipleTestTime = CUVariables.Acknowledge.GetRunMultipleTestTime( collector );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Acknowledge.CanRunTest( this.TestName, eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {
            if ( collector.ShouldAcknowledge(eventFields)){
                this.TestCaseMap.Set( conditionIdString, {
                    ConditionId: conditionId,
                    EventId: collector.GetSelectField( eventFields, "EventId" ),
                    TestCase: testCase,
                    State: this.States.Initial,
                    AcknowledgementTime: null
                } );
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );

        if ( isDefined( localTestCase ) ) {
            if ( localTestCase.State == this.States.Initial ) {

                var result = collector.CommentCallEx( this.UnknownNodeId,
                    localTestCase.EventId,
                    "Acknowledge with Invalid node id " + this.UnknownNodeId.toString(), gServerCapabilities.DefaultLocaleId,
                    Identifier.AcknowledgeableConditionType_Acknowledge );

                localTestCase.AcknowledgementTime = collector.GetCallResponseTime();

                if ( this.CheckBadStatusCode( result ) ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Acknowledged with invalid node id " + this.UnknownNodeId.toString() + " result " + result.toString());
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
        CUVariables.Acknowledge.MultipleTest( collector, this );
    }

    // Callback for Multiple Test
    this.CreateMethod = function( key, testCase, collector ){
        var invalid = new UaVariant();
        invalid.setByteString( collector.GenerateEventId() );
        return {
            MethodId: CUVariables.Acknowledge.MethodId,
            ObjectId: this.UnknownNodeId,
            InputArguments: [ testCase.EventId, UaLocalizedText.New(
                {
                    Text: "MultiAcknowledge with unknown node id",
                    Locale: gServerCapabilities.DefaultLocaleId
                } ) ]
        };
    }

    this.CheckBadStatusCode = function ( statusCode ) {
        var expectedStatusCode = false;

        print( "CheckBadStatusCode expected " + StatusCode.BadNodeIdUnknown + " received " + statusCode.StatusCode );
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