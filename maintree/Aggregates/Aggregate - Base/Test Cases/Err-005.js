/*
    File maintree/Aggregates/Aggregate - Base/Err-005.js

    This script is being reused by other Aggregation conformance units. 
    In the initialize.js of each Conformance Unit the AggregateHelper object
    is being initialized with a different parameter identifying the 
    Conformance Unit which is currently tested. 
    The cleanup script ( maintree/Aggregates/Aggregate - Base/cleanup.js )
    is being reused as well.

For each supported aggregate, incorrectly apply an aggregate to a node that cannot support the aggregate, e.g. Minimum on GUID.
*/

function aggregate_err_005( ){

    var result = true;

    if ( AggregateHelper.AggregateSupportsNonNumericAndDiscrete( CUVariables.AggregateName )){
        addLog("No need to test aggregate: " + CUVariables.AggregateName); 
    }else{
        var testItems = [];

        var allTestItems = AggregateHelper.CopyItems( CUVariables.Items );
        allTestItems.forEach( function ( testItem ) {
            var index = testItem.NodeSetting.indexOf( AggregateHelper.AggregateDataType.NonNumeric );
            if ( index > 0 ) {
                testItems.push( testItem );
            }
        } );

        if ( isDefined( testItems ) && isDefined( testItems.length ) && testItems.length > 0 ){
        
            var couldBeGoodStatus = false;
        
            result = AggregateHelper.PerformExpectedErrorTest( CUVariables, testItems, 
                AggregateHelper.GetDefaultConfiguration(),
                StatusCode.BadAggregateNotSupported, couldBeGoodStatus);
        }else{
            addLog("No Non Numeric items, nothing to test");
        }
    }

    return result;
}

Test.Execute( { Procedure: aggregate_err_005 } );