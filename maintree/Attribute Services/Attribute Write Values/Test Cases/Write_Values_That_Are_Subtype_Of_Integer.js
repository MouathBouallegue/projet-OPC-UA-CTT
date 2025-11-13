/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: write to a node of type INTEGER where the data-type of the value is specified as 
        SByte, Int16, Int32, and Int64; where the value is: - Data-type max - Data-type min */

function write582026() {
    const SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Integer";
    var item = MonitoredItem.fromSettingsExt( { Settings: [ SETTING ], Writable: true, SkipCreateSession: true } )[0];
    if( item == null ) { 
        addSkipped("Integer data-type not configured, please check setting: " + SETTING + " or not writable." );
        return( false );
    };
    // read the item first
    ReadHelper.Execute( { NodesToRead: item } );
    // sbyte
    addLog( "SByte -> Integer" );
    UaVariant.SetValueMax( { Item: item, Type: BuiltInType.SByte } );
    WriteHelper.Execute( { NodesToWrite: item } );
    UaVariant.SetValueMin( { Item: item, Type: BuiltInType.SByte } );
    WriteHelper.Execute( { NodesToWrite: item } );
    
    // int16
    addLog( "Int16 -> Integer" );
    UaVariant.SetValueMax( { Item: item, Type: BuiltInType.Int16 } );
    WriteHelper.Execute( { NodesToWrite: item } );
    UaVariant.SetValueMin( { Item: item, Type: BuiltInType.Int16 } );
    WriteHelper.Execute( { NodesToWrite: item } );

    // int32
    addLog( "Int32 -> Integer" );
    UaVariant.SetValueMax( { Item: item, Type: BuiltInType.Int32 } );
    WriteHelper.Execute( { NodesToWrite: item } );
    UaVariant.SetValueMin( { Item: item, Type: BuiltInType.Int32 } );
    WriteHelper.Execute( { NodesToWrite: item } );

    // int64
    addLog( "Int64 -> Integer" );
    UaVariant.SetValueMax( { Item: item, Type: BuiltInType.Int64 } );
    WriteHelper.Execute( { NodesToWrite: item } );
    UaVariant.SetValueMin( { Item: item, Type: BuiltInType.Int64 } );
    WriteHelper.Execute( { NodesToWrite: item } );
    return( true );
}

Test.Execute( { Procedure: write582026 } );