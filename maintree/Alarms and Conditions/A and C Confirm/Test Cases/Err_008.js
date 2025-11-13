/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        1	create event subscription and find condition in subscription
        2	Invoke acknowledge method passing the nodeId of the conditionType node to the call service
        3	Repeat for multiple events

    Expectation:
        1    Confirmable condition notification is received where confirmedState=FALSE
        2    Bad_NodeIdUnknown
        3    Bad_NodeIdUnknown
   
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
                localTestCase.ConfirmedTime = UaDateTime.utcNow();

                var result = collector.CommentCallEx( this.ConditionTypeNodeId,
                    localTestCase.EventId,
                    "Confirm with ConditionType node id " + this.ConditionTypeNodeId.toString(), 
                    gServerCapabilities.DefaultLocaleId,
                    Identifier.AcknowledgeableConditionType_Confirm );

                if ( this.CheckBadStatusCode( result ) ) {
                    testCase.TestsPassed++;
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                        " Confirmed with ConditionType node id " + this.ConditionTypeNodeId.toString() + 
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
        CUVariables.Confirm.MultipleTest( collector, this );
    }

    // Callback for Multiple Test
    this.CreateMethod = function( key, testCase ){
        return {
            MethodId: CUVariables.Confirm.MethodId,
            ObjectId: this.ConditionTypeNodeId,
            InputArguments: [ testCase.EventId, UaLocalizedText.New(
                {
                    Text: "MultiConfirm with ConditionType node id",
                    Locale: gServerCapabilities.DefaultLocaleId
                } ) ]
        };
    }

    this.CheckBadStatusCode = function ( statusCode ) {
        var expectedStatusCode = false;
  
        // Mantis Issue 5544/6944 - 
        // https://mantis.opcfoundation.org/view.php?id=5544
        // https://mantis.opcfoundation.org/view.php?id=6944
        // says that the status code should be BadNodeIdInvalid
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