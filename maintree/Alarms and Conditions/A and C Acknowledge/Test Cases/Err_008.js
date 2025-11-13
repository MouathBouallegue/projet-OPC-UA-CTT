/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	create event subscription and find condition in subscription
        2	Invoke acknowledge method passing the nodeId of the conditionType node to the call service
        3	Repeat for multiple events

    Expectation:
        1    Acknowledgeable condition notification is received where AckedState=FALSE
        2    BadNodeIdInvalid
        3    BadNodeIdInvalid
   
    How this test works:
*/

function Err_008 () {

    this.TestName = "Err_008";
    this.ConditionTypeNodeId = null;

    this.States = {
        Initial: "Initial",
        Completed: "Completed",
        Unexpected: "Unexpected"
    }

    this.TestCaseMap = new KeyPairCollection();
    this.MultipleTestTime = null;
    this.MultipleTestComplete = false;

    this.Initialize = function ( collector ) {

        this.ConditionTypeNodeId = new UaNodeId( Identifier.ConditionType );

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

                var result = collector.CommentCallEx( this.ConditionTypeNodeId,
                    localTestCase.EventId,
                    "Acknowledge with ConditionType node id " + this.ConditionTypeNodeId.toString(), 
                    gServerCapabilities.DefaultLocaleId,
                    Identifier.AcknowledgeableConditionType_Acknowledge );

                localTestCase.AcknowledgementTime = collector.GetCallResponseTime();

                if ( this.CheckBadStatusCode( result ) ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Acknowledged with ConditionType node id " + this.ConditionTypeNodeId.toString() + 
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
        CUVariables.Acknowledge.MultipleTest( collector, this );
    }

    // Callback for Multiple Test
    this.CreateMethod = function( key, testCase ){
        return {
            MethodId: CUVariables.Acknowledge.MethodId,
            ObjectId: this.ConditionTypeNodeId,
            InputArguments: [ testCase.EventId, UaLocalizedText.New(
                {
                    Text: "MultiAcknowledge with ConditionType node id",
                    Locale: gServerCapabilities.DefaultLocaleId
                } ) ]
        };
    }

    this.CheckBadStatusCode = function ( statusCode ) {
        var expectedStatusCode = false;

        if ( statusCode.StatusCode == StatusCode.BadNodeIdInvalid ) {
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
        Test.Execute( { Procedure: Err_008 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_008 } );
    }
}