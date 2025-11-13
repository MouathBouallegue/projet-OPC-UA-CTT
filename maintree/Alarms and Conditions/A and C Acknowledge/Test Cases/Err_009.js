/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	create event subscription and find condition in subscription
        2	Invoke acknowledge method passing an invalid existing Objectid As the conditionId 
            (not an Alarm instance or valid condition, but a valid Object - i.e. server object or some other object) 
            to the call service
        3	Repeat for multiple events

    Expectation:
        1    Acknowledgeable condition notification is received where AckedState=FALSE
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

                var result = collector.CommentCallEx( this.ServerNodeId,
                    localTestCase.EventId,
                    "Acknowledge with Server node id " + this.ServerNodeId.toString(), gServerCapabilities.DefaultLocaleId,
                    Identifier.AcknowledgeableConditionType_Acknowledge );

                localTestCase.AcknowledgementTime = collector.GetCallResponseTime();

                if ( this.CheckBadStatusCode( result ) ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Acknowledged with Server node id " + this.ServerNodeId.toString() + 
                        " Unexpected status " + result.toString() );
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
    this.CreateMethod = function( key, testCase ){
        return {
            MethodId: CUVariables.Acknowledge.MethodId,
            ObjectId: this.ServerNodeId,
            InputArguments: [ testCase.EventId, UaLocalizedText.New(
                {
                    Text: "MultiAcknowledge with Server node id",
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