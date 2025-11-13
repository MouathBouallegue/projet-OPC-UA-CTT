/*
    File maintree/Aggregates/Aggregate - Base/005-05.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

For each supported aggregate, select startTime, endTime, processingInterval from within the recorded range for a single node where (note, some variations may not apply to the particular aggregate):								
-           startTime such that the bounding value is bad								
-           processingInterval = any								
-           userServerCapabilitiesDefauts = TRUE								
*/

function aggregate_005_05() {

    var results = AggregateHelper.PerformSingleNodeTest( 
        CUVariables, 
        AggregateHelper.AggregateProcessIntervalDefinition.IntervalTenIntervals, 
        AggregateHelper.AggregateTimeDefinition.StartingBoundBad, 
        AggregateHelper.GetDefaultConfiguration(),
        AggregateHelper.AggregateRequestDefinition.BadDataStartRequest
    );

    var expectedResultsPerBoundingType = {
        None: AggregateHelper.AggregateStatusDefinition.IsBad,
        Simple: AggregateHelper.AggregateStatusDefinition.IsBad,
        Interpolated: AggregateHelper.AggregateStatusDefinition.IsUncertain
    };

    result = AggregateHelper.CheckResultsForStatusPerBounding( 
        CUVariables.AggregateName, results,
        AggregateHelper.AggregateValueIndexDefinition.First,
        expectedResultsPerBoundingType );

    return result;

}

Test.Execute( { Procedure: aggregate_005_05 } );