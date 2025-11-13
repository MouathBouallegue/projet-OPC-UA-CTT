/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Use of IndexRange for writing to a range of indexes of a multi-dimensional array where the last 3 elements of each dimension in the array are written.
                    This test will be done for each data-type.
                    However, also write to other elements in the array too.
    Expectation:    Service result is `Good`
                    Operation level result is `Good`
                    Only the specified elements are written. Verify with a Read().
    Note:           This test case only applies, when the server supports multi-dimensional arrays.
 */

function attributeWriteIndex010() {
    var TC_Variables = new Object();
    TC_Variables.result = true;

    // Get the multi dimensional array nodes from CTT settings
    TC_Variables.MDArrays = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.MDArrays.Settings );
    if ( TC_Variables.MDArrays.length < 1 ) {
        addSkipped( "No MultiDimensionalArray items configured. Please check settings." );
        return ( false );
    }
    // Read the ArrayDimensions
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        TC_Variables.MDArrays[i].AttributeId = Attribute.ArrayDimensions;
    }
    ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays } );
    // Store the received value for the ArrayDimensions attribute
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        TC_Variables.MDArrays[i].ArrayDimensions = TC_Variables.MDArrays[i].Value.Value.toUInt32Array();
        TC_Variables.MDArrays[i].AttributeId = Attribute.Value;
    }
    // Are the configured nodes multi dimensional arrays?
    for( var i = TC_Variables.MDArrays.length - 1; i > -1; i-- ) {
        if ( TC_Variables.MDArrays[i].ArrayDimensions.length < 2 ) {
            addSkipped( "The node configured as multi dimensional array: '" + TC_Variables.MDArrays[i].NodeSetting + "', can not be used for testing because the ArrayDimension attribute indicates that it is not a multi dimensional array. Received value for ArrayDimensions: " + TC_Variables.MDArrays[i].ArrayDimensions + "." );
            TC_Variables.MDArrays.splice( i, 1 );
        }
    }
    // Can we use the configured arrays for this test?
    ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays } );
    for( var i = TC_Variables.MDArrays.length - 1; i > -1; i-- ) {
        if ( ReadHelper.Response.ResponseHeader.ServiceResult.isNotGood() ) return ( false );
        if ( ReadHelper.Response.Results[i].StatusCode.isNotGood() ) {
            addSkipped( "The node configured as multi dimensional array: '" + TC_Variables.MDArrays[i].NodeSetting + "', can not be used for testing because the initial Read failed." );
            TC_Variables.MDArrays.splice( i, 1 );
            continue;
        }
        else {
            getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
        }
        var dimLength = true;
        for ( var s = 0; s < TC_Variables.MDArrays[i].Dimensions.length; s++ ) {
            if ( TC_Variables.MDArrays[i].Dimensions[s] < 3 ) {
                dimLength = false;
            }
        }
        if ( dimLength == false ) {
            addSkipped( "The node configured as multi dimensional array: '" + TC_Variables.MDArrays[i].NodeSetting + "', can not be used for testing because one of dimensions has a unusable length." );
            TC_Variables.MDArrays.splice( i, 1 );
            continue;
        }
    }
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        var indexString = "";
        for ( var s = 0; s < TC_Variables.MDArrays[i].ArrayDimensions.length; s++ ) {
            if ( s != 0 ) indexString += ",";
            indexString += ( TC_Variables.MDArrays[i].Dimensions[s] - 3 ) + ":" + ( TC_Variables.MDArrays[i].Dimensions[s] - 1 );
        }
        TC_Variables.MDArrays[i].IndexRange = indexString;
        ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays[i] } );
        if ( ReadHelper.Response.ResponseHeader.ServiceResult.isNotGood() || ReadHelper.Response.Results[0].StatusCode.isNotGood() ) {
            addSkipped( "Skipping ReadVerification of the node: " + TC_Variables.MDArrays[i].NodeSetting + ", because the Write failed." );
            TC_Variables.result = false;
            continue;
        }
        else {
            UaVariant.Increment( { Item: TC_Variables.MDArrays[i] } );
            getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
            TC_Variables.MDArrays[i].OriginalValue = TC_Variables.MDArrays[i].MatrixValues;
            WriteHelper.Execute( { NodesToWrite: TC_Variables.MDArrays[i], OperationResults: new ExpectedAndAcceptedResults( StatusCode.Good ), CheckNotSupported: true, ReadVerification: false } );
            if (WriteHelper.Response.Results[0].StatusCode == StatusCode.BadWriteNotSupported) {
                // Server seems to not support writing to IndexRanges, so we can stop the whole loop.
                break;
            }
            if ( WriteHelper.Response.ResponseHeader.ServiceResult.isNotGood() || WriteHelper.Response.Results[0].isNotGood() ) {
                addSkipped( "Skipping ReadVerification of the node: " + TC_Variables.MDArrays[i].NodeSetting + ", because the Write failed with " + WriteHelper.Response.Results[0] );
                continue;
            }
            ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays[i] } );
            getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
            if ( Assert.Equal( Math.pow( 3, TC_Variables.MDArrays[i].Dimensions.length ), TC_Variables.MDArrays[i].MatrixValues.length, "Received an unexpected length of values for node: " + TC_Variables.MDArrays[i].NodeSetting + "." ) ) TC_Variables.result = false;
            if ( Assert.Equal( TC_Variables.MDArrays[i].OriginalValue, TC_Variables.MDArrays[i].MatrixValues, "Received an unexpected value for node: " + TC_Variables.MDArrays[i].NodeSetting + "." ) ) TC_Variables.result = false;
        }
    }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: attributeWriteIndex010 } );