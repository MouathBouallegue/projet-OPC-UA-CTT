/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Call the method but specify the ServerObject as the target object.
    
    Expectation:
        Service result: Good
        Operation results: BadMethodInvalid

    How this test works:
*/

function Err_005 () {

    this.TestName = "Err_005";
    this.NodeId = null;
    this.GetNodeId = function () {
        if ( this.NodeId == null ) {
            this.NodeId = new UaNodeId( Identifier.Server );
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
            "AddComment on Server should Fail",
            gServerCapabilities.DefaultLocaleId,
            Identifier.ConditionType_AddComment );

        if ( result.isBad() && result.StatusCode == StatusCode.BadMethodInvalid ) {
            testCase.TestsPassed++;
        } else {
            collector.AddMessage( testCase, collector.Categories.Error,
                conditionIdString + " AddMessage call expected BadMethodInvalid, actual " + result.toString() );
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
        Test.Execute( { Procedure: Err_005 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_005 } );
    }
}