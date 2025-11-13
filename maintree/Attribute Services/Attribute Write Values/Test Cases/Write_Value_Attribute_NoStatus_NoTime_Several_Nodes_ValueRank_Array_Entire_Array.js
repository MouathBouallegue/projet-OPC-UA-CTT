/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Write to the Value attribute (without statusCode, sourceTimestamp, or serverTimestamp) of several nodes that has a ValueRank of array. Write the entire array.
                    This test should be done for each supported data-type.
    Expectation:    Service result is `Good`.
                    Operation level is `Good`.
                    Verify the Values are written by issuing a Read() to compare values received vs. expected.
    Note:           This test case only applies, when the server supports arrays.  
 */

function attributeWriteValues019() {
    var TC_Variables = new Object();
    TC_Variables.result = true;

    // Get the array nodes from CTT settings
    TC_Variables.Arrays = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.Settings, Writable: true, SkipCreateSession: true } );
    if ( TC_Variables.Arrays.length < 1 ) {
        addSkipped( "No (writable) Array items configured. Please check settings." );
        return ( false );
    }
    ReadHelper.Execute( { NodesToRead: TC_Variables.Arrays } );
    for( var i = TC_Variables.Arrays.length - 1; i > -1; i-- ) {
        if ( ReadHelper.Response.ResponseHeader.ServiceResult.isNotGood() ) return ( false );
        if ( ReadHelper.Response.Results[i].StatusCode.isNotGood() ) {
            addSkipped( "The node configured as array: '" + TC_Variables.Arrays[i].NodeSetting + "', can not be used for testing. Reading the value failed." );
            TC_Variables.Arrays.splice( i, 1 );
            continue;
        }
        UaVariant.Increment( { Item: TC_Variables.Arrays[i] } );
        TC_Variables.Arrays[i].OriginalValue = TC_Variables.Arrays[i].Value.Value;
    }
    WriteHelper.Execute( { NodesToWrite: TC_Variables.Arrays, ReadVerification: false } );
    for ( var i = 0; i < TC_Variables.Arrays.length; i++ ) {
        ReadHelper.Execute( { NodesToRead: TC_Variables.Arrays[i] } );
        for ( var s = 0; s < TC_Variables.Arrays[i].Value.Value.length; s++ ) {
            Assert.Equal( TC_Variables.Arrays[i].OriginalValue[s], TC_Variables.Arrays[i].Value.Value[s], "Expected to receive the previously written value in the next Read(). Item tested: " + TC_Variables.Arrays[i].NodeSetting + "." );
        }
    }
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: attributeWriteValues019 } );