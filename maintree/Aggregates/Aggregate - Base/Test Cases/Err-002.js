/*
    File maintree/Aggregates/Aggregate - Base/Err-002.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

    Issue a HistoryRead request specifying multiple NodesToRead and Aggregates, 
    except there are fewer aggregates than nodes.
*/

function aggregate_err_002() {

    var moreAggregates = false;
    return AggregateHelper.PerformMismatchTest( CUVariables, moreAggregates);
}

Test.Execute( { Procedure: aggregate_err_002 } );