/*
    File maintree/Aggregates/Aggregate - Base/005-01.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

For each supported aggregate, select startTime, endTime, processingInterval from within the recorded range for a single node where (note, some variations may not apply to the particular aggregate):								
-           both startTime and endTime are before start of data								
-           processingInterval = any								
-           userServerCapabilitiesDefauts = TRUE								
(Ideally the range selected holds uncertain values)								
*/

function aggregate_005_01() {

    var results = AggregateHelper.PerformSingleNodeTest( 
        CUVariables, 
        AggregateHelper.AggregateProcessIntervalDefinition.IntervalNoData, 
        AggregateHelper.AggregateTimeDefinition.StartAndEndBeforeData, 
        AggregateHelper.GetDefaultConfiguration(),
        AggregateHelper.AggregateRequestDefinition.StartRequest
    );
    
    var result = false;

    if ( AggregateHelper.CheckResultsForDataValuesSize( results, 1 ) )
    {
        result = AggregateHelper.CheckResultsForStatus( CUVariables.AggrenameName, results,
            AggregateHelper.AggregateBoundingDefinition.All,
            AggregateHelper.AggregateValueIndexDefinition.First,
            AggregateHelper.AggregateStatusDefinition.IsBad);
    }

    return result;
}

Test.Execute( { Procedure: aggregate_005_01 } );