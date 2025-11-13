/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Write to the Value attribute (without statusCode, sourceTimestamp, or serverTimestamp) of several nodes which have aValueRank of a multi-dimensional array. Write the entire multi-dimensional array.
                    This test should be done for each supported data-type.
    Expectation:    Service result is `Good`
                    Operation level result is `Good`
                    Only the requested elements are returned to the client.
    Note:           This test case only applies, when the server supports multi-dimensional arrays.
 */

function attributeWriteValues021() {
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
            addSkipped( "The node configured as multi dimensional array: '" + TC_Variables.MDArrays[i].NodeSetting + "', can not be used for testing. Reading the value failed." );
            TC_Variables.MDArrays.splice( i, 1 );
        }
        else {
            getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
        }
    }
    // Now to increment
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        UaVariant.Increment( { Item: TC_Variables.MDArrays[i] } );
        getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
        TC_Variables.MDArrays[i].OriginalValue = TC_Variables.MDArrays[i].MatrixValues;
    }
    WriteHelper.Execute( { NodesToWrite: TC_Variables.MDArrays, ReadVerification: false } ); 
    ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays } );
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        if ( WriteHelper.Response.ResponseHeader.ServiceResult.isNotGood() || WriteHelper.Response.Results[i].isNotGood() ) {
            addSkipped( "Skipping ReadVerification of the node: " + TC_Variables.MDArrays[i].NodeSetting + ", because the Write failed." );
            continue;
        }
        getMatrixValues( { Item: TC_Variables.MDArrays[i] } );
        if ( TC_Variables.MDArrays[i].MatrixValues.length != TC_Variables.MDArrays[i].OriginalValue.length ) {
            addError( "Skipping ReadVerification of the node: " + TC_Variables.MDArrays[i].NodeSetting + ", because we received an unexpected length for the flat array. Expected length: " + TC_Variables.MDArrays[i].OriginalValue.length + ", received length: " + TC_Variables.MDArrays[i].MatrixValues.length );
            TC_Variables.result = false;
            continue;
        }
        for ( var s = 0; s < TC_Variables.MDArrays[i].MatrixValues.length; s++ ) {
            if ( !Assert.Equal( TC_Variables.MDArrays[i].OriginalValue[s], TC_Variables.MDArrays[i].MatrixValues[s], "ReadVerification of Item: " + TC_Variables.MDArrays[i].NodeSetting + ", failed." ) ) {
                TC_Variables.result = false;
            }
        }
    }

    return ( TC_Variables.result );
}

Test.Execute( { Procedure: attributeWriteValues021 } );