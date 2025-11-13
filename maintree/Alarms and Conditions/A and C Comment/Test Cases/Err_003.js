/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Call AddComment on the ConditionType node.
    
    Expectation:
        Service result: Good
        Operation results: BadNodeIdInvalid

    How this test works:
*/

function Err_003() {

    this.TestName = "Err_003";

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }


        var result = collector.CommentCallEx( 
            CUVariables.Comment.ConditionTypeNodeId, 
            eventFields[ collector.EventIdIndex ],
            "AddComment on ConditionType should Fail", 
            gServerCapabilities.DefaultLocaleId, 
            Identifier.ConditionType_AddComment );
        
        if ( result.isBad() && result.StatusCode == StatusCode.BadNodeIdInvalid ){
            testCase.TestsPassed++;
        }else{
            collector.AddMessage( testCase, collector.Categories.Error, 
                conditionIdString + " AddMessage call expected BadNodeIdInvalid, actual " + result.toString() );
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
        Test.Execute( { Procedure: Err_003 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_003 } );
    }
}