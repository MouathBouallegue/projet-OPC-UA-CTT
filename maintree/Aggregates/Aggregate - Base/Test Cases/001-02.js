/*
    File maintree/Aggregates/Aggregate - Base/001-02.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

    For each supported aggregate, select startTime, endTime, 
    processingInterval from within the recorded range for a single node where: 		
        startTime < endTime								
        processingInterval = 0								
        useServerCapabilitiesDefaults = TRUE								
*/

function aggregate_001_02() {

    return AggregateHelper.PerformSingleNodeTest( 
        CUVariables, 
        AggregateHelper.AggregateProcessIntervalDefinition.IntervalZero, 
        AggregateHelper.AggregateTimeDefinition.StartBeforeEnd, 
        AggregateHelper.GetDefaultConfiguration(),
        AggregateHelper.AggregateRequestDefinition.StartRequest
    ).status;
}

Test.Execute( { Procedure: aggregate_001_02 } );