/*
    File maintree/Aggregates/Aggregate - Base/001-01.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

    For each supported aggregate, select startTime, endTime, 
    processingInterval from within the recorded range for a single node where: 		
        startTime = endTime								
        processingInterval = any								
        useServerCapabilitiesDefaults = TRUE								
*/

function aggregate_001_01() {

    return AggregateHelper.PerformSingleNodeTest( 
        CUVariables, 
        AggregateHelper.AggregateProcessIntervalDefinition.IntervalOne, 
        AggregateHelper.AggregateTimeDefinition.StartEqualsEnd, 
        AggregateHelper.GetDefaultConfiguration(),
        AggregateHelper.AggregateRequestDefinition.StartRequest
    ).status;
}

Test.Execute( { Procedure: aggregate_001_01 } );