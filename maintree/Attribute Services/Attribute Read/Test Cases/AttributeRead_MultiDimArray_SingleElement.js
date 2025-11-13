/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Use of IndexRange for reading a single element of a multi-dimensional array, in this case the 2nd element of the 2nd dimension.
                    This test will be done for each data-type.
    Expectation:    Service result is `Good`
                    Operation level result is `Good`
                    Only the requested element is returned to the client.
    Note:           This test case only applies, when the server supports multi-dimensional arrays.
 */

function attributeRead032() {
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
        getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
        if ( ReadHelper.Response.Results[i].StatusCode.isNotGood() || TC_Variables.MDArrays[i].Dimensions[1] < 2 ) {
            addSkipped( "The node configured as multi dimensional array: '" + TC_Variables.MDArrays[i].NodeSetting + "', can not be used for testing. Length of second dimension: " + TC_Variables.MDArrays[i].Dimensions[1] + "." );
            TC_Variables.MDArrays.splice( i, 1 );
            continue;
        }
        // Safe the value of the 2nd element of the 2nd dimension
        var x = 1;
        for ( var a = TC_Variables.MDArrays[i].Dimensions.length - 1; a > 1; a-- ) {
            x = x * TC_Variables.MDArrays[i].Dimensions[a];
        }
        TC_Variables.MDArrays[i].OriginalValue = UaVariantToSimpleType( TC_Variables.MDArrays[i].MatrixValues[x] );
    }
    // Now read the 2nd element of the 2nd dimension
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        var indexString = "0,1";
        for ( var s = 0; s < TC_Variables.MDArrays[i].ArrayDimensions.length; s++ ) {
            if ( s < 2 ) continue;
            indexString += ",0";
        }
        TC_Variables.MDArrays[i].IndexRange = indexString;
        ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays[i] } );
        if ( ReadHelper.Response.ResponseHeader.ServiceResult.isNotGood() || ReadHelper.Response.Results[0].StatusCode.isNotGood() ) {
            TC_Variables.result = false;
            addSkipped( TC_Variables.MDArrays[i].NodeSetting + ": skipping verification of the received value because the Read failed." );
            continue;
        }
        else {
            getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
            if ( Assert.Equal( 1, TC_Variables.MDArrays[i].MatrixValues.length, "Received an unexpected length of values for node: " + TC_Variables.MDArrays[i].NodeSetting + "." ) ) TC_Variables.result = false;
            if ( Assert.Equal( TC_Variables.MDArrays[i].OriginalValue, UaVariantToSimpleType( TC_Variables.MDArrays[i].MatrixValues[0] ), "Received an unexpected value for node: " + TC_Variables.MDArrays[i].NodeSetting + "." ) ) TC_Variables.result = false;
        }
    }

    return ( TC_Variables.result );
}

Test.Execute( { Procedure: attributeRead032 } );