/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Read the Value attribute of a single Node where the Value attribute is of a different data-type and is an multi dimensional array.
                    This test will be done for each data-type.
    Expectation:    Service result is `Good`
                    Operation level result is `Good`
    Note:           This test case only applies, when the server supports multi-dimensional arrays.
 */

function attributeRead030() {
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
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        if ( TC_Variables.MDArrays[i].ArrayDimensions.length < 2 ) {
            addSkipped( "The node configured as multi dimensional array: '" + TC_Variables.MDArrays[i].NodeSetting + "', can not be used for testing because the ArrayDimension attribute indicates that it is not a multi dimensional array. Received value for ArrayDimensions: " + TC_Variables.MDArrays[i].ArrayDimensions + ".");
        }
    }
    // Now read the value attribute of the nodes
    for ( var i = 0; i < TC_Variables.MDArrays.length; i++ ) {
        ReadHelper.Execute( { NodesToRead: TC_Variables.MDArrays[i] } );
        if ( ReadHelper.Response.ResponseHeader.ServiceResult.isNotGood() ) TC_Variables.result = false;
        if ( ReadHelper.Response.Results[0].StatusCode.isNotGood() ) TC_Variables.result = false;
    }

    return ( TC_Variables.result );
}

Test.Execute( { Procedure: attributeRead030 } );