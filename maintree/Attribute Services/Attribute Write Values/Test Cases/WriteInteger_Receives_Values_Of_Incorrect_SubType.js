/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: write to a node of type INTEGER where the data-type of the value is specified as SByte, UInt16, UInt32, and UInt64 */

function write582err021() {
    const SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Integer";
    var item = MonitoredItem.fromSettingsExt( { Settings: [ SETTING ], Writable: true, SkipCreateSession: true } )[0];
    if( !isDefined( item ) ) { 
        addSkipped( "Integer data-type not configured or not writable, please check the setting: " + SETTING + "." );
        return( false );
    };

    var expectation = [ new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ) ];
    if( isDefined( item ) ) {
        // sbyte
        UaVariant.SetValueMin( { Item: item, Type: BuiltInType.Byte } );
        WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectation } );

        // int16
        UaVariant.SetValueMin( { Item: item, Type: BuiltInType.UInt16 } );
        WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectation } );

        // int32
        UaVariant.SetValueMin( { Item: item, Type: BuiltInType.UInt32 } );
        WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectation } );

        // int64
        UaVariant.SetValueMin( { Item: item, Type: BuiltInType.UInt64 } );
        WriteHelper.Execute( { NodesToWrite: item, OperationResults: expectation } );
    }
    return( false );
}// function write582err021()

Test.Execute( { Procedure: write582err021 } );