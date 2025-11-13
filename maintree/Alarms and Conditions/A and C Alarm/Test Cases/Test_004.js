/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:  
        If the InputNode property is not null, Select an alarm and read the value of the nodeid that was returned from the InputNode property

    Expectation:
        The read returns a valid value (no errors)
*/

function Test_004 () {

    this.TestName = "Test_004";

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !CUVariables.Alarm.CanRunAlarmCondition( eventFields, collector ) ){
            testCase.TestsSkipped++;
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var inputNodeVariant = collector.GetSelectField( eventFields, "InputNode" );
        var hasInputVar = false;
        if ( inputNodeVariant.DataType == BuiltInType.NodeId ){
            var inputNode = inputNodeVariant.toNodeId();
            if ( !UaNodeId.IsEmpty( inputNode ) ){
                hasInputVar = true;
                var readInputNodes = MonitoredItem.fromNodeIds( inputNode );
                var readResult = ReadHelper.Execute({ NodesToRead: readInputNodes });
                if ( readResult ){
                    var dataValue = readInputNodes[0].Value;
                    if ( dataValue.StatusCode.isGood() ){
                        testCase.TestsPassed++;
                    }else{
                        collector.AddMessage( testCase, collector.Categories.Error, 
                            conditionIdString + " Input node " + inputNode.toString() + 
                            " Has bad status " + dataValue.StatusCode.toString() );
                        testCase.TestsFailed++;
                    }
                }else{
                    collector.AddMessage( testCase, collector.Categories.Error, 
                        conditionIdString + " Unable to read input node " + inputNode.toString() );
                    testCase.TestsFailed++;
                }
            }
        }

        if ( !hasInputVar ){
            if ( !isDefined( testCase.NotImplemented ) ){
                testCase.NotImplemented = [];
            }
            testCase.NotImplemented.push( "Unable to run " + this.TestName + " for conditionId " + conditionIdString + 
                " due to null InputNode.  Requires ManualTest" );
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

