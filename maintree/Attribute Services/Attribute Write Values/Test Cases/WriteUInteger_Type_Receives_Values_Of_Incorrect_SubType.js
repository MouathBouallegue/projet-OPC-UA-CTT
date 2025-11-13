/*  Test  prepared by Nathan Pocock; compliance@opcfoundation.org
     Description: write to a node of type UINTEGER where the data-type of the value is specified as SByte, Int16, Int32, and Int64 */

function write582err020() {
    const SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/UInteger";
    var item = MonitoredItem.fromSettingsExt( { Settings: [ SETTING ], Writable: true, SkipCreateSession: true } )[0];
    if( !isDefined( item ) ) { 
        addSkipped( "UInteger data-type not configured or not writable, please check the setting: " + SETTING + "." );
        return( false );
    };

    var expectation = [ new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ) ];
    if( isDefined( item ) ) {
        // sbyte
        UaVariant.SetValueMin( { Item: item, Type: BuiltInType.SByte } );
        WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectation } );
        // int16
        UaVariant.SetValueMin( { Item: item, Type: BuiltInType.Int16 } );
        WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectation } );
        // int32
        UaVariant.SetValueMin( { Item: item, Type: BuiltInType.Int32 } );
        WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectation } );
        // int64
        UaVariant.SetValueMin( { Item: item, Type: BuiltInType.Int64 } );
        WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectation } );
    }
    return( true );
}

Test.Execute( { Procedure: write582err020 } );