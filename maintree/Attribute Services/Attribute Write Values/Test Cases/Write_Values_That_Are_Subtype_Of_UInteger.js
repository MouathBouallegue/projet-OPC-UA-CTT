/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: write to a node of type UINTEGER where the data-type of the value is specified as Byte, UInt16, UInt32, and UInt64; where the value is:
        - Data-type max
        - Data-type min */
        
function write582025() {
    const SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/UInteger";
    var item = MonitoredItem.fromSettingsExt( { Settings: [ SETTING ], Writable: true, SkipCreateSession: true } )[0];
    if( item == null ) { 
        addSkipped( "UInteger not configured or not writable, please check setting: " + SETTING + "." );
        return( false );
    };

    // read the item first
    ReadHelper.Execute( { NodesToRead: item } );
    // byte
    addLog( "Byte -> UInteger" );
    UaVariant.SetValueMax( { Item: item, Type: BuiltInType.Byte } );
    WriteHelper.Execute( { NodesToWrite: item } );
    UaVariant.SetValueMin( { Item: item, Type: BuiltInType.Byte } );
    WriteHelper.Execute( { NodesToWrite: item } );
    
    // Uint16
    addLog( "UInt16 -> UInteger" );
    UaVariant.SetValueMax( { Item: item, Type: BuiltInType.UInt16 } );
    WriteHelper.Execute( { NodesToWrite: item } );
    UaVariant.SetValueMin( { Item: item, Type: BuiltInType.UInt16 } );
    WriteHelper.Execute( { NodesToWrite: item } );

    // Uint32
    addLog( "UInt32 -> UInteger" );
    UaVariant.SetValueMax( { Item: item, Type: BuiltInType.UInt32 } );
    WriteHelper.Execute( { NodesToWrite: item } );
    UaVariant.SetValueMin( { Item: item, Type: BuiltInType.UInt32 } );
    WriteHelper.Execute( { NodesToWrite: item } );

    // Uint64
    addLog( "UInt64 -> UInteger" );
    UaVariant.SetValueMax( { Item: item, Type: BuiltInType.UInt64 } );
    WriteHelper.Execute( { NodesToWrite: item } );
    UaVariant.SetValueMin( { Item: item, Type: BuiltInType.UInt64 } );
    WriteHelper.Execute( { NodesToWrite: item } );
    return( true );
}

Test.Execute( { Procedure: write582025 } );