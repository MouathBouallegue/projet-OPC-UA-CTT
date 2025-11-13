/*
    File maintree/Aggregates/Aggregate - Base/003-04.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

For each supported aggregate, select startTime, endTime, processingInterval from within the recorded range for a single node where: 								
-           startTime < endTime								
-           processingInterval < Range such that Range/processingInterval will yield several (e.g. 10 or more) values								
-           userServerCapabilitiesDefauts = FALSE								
-           treatUncertainAsBad = FALSE								
-           percentDataBad = 100								
-           percentDataGood = 100								
-           UseSlopedExtrapolation = FALSE								
*/

function aggregate_003_04() {

    var configuration = AggregateHelper.GetDefaultConfiguration();
    configuration.UseDefaults = false;
    configuration.UseSlopedExtrapolation = false;

    return AggregateHelper.PerformSingleNodeTest( 
        CUVariables, 
        AggregateHelper.AggregateProcessIntervalDefinition.IntervalTenIntervals, 
        AggregateHelper.AggregateTimeDefinition.StartBeforeEnd, 
        configuration,
        AggregateHelper.AggregateRequestDefinition.BadOrStartRequest
    ).status;
}

Test.Execute( { Procedure: aggregate_003_04 } );