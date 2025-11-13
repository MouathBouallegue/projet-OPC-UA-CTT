/*
    File maintree/Aggregates/Aggregate - Base/005-04.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

For each supported aggregate, select startTime, endTime, processingInterval from within the recorded range for a single node where (note, some variations may not apply to the particular aggregate):								
-           endTime such that ending bound is not found								
-           processingInterval = any								
-           userServerCapabilitiesDefauts = TRUE								
*/


function aggregate_005_04() {

    var results = AggregateHelper.PerformSingleNodeTest( 
        CUVariables, 
        AggregateHelper.AggregateProcessIntervalDefinition.IntervalTenIntervals, 
        AggregateHelper.AggregateTimeDefinition.EndingBoundNotFound, 
        AggregateHelper.GetDefaultConfiguration(),
        AggregateHelper.AggregateRequestDefinition.EndEntry
    );

    return AggregateHelper.CheckResultsForAggregateBit( CUVariables.AggregateName, results, 
        AggregateHelper.AggregateBoundingDefinition.Bounding, 
        AggregateHelper.AggregateValueIndexDefinition.Last,
        AggregateBit.Interpolated );
}

Test.Execute( { Procedure: aggregate_005_04 } );