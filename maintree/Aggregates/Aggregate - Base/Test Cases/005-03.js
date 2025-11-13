/*
    File maintree/Aggregates/Aggregate - Base/005-03.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

For each supported aggregate, select startTime, endTime, processingInterval from within the recorded range 
for a single node where (note, some variations may not apply to the particular aggregate):								
-           startTime such that a starting bound is not found								
-           processingInterval = any								
-           userServerCapabilitiesDefauts = TRUE
*/

function aggregate_005_03() {

    var results = AggregateHelper.PerformSingleNodeTest( 
        CUVariables, 
        AggregateHelper.AggregateProcessIntervalDefinition.IntervalTenIntervals, 
        AggregateHelper.AggregateTimeDefinition.StartingBoundNotFound, 
        AggregateHelper.GetDefaultConfiguration(),
        AggregateHelper.AggregateRequestDefinition.StartRequest
    );

    var result = false;

    var expectedResultsPerBoundingType = {
        None: AggregateHelper.AggregateStatusDefinition.IsGood,
        Simple: AggregateHelper.AggregateStatusDefinition.IsGood,
        Interpolated: AggregateHelper.AggregateStatusDefinition.IsBad
    };

    result = AggregateHelper.CheckResultsForStatusPerBounding( 
        CUVariables.AggregateName, results,
        AggregateHelper.AggregateValueIndexDefinition.First,
        expectedResultsPerBoundingType );

    return result;
}

Test.Execute( { Procedure: aggregate_005_03 } );