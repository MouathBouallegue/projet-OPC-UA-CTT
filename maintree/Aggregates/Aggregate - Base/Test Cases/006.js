/*
    File maintree/Aggregates/Aggregate - Base/006.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

For each supported aggregate, select a startTime, endTime, and processingInterval 
from within the recorded range for a single node except the range contains NO DATA.								
*/

function aggregate_006() {

    var results = AggregateHelper.PerformSingleNodeTest( 
        CUVariables, 
        AggregateHelper.AggregateProcessIntervalDefinition.NoDataInRange, 
        AggregateHelper.AggregateTimeDefinition.NoDataInRange, 
        AggregateHelper.GetDefaultConfiguration(),
        AggregateHelper.AggregateRequestDefinition.StartRequest
    );

    var expectedResultsPerBoundingType = {
        None: AggregateHelper.AggregateStatusDefinition.IsBad,
        Simple: AggregateHelper.AggregateStatusDefinition.IsGood,
        Interpolated: AggregateHelper.AggregateStatusDefinition.IsGood
    };

    result = AggregateHelper.CheckResultsForStatusPerBounding( 
        CUVariables.AggregateName, results,
        AggregateHelper.AggregateValueIndexDefinition.First,
        expectedResultsPerBoundingType );


    return result;
}

Test.Execute( { Procedure: aggregate_006 } );