/*
    File maintree/Aggregates/Aggregate - Base/008-02.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

For a node of type discrete, each supported/applicable aggregate and select a 
startTime, endTime, and a processingInterval from the recorded range.								
*/

function aggregate_008_02() {

    var result = true;

    if ( AggregateHelper.AggregateSupportsDiscrete(CUVariables.AggregateName)){
        result = AggregateHelper.PerformSingleNodeTest( 
            CUVariables, 
            AggregateHelper.AggregateProcessIntervalDefinition.IntervalTenIntervals, 
            AggregateHelper.AggregateTimeDefinition.StartBeforeEnd, 
            AggregateHelper.GetDefaultConfiguration(),
            AggregateHelper.AggregateRequestDefinition.StartRequest
        ).status;
    }else{
        print("Test aggregate_008_02 does not apply to aggregate " + CUVariables.AggregateName + " Skipping");
    }

    return result;
}

Test.Execute( { Procedure: aggregate_008_02 } );