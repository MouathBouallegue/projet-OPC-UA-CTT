/*
    File maintree/Aggregates/Aggregate - Base/Err-004.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

    For each supported aggregate, issue a read where the default aggregate configuration settings are overridden.								
*/

function aggregate_err_004( ){

    var configuration = AggregateHelper.GetDefaultConfiguration();
    configuration.UseServerCapabilitiesDefaults = false;
    configuration.PercentDataGood = 99;
    configuration.PercentDataBad =  98;

    var testItems = AggregateHelper.CopyItems( CUVariables.Items );

    var couldBeGoodStatus = true;

    return AggregateHelper.PerformExpectedErrorTest( CUVariables, testItems, configuration,
        StatusCode.BadAggregateConfigurationRejected, couldBeGoodStatus);
}

Test.Execute( { Procedure: aggregate_err_004 } );