include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/indexRangeRelatedUtilities.js" );

include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/Helpers.js" );

addLog( "TESTING AN -- OPTIONAL -- CONFORMANCE UNIT" );

if( !Test.Connect() ) stopCurrentUnit();
else {
    // read the original values of all scalar types, because we will revert to their original values at the end of the test 
    //var originalScalarValues = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings );
    var originalScalarValues = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: true } );
    if( originalScalarValues !== null && originalScalarValues.length !== 0 ) {
        if( !ReadHelper.Execute( { NodesToRead: originalScalarValues } ) ) {
            addError( "Unable to read the initial values of the test nodes. Aborting testing." );
            stopCurrentUnit();
        }
        else {
            for( var i=0; i<originalScalarValues.length; i++ ) originalScalarValues[i].OriginalValue = originalScalarValues[i].Value.Value.clone();
            Test.PostTestFunctions.push( revertToOriginalValues );
        }
    }

    // read the original values of all array types, because we will revert to their original values at the end of the test 
    var originalArrayValues = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.Settings, Writable: true, SkipCreateSession: true } );
    if( originalArrayValues !== null && originalArrayValues.length !== 0 ) {
        if( !ReadHelper.Execute( { NodesToRead: originalArrayValues } ) ) {
            addError( "Unable to read the initial values of the test nodes. Aborting testing." );
            stopCurrentUnit();
        }
        else {
            for( var i=0; i<originalArrayValues.length; i++ ) originalArrayValues[i].OriginalValue = originalArrayValues[i].Value.Value.clone();
            Test.PostTestFunctions.push( revertToOriginalArrayValues );
        }
    }

    if( ( !isDefined( originalScalarValues ) || originalScalarValues.length == 0 ) && 
        ( !isDefined( originalArrayValues ) || originalArrayValues == 0 ) ) {
        addSkipped( "Unable to find any writtable test nodes. Aborting testing and skipping this unit." );
        stopCurrentUnit();
    }
    // var items = originalScalarValues.concat( originalArrayValues ); // we need to do a concat later when the increment for arrays has been implemented
    var items = originalScalarValues;
}

function revertToOriginalValues() {
    print("\n\n\n\n~~~ Reverting scalar static nodes back to their original values ~~~");
    var ScalarExpectedOperationResults = [];
    for (var i = 0; i < originalScalarValues.length; i++) {
        originalScalarValues[i].Value.Value = originalScalarValues[i].OriginalValue.clone();
        ScalarExpectedOperationResults.push(new ExpectedAndAcceptedResults([StatusCode.Good, StatusCode.BadNotWritable]));
    }
    WriteHelper.Execute({ NodesToWrite: originalScalarValues, ReadVerification: false, ServiceResult: new ExpectedAndAcceptedResults([StatusCode.Good, StatusCode.BadWriteNotSupported]), OperationResults: ScalarExpectedOperationResults } );
}
function revertToOriginalArrayValues() {
    print("~~~ Reverting array static nodes back to their original values ~~~");
    var ArrayExpectedOperationResults = [];
    for (var i = 0; i < originalArrayValues.length; i++) {
        originalArrayValues[i].Value.Value = originalArrayValues[i].OriginalValue.clone();
        ArrayExpectedOperationResults.push(new ExpectedAndAcceptedResults([StatusCode.Good, StatusCode.BadNotWritable]));
    }
    WriteHelper.Execute({ NodesToWrite: originalArrayValues, ReadVerification: false, ServiceResult: new ExpectedAndAcceptedResults([StatusCode.Good, StatusCode.BadWriteNotSupported]), OperationResults: ArrayExpectedOperationResults });
}