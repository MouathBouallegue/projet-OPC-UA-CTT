/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Specify a Condition where the NodeId does not exist (but is syntactically valid).
    
    Expectation:
        Service result: Good
        Operation results: BadNodeIdUnknown

    How this test works:
*/

function Err_004 () {

    this.TestName = "Err_004";
    this.NodeId = null;
    this.GetNodeId = function () {
        if ( this.NodeId == null ) {
            this.NodeId = UaNodeId.fromString( Settings.Advanced.NodeIds.Invalid.Unknown1 );
        }
        return this.NodeId;
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }

        var result = collector.CommentCallEx(
            this.GetNodeId(),
            eventFields[ collector.EventIdIndex ],
            "AddComment on ConditionType should Fail",
            gServerCapabilities.DefaultLocaleId,
            Identifier.ConditionType_AddComment );

        if ( result.isBad() && result.StatusCode == StatusCode.BadNodeIdUnknown ) {
            testCase.TestsPassed++;
        } else {
            collector.AddMessage( testCase, collector.Categories.Error,
                conditionIdString + " AddMessage call expected BadNodeIdUnknown, actual " + result.toString() );
            testCase.TestsFailed++;
        }
        collector.TestCompleted( conditionId, this.TestName );
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
        Test.Execute( { Procedure: Err_004 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_004 } );
    }
}