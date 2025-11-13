/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Specify an EventId that is unknown (but is syntactically valid).
    
    Expectation:
        Service result: Good
        Operation results: BadEventIdUnknown

    How this test works:
*/

function Err_002() {

    this.TestName = "Err_002";

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ) {
            return;
        }

        var generated = collector.GenerateEventId();
        var generatedEventId = new UaVariant();
        generatedEventId.setByteString( generated );

        var result = collector.CommentCallEx( conditionId, 
            generatedEventId,
            "AddComment should Fail", 
            gServerCapabilities.DefaultLocaleId, 
            Identifier.ConditionType_AddComment );
        
        if ( result.isBad() && result.StatusCode == StatusCode.BadEventIdUnknown ){
            testCase.TestsPassed++;
        }else{
            collector.AddMessage( testCase, collector.Categories.Error, 
                conditionIdString + " AddMessage call expected BadEventIdUnknown, actual " + result.toString() );
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
        Test.Execute( { Procedure: Err_002 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Err_002 } );
    }
}