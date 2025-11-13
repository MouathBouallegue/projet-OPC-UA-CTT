include( "./library/Base/warnOnce.js" );

var Settings = new Object();
Settings._bad_settings = [];
Settings.ArraysToFQPaths = function( folder, settings ) {
                            var s = [];
                            for( var i=0; i<settings.length; i++ )
                                s.push( folder + settings[i] );
                            return( s );
                      };
Settings.SafeRead = function( setting, args ) {
                          // search the _bad_settings first
                          for( var i=0; i<Settings._bad_settings.length; i++ ) {
                              if( Settings._bad_settings[i] === setting ) {
                                  _warning.store( "Setting '" + setting + "' is not configured." );
                                  return( null );
                              }
                          }
                          var v = null;
                          try {
                              v = readSetting( setting ).toString();
                          }
                          catch( excep ) {
                          }
                          if( v == null || v == "null" || v == "undefined" ) {
                              _warning.store( "Setting '" + setting + "' is not configured." );
                              return( null );
                          }
                          else {
                              if( args === undefined || args === null ) return( v );
                              if( args.Type !== undefined && args.Type === "bool" ) return( v == 2? true : false );
                          }
                      };

Settings.CreateArray = function( setting, separator ){
    var array = []; 
    var value = readSetting( setting );
    if ( value != null ){
        var stringValue = value.toString();
        if ( stringValue.length > 0 ){
            array = stringValue.split( separator );
        }
    }
    return array;
};                

Settings = {
    ServerTest: {
        ServerUrl:                          Settings.SafeRead( "/Server Test/Server URL" ).toString(),
        DefaultSubscriptionPublishInterval: Settings.SafeRead( "/Server Test/Default Subscription Publish Interval" ),
        DiagnosticInfoResponseTesting:      Settings.SafeRead( "/Server Test/DiagnosticInfo Response Testing", { Type: "bool" } ),
        TimeTolerance:                      Settings.SafeRead( "/Server Test/Time Tolerance" ),
        SubscriptionTimeout:                Settings.SafeRead( "/Server Test/Subscription Timeout" ),
        TimeSynchronizationChecking:        Settings.SafeRead( "/Server Test/Time Synchronization Checking", { Type: "bool" } ),
        Debug:                              Settings.SafeRead( "/Server Test/Debug", { Type: "bool" } ),
        ExposeTypeSystem:                   Settings.SafeRead( "/Server Test/Fully Exposed Type System", { Type: "bool" } ),
        Capabilities: {
            MaxStringLength:                   parseInt( readSetting( "/Server Test/Capabilities/Max String Length" ) ),
            MaxSupportedSessions:              parseInt( readSetting( "/Server Test/Capabilities/Max Supported Sessions" ) ),
            MaxSupportedSubscriptions:         parseInt( readSetting( "/Server Test/Capabilities/Max Supported Subscriptions" ) ),
            MaxSupportedMonitoredItems:        parseInt( readSetting( "/Server Test/Capabilities/Max Supported MonitoredItems" ) ),
            RetransmissionQueueSizePerSession: parseInt( readSetting( "/Server Test/Capabilities/Retransmission QueueSize per Session" ) ),
            FastestPublishIntervalSupported:   parseInt( readSetting( "/Server Test/Capabilities/Fastest Publish Interval Supported" ) ),
            FastestSamplingIntervalSupported:  parseInt( readSetting( "/Server Test/Capabilities/Fastest Sampling Interval Supported" ) ),
            MaxPublishRequestsPerSession:      parseInt( readSetting( "/Server Test/Capabilities/Max Publish Requests per Session" ) ),
            MaxSecureChannels:                 parseInt( readSetting( "/Server Test/Capabilities/Max SecureChannels" ) ),
            SecurityNoneEnabled:                         readSetting( "/Server Test/Capabilities/SecurityNone Enabled" ), 
            GoodCompletesAsynchronouslyDelay:  parseInt( readSetting( "/Server Test/Capabilities/GoodCompletesAsynchronously delay" ) ),
        },
        SecureChannel: {
            MessageSecurityMode:        readSetting( "/Server Test/Secure Channel/MessageSecurityMode" ),
            NetworkTimeout:             parseInt( readSetting( "/Server Test/Secure Channel/NetworkTimeout" ) ),
            RequestedLifetime: parseInt( readSetting( "/Server Test/Secure Channel/RequestedLifetime" ) ),
            MinLifetimeOfSecureChannel: parseInt( readSetting( "/Server Test/Secure Channel/Min Lifetime of SecureChannel" ) ),
            RequestedSecurityPolicyUri: readSetting( "/Server Test/Secure Channel/RequestedSecurityPolicyUri" ),
        },
        Session: {
            UserAuthenticationPolicy:  readSetting( "/Server Test/Session/UserAuthenticationPolicy" ),
            LoginNameGranted1:         readSetting( "/Server Test/Session/LoginNameGranted1" ),
            LoginPasswordGranted1:     readSetting( "/Server Test/Session/LoginPasswordGranted1" ),
            LoginNameGranted2:         readSetting( "/Server Test/Session/LoginNameGranted2" ),
            LoginPasswordGranted2:     readSetting( "/Server Test/Session/LoginPasswordGranted2" ),
            LoginNameAccessDenied:     readSetting( "/Server Test/Session/LoginNameAccessDenied" ),
            LoginPasswordAccessDenied: readSetting( "/Server Test/Session/LoginPasswordAccessDenied" ),
            DefaultTimeoutHint:        parseInt( readSetting( "/Server Test/Session/DefaultTimeoutHint" ) ),
            RequestedSessionTimeout:   parseInt( readSetting( "/Server Test/Session/RequestedSessionTimeout" ) ),
            MaxResponseMessageSize:    parseInt( readSetting( "/Server Test/Session/MaxResponseMessageSize" ) ),
        },
        NodeIds: {
            Static: {
                All: function() { return( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings.concat( 
                             Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.Settings ).concat( 
                             Settings.ServerTest.NodeIds.Static.DAProfile.DataItemType.Settings ).concat(
                             Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemType.Settings).concat(
                             Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemTypeArrays.Settings).concat(
                             Settings.ServerTest.NodeIds.Static.DAProfile.DiscreteItemType.Settings ).concat(
                             Settings.ServerTest.NodeIds.Static.DAProfile.MultiStateValueDiscreteType.Settings ).concat(
                             Settings.ServerTest.NodeIds.Static.DAProfile.ArrayItemType.Settings ) ) },
                AllProfiles: {
                    Scalar: {
                        Settings:         Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Scalar/", 
                                                        [ "Bool", "Byte", "ByteString", "DateTime", "Double", "Duration", "Float", "Guid", "Integer", "Int16", "Int32", "Int64", 
                                                          "LocaleId", "LocalizedText", "NodeId", "Number", "QualifiedName", "SByte", "String", "UInteger",
                                                          "UInt16", "UInt32", "UInt64", "UtcTime", "XmlElement", "Variant", "Enumeration", "Image", "ImageBMP", "ImageGIF", "ImageJPG", "ImagePNG" ] ),
                        NumericSettings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Scalar/", 
                                                        [ "Byte", "Double", "Float", "Int16", "Int32", "Int64", "SByte", "UInt16", "UInt32", "UInt64" ] ),
                        IntegerSettings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Scalar/", 
                                                        [ "Byte", "Int16", "Int32", "Int64", "SByte", "UInt16", "UInt32", "UInt64" ] ),
                        FloatSettings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Scalar/", 
                                                        [ "Double", "Float" ] ),
                        Bool:             Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool" ),
                        Byte:             Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte" ),
                        ByteString:       Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString" ),
                        DateTime:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime" ),
                        Double:           Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Double" ),
                        Duration:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Duration" ),
                        Float:            Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Float" ),
                        Guid:             Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid" ),
                        Integer:          Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Integer" ),
                        Int16:            Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16" ),
                        Int32:            Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32" ),
                        Int64:            Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64" ),
                        LocaleId:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/LocaleId" ),
                        LocalizedText:    Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/LocalizedText" ),
                        NodeId:           Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/NodeId" ),
                        Number:           Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Number" ),
                        QualifiedName:    Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/QualifiedName" ),
                        SByte:            Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte" ),
                        String:           Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/String" ),
                        UInteger:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/UInteger" ),
                        UInt16:           Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16" ),
                        UInt32:           Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32" ),
                        UInt64:           Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64" ),
                        UtcTime:          Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/UtcTime" ),
                        XmlElement:       Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/XmlElement" ),
                        Variant:          Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Variant" ),
                        Enumeration:      Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Enumeration" ),
                        Image:            Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/Image" ),
                        ImageBMP:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/ImageBMP" ),
                        ImageGIF:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/ImageGIF" ),
                        ImagePNG:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Scalar/ImagePNG" ),
                    }, // scalar
                    Arrays: {
                        Settings:      Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Arrays/", 
                                                        [ "Bool", "Byte", "ByteString", "DateTime", "Double", "Float", "Guid", 
                                                          "Int16", "Int32", "Int64", "SByte", "String",
                                                          "UInt16", "UInt32", "UInt64", "XmlElement", "Variant",
                                                          "LocalizedText", "QualifiedName" ] ),
                        NumericSettings:      Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Arrays/", 
                                                        [ "Byte", "Double", "Float", "Int16", "Int32", "Int64", "SByte", "UInt16", "UInt32", "UInt64" ] ),
                        Bool:          Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Bool" ),
                        Byte:          Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Byte" ),
                        ByteString:    Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString" ),
                        DateTime:      Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/DateTime" ),
                        Double:        Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Double" ),
                        Float:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Float" ),
                        Guid:          Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Guid" ),
                        Int16:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Int16" ),
                        Int32:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Int32" ),
                        Int64:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Int64" ),
                        SByte:         Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/SByte" ),
                        String:        Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/String" ),
                        UInt16:        Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt16" ),
                        UInt32:        Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt32" ),
                        UInt64:        Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt64" ),
                        XmlElement:    Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/XmlElement" ),
                        Variant:       Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/Variant" ),
                        LocalizedText: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/LocalizedText" ),
                        QualifiedName: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Arrays/QualifiedName" ),
                    }, // arrays
                    MDArrays: {
                        Settings: Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/",
                            ["Bool", "Byte", "ByteString", "DateTime", "Double", "Float", "Guid",
                                "Int16", "Int32", "Int64", "SByte", "String",
                                "UInt16", "UInt32", "UInt64", "XmlElement", "Variant",
                                "LocalizedText", "QualifiedName"] ),
                        NumericSettings: Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/",
                            ["Byte", "Double", "Float", "Int16", "Int32", "Int64", "SByte", "UInt16", "UInt32", "UInt64"] ),
                        Bool: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Bool" ),
                        Byte: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Byte" ),
                        ByteString: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/ByteString" ),
                        DateTime: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/DateTime" ),
                        Double: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Double" ),
                        Float: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Float" ),
                        Guid: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Guid" ),
                        Int16: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Int16" ),
                        Int32: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Int32" ),
                        Int64: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Int64" ),
                        SByte: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/SByte" ),
                        String: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/String" ),
                        UInt16: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/UInt16" ),
                        UInt32: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/UInt32" ),
                        UInt64: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/UInt64" ),
                        XmlElement: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/XmlElement" ),
                        Variant: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/Variant" ),
                        LocalizedText: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/LocalizedText" ),
                        QualifiedName: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Multi-Dimensional-Arrays/QualifiedName" ),
                    }, // MDarrays
                    Structures: {
                        Settings: Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/All Profiles/Structures/", [
                                                        "Structure001", "Structure002", "Structure003",
                                                        "Structure004", "Structure005" ] ),
                        Structure001: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Structures/Structure001" ),
                        Structure002: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Structures/Structure002" ),
                        Structure003: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Structures/Structure003" ),
                        Structure004: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Structures/Structure004" ),
                        Structure005: Settings.SafeRead( "/Server Test/NodeIds/Static/All Profiles/Structures/Structure005" ),
                    },
                }, // all profiles
                DAProfile: {
                    DataItemType: { 
                        Settings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/DataItemType/", [
                                                             "Byte", "Double", "Float", "Int16", "Int32", "Int64", "UInt16",
                                                             "UInt32", "UInt64", "SByte", "String", "DateTime" ] ),
                        Byte:      Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/Byte" ),
                        Double:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/Double" ),
                        Float:     Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/Float" ),
                        Int16:     Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/Int16" ),
                        Int32:     Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/Int32" ),
                        Int64:     Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/Int64" ),
                        UInt16:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/UInt16" ),
                        UInt32:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/UInt32" ),
                        UInt64:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/UInt64" ),
                        SByte:     Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/SByte" ),
                        String:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/String" ),
                        DateTime:  Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/DataItemType/DateTime" ),
                    }, // data item
                    AnalogItemType: {
                        Settings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/", [
                                                             "Byte", "Double", "Float", "Int16", "Int32", "Int64", "UInt16",
                                                             "UInt32", "UInt64", "SByte", "NodeIdWithEngineeringUnits", "NodeIdWithInstrumentRange" ] ),
                        NumericSettings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/", [
                                                             "Byte", "Double", "Float", "Int16", "Int32", "Int64", "UInt16",
                                                             "UInt32", "UInt64", "SByte" ] ),
                        Byte:   Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/Byte" ),
                        Double: Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/Double" ),
                        Float:  Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/Float" ),
                        Int16:  Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/Int16" ),
                        Int32:  Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/Int32" ),
                        Int64:  Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/Int64" ),
                        UInt16: Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/UInt16" ),
                        UInt32: Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/UInt32" ),
                        UInt64: Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/UInt64" ),
                        SByte:  Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/SByte" ),
                        NodeIdWithEngineeringUnits: Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/NodeIdWithEngineeringUnits" ),
                        NodeIdWithInstrumentRange:  Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/NodeIdWithInstrumentRange" ),
                    }, // analog type
                    AnalogItemTypeArrays: {
                        Settings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType Arrays/", [
                                                             "Double", "Float", "Int16", "Int32", "UInt16", "UInt32" ] ),
                        Int16:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType Arrays/Int16" ),
                        Int32:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType Arrays/Int32" ),
                        UInt16:   Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType Arrays/UInt16" ),
                        UInt32:   Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType Arrays/UInt32" ),
                        Float:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType Arrays/Float" ),
                        Double:   Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType Arrays/Double" ),
                    }, // analog type arrays
                    DiscreteItemType: { 
                        Settings:              Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/", [
                                                             "MultiStateDiscrete001", "MultiStateDiscrete002", "MultiStateDiscrete003",
                                                             "MultiStateDiscrete004", "MultiStateDiscrete005", "TwoStateDiscrete001",
                                                             "TwoStateDiscrete002", "TwoStateDiscrete003", "TwoStateDiscrete004", "TwoStateDiscrete005" ] ),
                        TwoStateDiscretes:     Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/", [
                                                             "TwoStateDiscrete001", "TwoStateDiscrete002", "TwoStateDiscrete003", "TwoStateDiscrete004", "TwoStateDiscrete005" ] ),
                        MultiStateDiscretes:   Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/", [
                                                             "MultiStateDiscrete001", "MultiStateDiscrete002", "MultiStateDiscrete003",
                                                             "MultiStateDiscrete004", "MultiStateDiscrete005" ] ),
                        MultiStateDiscrete001: readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/MultiStateDiscrete001" ),
                        MultiStateDiscrete002: readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/MultiStateDiscrete002" ),                       
                        MultiStateDiscrete003: readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/MultiStateDiscrete003" ),
                        MultiStateDiscrete004: readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/MultiStateDiscrete004" ),                    
                        MultiStateDiscrete005: readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/MultiStateDiscrete005" ),
                        TwoStateDiscrete001:   readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/TwoStateDiscrete001" ),
                        TwoStateDiscrete002:   readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/TwoStateDiscrete002" ),
                        TwoStateDiscrete003:   readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/TwoStateDiscrete003" ),
                        TwoStateDiscrete004:   readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/TwoStateDiscrete004" ),
                        TwoStateDiscrete005:   readSetting( "/Server Test/NodeIds/Static/DA Profile/DiscreteItemType/TwoStateDiscrete005" ),
                    }, // discrete types
                    MultiStateValueDiscreteType: { 
                        Settings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/", [
                                                             "Byte", "SByte", "Int16", "Int32", "Int64", "UInt16", "UInt32", "UInt64" ] ),
                        Byte:     Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/Byte" ),
                        SByte:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/SByte" ),
                        Int16:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/Int16" ),
                        Int32:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/Int32" ),
                        Int64:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/Int64" ),
                        UInt16:   Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/UInt16" ),
                        UInt32:   Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/UInt32" ),
                        UInt64:   Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/MultiStateValueDiscreteType/UInt64" ),
                    }, // multi state value discrete types
                    ArrayItemType: { 
                        Settings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/DA Profile/ArrayItemType/", [
                                                             "YArrayItemType", "XYArrayItemType", "ImageItemType", "CubeItemType", "NDimensionArrayItemType" ] ),
                        YArrayItemType:  Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/ArrayItemType/YArrayItemType" ),
                        XYArrayItemType: Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/ArrayItemType/XYArrayItemType" ),
                        ImageItemType:   Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/ArrayItemType/ImageItemType" ),
                        CubeItemType:    Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/ArrayItemType/CubeItemType" ),
                        NDimensionArrayItemType: Settings.SafeRead( "/Server Test/NodeIds/Static/DA Profile/ArrayItemType/NDimensionArrayItemType" ),
                    }, // array item type
                }, // DA Profile
                HAProfile: {
                    StructureNodeSupportingHistory:    Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/StructureNodeSupportingHistory" ),
                    NodeDoesNotSupportServerTimestamp: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/NodeDoesNotSupportServerTimestamp" ),
                    Debug:                             Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Debug" ),
                    Scalar: {
                        Settings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/HA Profile/Scalar/", [
                                                             "Bool", "Byte", "ByteString", "DateTime", "Double", "Float", "Int16", "Int32", "Int64", 
                                                             "UInt16", "UInt32", "UInt64", "SByte", "String", "XmlElement" ] ),
                        Bool:       Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/Bool" ),
                        Byte:       Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/Byte" ),
                        ByteString: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/ByteString" ),
                        DateTime:   Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/DateTime" ),
                        Double:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/Double" ),
                        Float:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/Float" ),
                        Int16:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/Int16" ),
                        Int32:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/Int32" ),
                        Int64:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/Int64" ),
                        SByte:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/SByte" ),
                        String:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/String" ),
                        UInt16:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/UInt16" ),
                        UInt32:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/UInt32" ),
                        UInt64:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/UInt64" ),
                        XmlElement: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Scalar/XmlElement" ),
                    },
                    Arrays: {
                        Settings:   Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/HA Profile/Arrays/", [
                                                             "Bool", "Byte", "ByteString", "DateTime", "Double", "Float", "Int16", "Int32", "Int64", 
                                                             "SByte", "String", "UInt16", "UInt32", "UInt64", "XmlElement",
                                                             "Bool2D", "Byte2D", "ByteString2D", "DateTime2D", "Double2D", "Float2D", "Int162D", "Int322D", "Int642D", 
                                                             "SByte2D", "String2D", "UInt162D", "UInt322D", "UInt642D", "XmlElement2D",
                                                             ] ),
                        OneD:       Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/HA Profile/Arrays/", [
                                                             "Bool", "Byte", "ByteString", "DateTime", "Double", "Float", "Int16", "Int32", "Int64", 
                                                             "SByte", "String", "UInt16", "UInt32", "UInt64", "XmlElement",
                                                             ] ),
                        TwoDs:      Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/HA Profile/Arrays/", [
                                                             "Bool2D", "Byte2D", "ByteString2D", "DateTime2D", "Double2D", "Float2D", "Int162D", "Int322D", "Int642D", 
                                                             "SByte2D", "String2D", "UInt162D", "UInt322D", "UInt642D", "XmlElement2D",
                                                             ] ),
                        Bool:       Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Bool" ),
                        Byte:       Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Byte" ),
                        ByteString: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/ByteString" ),
                        DateTime:   Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/DateTime" ),
                        Double:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Double" ),
                        Float:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Float" ),
                        Int16:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Int16" ),
                        Int32:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Int32" ),
                        Int64:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Int64" ),
                        SByte:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/SByte" ),
                        String:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/String" ),
                        UInt16:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/UInt16" ),
                        UInt32:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/UInt32" ),
                        UInt64:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/UInt64" ),
                        XmlElement: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/XmlElement" ),
                        Bool2D:       Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Bool2D" ),
                        Byte2D:       Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Byte2D" ),
                        ByteString2D: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/ByteString2D" ),
                        DateTime2D:   Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/DateTime2D" ),
                        Double2D:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Double2D" ),
                        Float2D:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Float2D" ),
                        Int162D:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Int162D" ),
                        Int322D:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Int322D" ),
                        Int642D:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/Int642D" ),
                        SByte2D:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/SByte2D" ),
                        String2D:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/String2D" ),
                        UInt162D:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/UInt162D" ),
                        UInt322D:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/UInt322D" ),
                        UInt642D:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/UInt642D" ),
                        XmlElement2D: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Arrays/XmlElement2D" ),
                    },
                    AccessRights: {
                        Settings:  Settings.ArraysToFQPaths( "/Server Test/NodeIds/Static/HA Profile/AccessRights/", [
                                                             "AccessLevel_ReadOnly", "AccessLevel_WriteOnly", "AccessLevel_None", "UserAccessLevel_ReadOnly",
                                                             "UserAccessLevel_WriteOnly", "UserAccessLevel_None" ] ),
                        AccessLevelReadOnly:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/AccessRights/AccessLevel_ReadOnly" ),
                        AccessLevelWriteOnly:     Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/AccessRights/AccessLevel_WriteOnly" ),
                        AccessLevelNone:          Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/AccessRights/AccessLevel_None" ),
                        UserAccessLevelReadOnly:  Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/AccessRights/UserAccessLevel_ReadOnly" ),
                        UserAccessLevelWriteOnly: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/AccessRights/UserAccessLevel_WriteOnly" ),
                        UserAccessLevelNone:      Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/AccessRights/UserAccessLevel_None" ),
                    },
                    Aggregates: {
                        ProcessingInterval: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/ProcessingInterval" ),
                        BooleanOne: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/BooleanOne" ),
                        StartOfBadDataBooleanOne: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/StartOfBadDataBooleanOne" ),
                        BooleanTwo: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/BooleanTwo" ),
                        StartOfBadDataBooleanTwo: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/StartOfBadDataBooleanTwo" ),
                        IntegerOne: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/IntegerOne" ),
                        StartOfBadDataIntegerOne: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/StartOfBadDataIntegerOne" ),
                        IntegerTwo: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/IntegerTwo" ),
                        StartOfBadDataIntegerTwo: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/StartOfBadDataIntegerTwo" ),
                        FloatOne: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/FloatOne" ),
                        StartOfBadDataFloatOne: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/StartOfBadDataFloatOne" ),
                        FloatTwo: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/FloatTwo" ),
                        StartOfBadDataFloatTwo: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/StartOfBadDataFloatTwo" ),
                        DoubleOne: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/DoubleOne" ),
                        StartOfBadDataDoubleOne: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/StartOfBadDataDoubleOne" ),
                        DoubleTwo: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/DoubleTwo" ),
                        StartOfBadDataDoubleTwo: Settings.SafeRead( "/Server Test/NodeIds/Static/HA Profile/Aggregates/StartOfBadDataDoubleTwo" ),
                    },
                }, // HA Profile
            }, // static
            References: {
                Settings:          Settings.ArraysToFQPaths( "/Server Test/NodeIds/References/", 
                                                        [ "Has 3 Forward References 1", "Has 3 Forward References 2", "Has 3 Forward References 3", "Has 3 Forward References 4", "Has 3 Forward References 5",
                                                          "Has Inverse And Forward References", "Has References of a ReferenceType and SubType", "Has 3 Inverse References 1" ] ),
                Has3ForwardRefs1:   Settings.SafeRead( "/Server Test/NodeIds/References/Has 3 Forward References 1" ),
                Has3ForwardRefs2:   Settings.SafeRead( "/Server Test/NodeIds/References/Has 3 Forward References 2" ),
                Has3ForwardRefs3:   Settings.SafeRead( "/Server Test/NodeIds/References/Has 3 Forward References 3" ),
                Has3ForwardRefs4:   Settings.SafeRead( "/Server Test/NodeIds/References/Has 3 Forward References 4" ),
                Has3ForwardRefs5:   Settings.SafeRead( "/Server Test/NodeIds/References/Has 3 Forward References 5" ),
                HasInverseForward:  Settings.SafeRead( "/Server Test/NodeIds/References/Has Inverse And Forward References" ),
                HasRefsOfTypeAndSubtype: Settings.SafeRead( "/Server Test/NodeIds/References/Has References of a ReferenceType and SubType" ),
                Has3InverseRefs1:   Settings.SafeRead( "/Server Test/NodeIds/References/Has 3 Inverse References 1" ),
            }, // References 
            Paths: { 
                StartingNode:  Settings.SafeRead( "/Server Test/NodeIds/Paths/Starting Node 1" ),
                UnknownPath:   Settings.SafeRead( "/Server Test/NodeIds/Paths/Unknown Path 1" ),
                MaxDepth:      Settings.SafeRead( "/Server Test/NodeIds/Paths/Max Depth" ),
            }, // paths
            NodeClasses: { 
                Settings:          Settings.ArraysToFQPaths( "/Server Test/NodeIds/NodeClasses/", 
                                                        [ "Variable", "Object", "Method", "ObjectType",
                                                          "VariableType", "ReferenceType", "DataType", "View" ] ),
                Variable:      Settings.SafeRead( "/Server Test/NodeIds/NodeClasses/Variable" ),
                Object:        Settings.SafeRead( "/Server Test/NodeIds/NodeClasses/Object" ),
                Method:        Settings.SafeRead( "/Server Test/NodeIds/NodeClasses/Method" ),
                ObjectType:    Settings.SafeRead( "/Server Test/NodeIds/NodeClasses/ObjectType" ),
                VariableType:  Settings.SafeRead( "/Server Test/NodeIds/NodeClasses/VariableType" ),
                ReferenceType: Settings.SafeRead( "/Server Test/NodeIds/NodeClasses/ReferenceType" ),
                DataType:      Settings.SafeRead( "/Server Test/NodeIds/NodeClasses/DataType" ),
                View:          Settings.SafeRead( "/Server Test/NodeIds/NodeClasses/View" ),
            }, // node classes
            SecurityAccess: { 
                Settings:          Settings.ArraysToFQPaths( "/Server Test/NodeIds/SecurityAccess/", 
                                                        [ "AccessLevel_CurrentRead", "AccessLevel_CurrentWrite", "AccessLevel_CurrentRead_NotUser", "AccessLevel_CurrentWrite_NotUser",
                                                          "AccessLevel_CurrentRead_NotCurrentWrite", "AccessLevel_CurrentWrite_NotCurrentRead" ] ),
                AccessLevelCurentRead:                 Settings.SafeRead( "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentRead" ),
                AccessLevelCurrentWrite:               Settings.SafeRead( "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentWrite" ),
                AccessLevelCurrentReadNotUser:         Settings.SafeRead( "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentRead_NotUser" ),
                AccessLevelCurrentWriteNotUser:        Settings.SafeRead( "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentWrite_NotUser" ),
                AccessLevelCurrentReadNotCurrentWrite: Settings.SafeRead( "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentRead_NotCurrentWrite" ),
                AccessLevelCurrentWriteNotCurrentRead: Settings.SafeRead( "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentWrite_NotCurrentRead" ),
            }, // security access
            NodeManagement: { 
                RootNode:                  Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/RootNode" ),
                RequestedNodeId:           Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/RequestedNodeId" ),
                RequestedNodeId_Namespace: Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/RequestedNodeId_Namespace" ),
                RequestedNodeId_IdString:  Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/RequestedNodeId_IdString" ),
                RequestedNodeId_IdNumeric: Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/RequestedNodeId_IdNumeric" ),
                RequestedNodeId_IdGuid:    Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/RequestedNodeId_IdGuid" ),
                SupportedAttributes: {
                    AccessLevel:     Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/AccessLevel",     { Type: "bool" } ),
                    ArrayDimensions: Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/ArrayDimensions", { Type: "bool" } ),
                    BrowseName:      Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/BrowseName",      { Type: "bool" } ),
                    DataType:        Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/DataType",        { Type: "bool" } ),
                    Description:     Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/Description",     { Type: "bool" } ),
                    DisplayName:     Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/DisplayName",     { Type: "bool" } ),
                    EventNotifier:   Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/EventNotifier",   { Type: "bool" } ),
                    Executable:      Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/Executable",      { Type: "bool" } ),
                    Historizing:     Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/Historizing",     { Type: "bool" } ),
                    InverseName:     Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/InverseName",     { Type: "bool" } ),
                    Method:          Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/Method",          { Type: "bool" } ),
                    MinimumSamplingInterval: Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/MinimumSamplingInterval", { Type: "bool" } ),
                    NodeClass:       Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/NodeClass",       { Type: "bool" } ),
                    UserAccessLevel: Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/UserAccessLevel", { Type: "bool" } ),
                    UserExecutable:  Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/UserExecutable",  { Type: "bool" } ),
                    UserWriteMask:   Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/UserWriteMask",   { Type: "bool" } ),
                    WriteMask:       Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/WriteMask",       { Type: "bool" } ),
                    NodeId:          Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/NodeId",          { Type: "bool" } ),
                    Value:           Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/Value",           { Type: "bool" } ),
                    ValueRank:       Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedAttributes/ValueRank",       { Type: "bool" } ),
                },
                SupportedReferences: {
                    Organizes:         Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/Organizes",                      { Type: "bool" } ),
                    HasEventSource:    Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasEventSource",                 { Type: "bool" } ),
                    HasModellingRule:  Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasModellingRule",               { Type: "bool" } ),
                    HasEncoding:       Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasEncoding",                    { Type: "bool" } ),
                    HasDescription:    Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasDescription",                 { Type: "bool" } ),
                    HasTypeDefinition: Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasTypeDefinition",              { Type: "bool" } ),
                    GeneratesEvent:    Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/GeneratesEvent",                 { Type: "bool" } ),
                    AlwaysGeneratesEvent:  Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/AlwaysGeneratesEvent",       { Type: "bool" } ),
                    HasSubtype:            Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasSubtype",                 { Type: "bool" } ),
                    HasProperty:           Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasProperty",                { Type: "bool" } ),
                    HasComponent:          Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasComponent",               { Type: "bool" } ),
                    HasNotifier:           Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasNotifier",                { Type: "bool" } ),
                    FromState:             Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/FromState",                  { Type: "bool" } ),
                    HasCause:              Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasCause",                   { Type: "bool" } ),
                    HasEffect:             Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasEffect",                  { Type: "bool" } ),
                    HasSubStateMachine:    Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasSubStateMachine",         { Type: "bool" } ),
                    HasHistoricalConfig:   Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasHistoricalConfiguration", { Type: "bool" } ),
                    HasTrueSubState:       Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasTrueSubState",            { Type: "bool" } ),
                    HasFalseSubState:      Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasFalseSubState",           { Type: "bool" } ),
                    HasCondition:          Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedReferences/HasCondition",               { Type: "bool" } ),
                },
                SupportedNodeClasses: {
                    DataType:      Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedNodeClasses/DataType",      { Type: "bool" } ),
                    Method:        Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedNodeClasses/Method",        { Type: "bool" } ),
                    Object:        Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedNodeClasses/Object",        { Type: "bool" } ),
                    ObjectType:    Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedNodeClasses/ObjectType",    { Type: "bool" } ),
                    ReferenceType: Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedNodeClasses/ReferenceType", { Type: "bool" } ),
                    Variable:      Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedNodeClasses/Variable",      { Type: "bool" } ),
                    VariableType:  Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedNodeClasses/VariableType",  { Type: "bool" } ),
                    View:          Settings.SafeRead( "/Server Test/NodeIds/NodeManagement/SupportedNodeClasses/View",          { Type: "bool" } ),
                },
            }, // node management
            Methods: { 
                Settings:          Settings.ArraysToFQPaths( "/Server Test/NodeIds/Methods/", 
                                                        [ "MethodNoArgs", "MethodIO", "MethodI", "MethodO", "MultipleMethods" ] ),
                NoArgs:    Settings.SafeRead( "/Server Test/NodeIds/Methods/MethodNoArgs" ),
                IOArgs:    Settings.SafeRead( "/Server Test/NodeIds/Methods/MethodIO" ),
                IArgs:     Settings.SafeRead( "/Server Test/NodeIds/Methods/MethodI" ),
                OArgs:     Settings.SafeRead( "/Server Test/NodeIds/Methods/MethodO" ),
                Multiple:  Settings.SafeRead( "/Server Test/NodeIds/Methods/MultipleMethods" ),
            }, // methods
            Events: {
                TriggerNode01: Settings.SafeRead( "/Server Test/NodeIds/Events/TriggerNode01" ),
                TriggerNode02: Settings.SafeRead( "/Server Test/NodeIds/Events/TriggerNode02" ),
            },
        }, // node ids
        AlarmsAndConditions: {
            AlarmCycleTime: parseInt( readSetting( "/Server Test/Alarms and Conditions/Alarm Cycle Time" ) ),
            TimeTolerance: parseInt( readSetting( "/Server Test/Alarms and Conditions/Time Tolerance" ) ),
            MaximumEventCount: parseInt( readSetting( "/Server Test/Alarms and Conditions/Maximum Event Count" ) ),
            SupportedConditionTypes: {
                AlarmConditionTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/AlarmConditionType Input Nodes", ',' ),
                DiscrepancyAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/DiscrepancyAlarmType Input Nodes", ',' ),
                LimitAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/LimitAlarmType Input Nodes", ',' ),
                ExclusiveLimitAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/ExclusiveLimitAlarmType Input Nodes", ',' ),
                ExclusiveLevelAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/ExclusiveLevelAlarmType Input Nodes", ',' ),
                ExclusiveDeviationAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/ExclusiveDeviationAlarmType Input Nodes", ',' ),
                ExclusiveDeviationSetpointSources: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/Exclusive Deviation Setpoint Source", ',' ),
                ExclusiveRateOfChangeAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/ExclusiveRateOfChangeAlarmType Input Nodes", ',' ),
                NonExclusiveLimitAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/NonExclusiveLimitAlarmType Input Nodes", ',' ),
                NonExclusiveLevelAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/NonExclusiveLevelAlarmType Input Nodes", ',' ),
                NonExclusiveDeviationAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/NonExclusiveDeviationAlarmType Input Nodes", ',' ),
                NonExclusiveDeviationSetpointSources: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/NonExclusive Deviation Setpoint Source", ',' ),
                NonExclusiveRateOfChangeAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/NonExclusiveRateOfChangeAlarmType Input Nodes", ',' ),
                DiscreteAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/DiscreteAlarmType Input Nodes", ',' ),
                OffNormalAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/OffNormalAlarmType Input Nodes", ',' ),
                SystemOffNormalAlarmTypeInputNodes: Settings.CreateArray( "/Server Test/Alarms and Conditions/Supported Condition Types/SystemOffNormalAlarmType Input Nodes", ',' )
            }
        }, // Alarms and Conditions
        PubSub: {
            NetworkInterface_Server: readSetting( "/Server Test/PubSub/NetworkInterface_Server" ),
            NetworkInterface_CTT: readSetting( "/Server Test/PubSub/NetworkInterface_CTT" ),
            Url_Server: readSetting( "/Server Test/PubSub/Url_Server" ),
            Url_CTT: readSetting( "/Server Test/PubSub/Url_CTT" ),
            DefaultStringSize: readSetting( "/Server Test/PubSub/DefaultStringSize" )
        } // PubSub
    }, // server test
    Advanced: {
        Certificates: {
            
            ctt_ca1T:           Settings.SafeRead( "/Advanced/Certificates/ctt_ca1T" ),
            ctt_ca1TPrivateKey: Settings.SafeRead( "/Advanced/Certificates/ctt_ca1TPrivateKey" ),
            ctt_ca1TC:          Settings.SafeRead( "/Advanced/Certificates/ctt_ca1TC" ),
            ctt_ca1I:           Settings.SafeRead( "/Advanced/Certificates/ctt_ca1I" ),
            ctt_ca1IC:          Settings.SafeRead( "/Advanced/Certificates/ctt_ca1IC" ),
            ctt_ca1U:           Settings.SafeRead( "/Advanced/Certificates/ctt_ca1U" ),
            ctt_ca1T_ca2U:      Settings.SafeRead( "/Advanced/Certificates/ctt_ca1T_ca2U" ),
            ctt_ca1TC_ca2I:     Settings.SafeRead( "/Advanced/Certificates/ctt_ca1TC_ca2I" ),

            TrustListLocation:            Settings.SafeRead( "/Advanced/Certificates/CertificateTrustListLocation" ),
            RevocationListLocation:       Settings.SafeRead( "/Advanced/Certificates/CertificateRevocationListLocation" ),
            // this is the old settings structure
            /*Certificate:                  Settings.SafeRead( "/Advanced/Certificates/ClientCertificate" ),
            PrivateKey:                   Settings.SafeRead( "/Advanced/Certificates/ClientPrivateKey" ),
            Expired:                      Settings.SafeRead( "/Advanced/Certificates/ExpiredClientCertificate" ),
            ExpiredPrivateKey:            Settings.SafeRead( "/Advanced/Certificates/ExpiredClientPrivateKey" ),
            IncorrectlySigned:            Settings.SafeRead( "/Advanced/Certificates/IncorrectlySignedClientCertificate" ),
            IncorrectlySignedPrivateKey:  Settings.SafeRead( "/Advanced/Certificates/IncorrectlySignedClientPrivateKey" ),
            NotTrusted:                   Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_NotTrusted" ),
            NotTrustedPrivateKey:         Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_NotTrustedPrivateKey" ),
            Issued:                       Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_Issued"),
            IssuedPrivateKey:             Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_IssuedPrivateKey"),
            Revoked:                      Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_Revoked"),
            RevokedPrivateKey:            Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_RevokedPrivateKey" ),
            NotYetValid:                  Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_NotYetValid" ),
            NotYetValidPrivateKey:        Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_NotYetValidPrivateKey" ),
            IssuerUnknown:                Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_IssuerUnknown" ),
            IssuerUnknownPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_IssuerUnknownPrivateKey" ),
            HostnameInvalid:              Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_HostnameInvalid" ),
            HostnameInvalidPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_HostnameInvalidPrivateKey" ),
            ExpiredNotTrusted:            Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_ExpiredNotTrusted" ),
            ExpiredNotTrustedPrivateKey:  Settings.SafeRead( "/Advanced/Certificates/ClientCertificate_ExpiredNotTrustedPrivateKey" ),
            User:                         Settings.SafeRead( "/Advanced/Certificates/UserCertificate" ),
            UserPrivate:                  Settings.SafeRead( "/Advanced/Certificates/UserCertificate_PrivateKey" ),
            UserCertNotTrusted:           Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Untrusted" ),
            UserCertNotTrustedPrivateKey: Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Untrusted_PrivateKey" ),
            UserCertNotYetValid:          Settings.SafeRead( "/Advanced/Certificates/UserCertificate_NotYetValid" ),
            UserCertNotYetValidPrivateKey:Settings.SafeRead( "/Advanced/Certificates/UserCertificate_NotYetValid_PrivateKey" ),
            UserCertExpired:              Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Expired" ),
            UserCertExpiredPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Expired_PrivateKey" ),
            UserCertIssued:               Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Issued" ),
            UserCertIssuedPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Issued_PrivateKey" ),
            UserCertRevoked:              Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Revoked" ),
            UserCertRevokedPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Revoked_PrivateKey" ),
            UserCertInvalid:              Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Invalid" ),
            UserCertInvalidPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/UserCertificate_Invalid_PrivateKey" ),
            */
            // we are rather using the new one
            ApplicationInstanceCertificates: {
                ctt_appT:                     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appT" ),
                ctt_appTPrivateKey:           Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTPrivateKey" ),
                ctt_appTE:                    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTE" ),
                ctt_appTEPrivateKey:          Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTEPrivateKey" ),
                ctt_appTSha1_1024:            Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSha1_1024"),
                ctt_appTSha1_1024PrivateKey:  Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSha1_1024PrivateKey" ),
                ctt_appTSha1_2048:            Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSha1_2048"),
                ctt_appTSha1_2048PrivateKey:  Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSha1_2048PrivateKey" ),
                ctt_appTSha256_2048:          Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSha256_2048"),
                ctt_appTSha256_2048PrivateKey:Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSha256_2048PrivateKey" ),
                ctt_appTSha256_4096:          Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSha256_4096"),
                ctt_appTSha256_4096PrivateKey:Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSha256_4096PrivateKey" ),
                ctt_appTSincorrect:           Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSincorrect" ),
                ctt_appTSincorrectPrivateKey: Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSincorrectPrivateKey" ),
                ctt_appTSip:                  Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSip" ),
                ctt_appTSipPrivateKey:        Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSipPrivateKey" ),
                ctt_appTSuri:                 Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSuri" ),
                ctt_appTSuriPrivateKey:       Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTSuriPrivateKey" ),
                ctt_appTV:                    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTV" ),
                ctt_appTVPrivateKey:          Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appTVPrivateKey" ),
                ctt_appU:                     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appU" ),
                ctt_appUPrivateKey:           Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appUPrivateKey" ),
                ctt_appUE:                    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appUE" ),
                ctt_appUEPrivateKey:          Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_appUEPrivateKey" ),
                ctt_ca1I_appT:                Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_appT" ),
                ctt_ca1I_appTPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_appTPrivateKey" ),
                ctt_ca1I_appTR:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_appTR" ),
                ctt_ca1I_appTRPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_appTRPrivateKey" ),
                ctt_ca1I_appU:                Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_appU" ),
                ctt_ca1I_appUPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_appUPrivateKey" ),
                ctt_ca1I_appUR:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_appUR"),
                ctt_ca1I_appURPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_appURPrivateKey" ),
                ctt_ca1IC_appT:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1IC_appT" ),
                ctt_ca1IC_appTPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1IC_appTPrivateKey" ),
                ctt_ca1IC_appTR:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1IC_appTR" ),
                ctt_ca1IC_appTRPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1IC_appTRPrivateKey" ),
                ctt_ca1IC_appU:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1IC_appU" ),
                ctt_ca1IC_appUPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1IC_appUPrivateKey" ),
                ctt_ca1IC_appUR:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1IC_appUR"),
                ctt_ca1IC_appURPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1IC_appURPrivateKey" ),
                ctt_ca1T_appT:                Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_appT" ),
                ctt_ca1T_appTPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_appTPrivateKey" ),
                ctt_ca1T_appTR:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_appTR" ),
                ctt_ca1T_appTRPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_appTRPrivateKey" ),
                ctt_ca1T_appU:                Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_appU" ),
                ctt_ca1T_appUPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_appUPrivateKey" ),
                ctt_ca1T_appUR:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_appUR"),
                ctt_ca1T_appURPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_appURPrivateKey" ),
                ctt_ca1TC_appT:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_appT" ),
                ctt_ca1TC_appTPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_appTPrivateKey" ),
                ctt_ca1TC_appTR:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_appTR" ),
                ctt_ca1TC_appTRPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_appTRPrivateKey" ),
                ctt_ca1TC_appU:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_appU" ),
                ctt_ca1TC_appUPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_appUPrivateKey" ),
                ctt_ca1TC_appUR:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_appUR"),
                ctt_ca1TC_appURPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_appURPrivateKey" ),
                ctt_ca1U_appT:                Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1U_appT" ),
                ctt_ca1U_appTPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1U_appTPrivateKey" ),
                ctt_ca1U_appTR:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1U_appTR" ),
                ctt_ca1U_appTRPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1U_appTRPrivateKey" ),
                ctt_ca1U_appU:                Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1U_appU" ),
                ctt_ca1U_appUPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1U_appUPrivateKey" ),
                ctt_ca1U_appUR:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1U_appUR"),
                ctt_ca1U_appURPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1U_appURPrivateKey" ),
                ctt_ca1I_ca2T_appT:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_ca2T_appT" ),
                ctt_ca1I_ca2T_appTPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_ca2T_appTPrivateKey" ),
                ctt_ca1I_ca2T_appTR:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_ca2T_appTR" ),
                ctt_ca1I_ca2T_appTRPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_ca2T_appTRPrivateKey" ),
                ctt_ca1I_ca2T_appU:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_ca2T_appU" ),
                ctt_ca1I_ca2T_appUPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_ca2T_appUPrivateKey" ),
                ctt_ca1I_ca2T_appUR:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_ca2T_appUR"),
                ctt_ca1I_ca2T_appURPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1I_ca2T_appURPrivateKey" ),
                ctt_ca1T_ca2U_appT:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_ca2U_appT" ),
                ctt_ca1T_ca2U_appTPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_ca2U_appTPrivateKey" ),
                ctt_ca1T_ca2U_appTR:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_ca2U_appTR" ),
                ctt_ca1T_ca2U_appTRPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_ca2U_appTRPrivateKey" ),
                ctt_ca1T_ca2U_appU:               Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_ca2U_appU" ),
                ctt_ca1T_ca2U_appUPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_ca2U_appUPrivateKey" ),
                ctt_ca1T_ca2U_appUR:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_ca2U_appUR"),
                ctt_ca1T_ca2U_appURPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1T_ca2U_appURPrivateKey" ),
                ctt_ca1TC_ca2I_appT:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_ca2I_appT" ),
                ctt_ca1TC_ca2I_appTPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_ca2I_appTPrivateKey" ),
                ctt_ca1TC_ca2I_appTR:             Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_ca2I_appTR" ),
                ctt_ca1TC_ca2I_appTRPrivateKey:   Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_ca2I_appTRPrivateKey" ),
                ctt_ca1TC_ca2I_appU:              Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_ca2I_appU" ),
                ctt_ca1TC_ca2I_appUPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_ca2I_appUPrivateKey" ),
                ctt_ca1TC_ca2I_appUR:             Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_ca2I_appUR"),
                ctt_ca1TC_ca2I_appURPrivateKey:   Settings.SafeRead( "/Advanced/Certificates/ApplicationInstanceCertificates/ctt_ca1TC_ca2I_appURPrivateKey" )
            },
            X509UserIdentityCertificates: {
                ctt_usrT:                     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrT" ),
                ctt_usrTPrivateKey:           Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrTPrivateKey" ),
                ctt_usrTE:                    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrTE" ),
                ctt_usrTEPrivateKey:          Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrTEPrivateKey" ),
                ctt_usrTSincorrect:           Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrTSincorrect" ),
                ctt_usrTSincorrectPrivateKey: Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrTSincorrectPrivateKey" ),
                ctt_usrTV:                    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrTV" ),
                ctt_usrTVPrivateKey:          Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrTVPrivateKey" ),
                ctt_usrU:                     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrU" ),
                ctt_usrUPrivateKey:           Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrUPrivateKey" ),
                ctt_usrUE:                    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrUE" ),
                ctt_usrUEPrivateKey:          Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_usrUEPrivateKey" ),
                ctt_ca1I_usrT:                Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_usrT" ),
                ctt_ca1I_usrTPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_usrTPrivateKey" ),
                ctt_ca1I_usrTR:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_usrTR" ),
                ctt_ca1I_usrTRPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_usrTRPrivateKey" ),
                ctt_ca1I_usrU:                Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_usrU" ),
                ctt_ca1I_usrUPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_usrUPrivateKey" ),
                ctt_ca1I_usrUR:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_usrUR"),
                ctt_ca1I_usrURPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_usrURPrivateKey" ),
                ctt_ca1IC_usrT:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1IC_usrT" ),
                ctt_ca1IC_usrTPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1IC_usrTPrivateKey" ),
                ctt_ca1IC_usrTR:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1IC_usrTR" ),
                ctt_ca1IC_usrTRPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1IC_usrTRPrivateKey" ),
                ctt_ca1IC_usrU:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1IC_usrU" ),
                ctt_ca1IC_usrUPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1IC_usrUPrivateKey" ),
                ctt_ca1IC_usrUR:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1IC_usrUR"),
                ctt_ca1IC_usrURPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1IC_usrURPrivateKey" ),
                ctt_ca1T_usrT:                Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_usrT" ),
                ctt_ca1T_usrTPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_usrTPrivateKey" ),
                ctt_ca1T_usrTR:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_usrTR" ),
                ctt_ca1T_usrTRPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_usrTRPrivateKey" ),
                ctt_ca1T_usrU:                Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_usrU" ),
                ctt_ca1T_usrUPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_usrUPrivateKey" ),
                ctt_ca1T_usrUR:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_usrUR"),
                ctt_ca1T_usrURPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_usrURPrivateKey" ),
                ctt_ca1TC_usrT:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_usrT" ),
                ctt_ca1TC_usrTPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_usrTPrivateKey" ),
                ctt_ca1TC_usrTR:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_usrTR" ),
                ctt_ca1TC_usrTRPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_usrTRPrivateKey" ),
                ctt_ca1TC_usrU:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_usrU" ),
                ctt_ca1TC_usrUPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_usrUPrivateKey" ),
                ctt_ca1TC_usrUR:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_usrUR"),
                ctt_ca1TC_usrURPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_usrURPrivateKey" ),
                ctt_ca1U_usrT:                Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1U_usrT" ),
                ctt_ca1U_usrTPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1U_usrTPrivateKey" ),
                ctt_ca1U_usrTR:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1U_usrTR" ),
                ctt_ca1U_usrTRPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1U_usrTRPrivateKey" ),
                ctt_ca1U_usrU:                Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1U_usrU" ),
                ctt_ca1U_usrUPrivateKey:      Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1U_usrUPrivateKey" ),
                ctt_ca1U_usrUR:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1U_usrUR"),
                ctt_ca1U_usrURPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1U_usrURPrivateKey" ),
                ctt_ca1I_ca2T_usrT:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_ca2T_usrT" ),
                ctt_ca1I_ca2T_usrTPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_ca2T_usrTPrivateKey" ),
                ctt_ca1I_ca2T_usrTR:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_ca2T_usrTR" ),
                ctt_ca1I_ca2T_usrTRPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_ca2T_usrTRPrivateKey" ),
                ctt_ca1I_ca2T_usrU:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_ca2T_usrU" ),
                ctt_ca1I_ca2T_usrUPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_ca2T_usrUPrivateKey" ),
                ctt_ca1I_ca2T_usrUR:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_ca2T_usrUR"),
                ctt_ca1I_ca2T_usrURPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1I_ca2T_usrURPrivateKey" ),
                ctt_ca1T_ca2U_usrT:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_ca2U_usrT" ),
                ctt_ca1T_ca2U_usrTPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_ca2U_usrTPrivateKey" ),
                ctt_ca1T_ca2U_usrTR:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_ca2U_usrTR" ),
                ctt_ca1T_ca2U_usrTRPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_ca2U_usrTRPrivateKey" ),
                ctt_ca1T_ca2U_usrU:               Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_ca2U_usrU" ),
                ctt_ca1T_ca2U_usrUPrivateKey:     Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_ca2U_usrUPrivateKey" ),
                ctt_ca1T_ca2U_usrUR:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_ca2U_usrUR"),
                ctt_ca1T_ca2U_usrURPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1T_ca2U_usrURPrivateKey" ),
                ctt_ca1TC_ca2I_usrT:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_ca2I_usrT" ),
                ctt_ca1TC_ca2I_usrTPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_ca2I_usrTPrivateKey" ),
                ctt_ca1TC_ca2I_usrTR:             Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_ca2I_usrTR" ),
                ctt_ca1TC_ca2I_usrTRPrivateKey:   Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_ca2I_usrTRPrivateKey" ),
                ctt_ca1TC_ca2I_usrU:              Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_ca2I_usrU" ),
                ctt_ca1TC_ca2I_usrUPrivateKey:    Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_ca2I_usrUPrivateKey" ),
                ctt_ca1TC_ca2I_usrUR:             Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_ca2I_usrUR"),
                ctt_ca1TC_ca2I_usrURPrivateKey:   Settings.SafeRead( "/Advanced/Certificates/X509UserIdentityCertificates/ctt_ca1TC_ca2I_usrURPrivateKey" )
            },
        }, // certificates
        NodeIds: {
            Invalid: {
                Unknowns: Settings.ArraysToFQPaths( "/Advanced/NodeIds/Invalid/", [ "UnknownNodeId1", "UnknownNodeId2", "UnknownNodeId3", "UnknownNodeId4", "UnknownNodeId5" ] ),
                Invalids: Settings.ArraysToFQPaths( "/Advanced/NodeIds/Invalid/", [ "InvalidSyntaxNodeId1", "InvalidSyntaxNodeId2" ] ),
                NodeId1:  Settings.SafeRead( "/Advanced/NodeIds/Invalid/InvalidNodeId1" ),
                NodeId2:  Settings.SafeRead( "/Advanced/NodeIds/Invalid/InvalidNodeId2" ),
                Unknown1: Settings.SafeRead( "/Advanced/NodeIds/Invalid/UnknownNodeId1" ),
                Unknown2: Settings.SafeRead( "/Advanced/NodeIds/Invalid/UnknownNodeId2" ),
                Unknown3: Settings.SafeRead( "/Advanced/NodeIds/Invalid/UnknownNodeId3" ),
                Unknown4: Settings.SafeRead( "/Advanced/NodeIds/Invalid/UnknownNodeId4" ),
                Unknown5: Settings.SafeRead( "/Advanced/NodeIds/Invalid/UnknownNodeId5" ),
                Invalid1: Settings.SafeRead( "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId1" ),
                Invalid2: Settings.SafeRead( "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId2" ),
            },// invalid
        }, // node ids
        ResourceTesting: {
            CallCount: {
                Attribute:        Settings.SafeRead( "/Advanced/ResourceTesting/AttributeServicesCallCount" ),
                Discovery:        Settings.SafeRead( "/Advanced/ResourceTesting/DiscoveryServicesCallCount" ),
                MonitoredItem:    Settings.SafeRead( "/Advanced/ResourceTesting/MonitoredItemServicesCallCount" ),
                NodeManagement:   Settings.SafeRead( "/Advanced/ResourceTesting/NodeManagementServicesCallCount" ),
                Session:          Settings.SafeRead( "/Advanced/ResourceTesting/SessionServiceSetCallCount" ),
                Subscription:     Settings.SafeRead( "/Advanced/ResourceTesting/SubscriptionServiceSetCallCount" ),
                InterCallDelay:   Settings.SafeRead( "/Advanced/ResourceTesting/InterCallDelay" ),
                MaxTimeInSeconds: Settings.SafeRead( "/Advanced/ResourceTesting/MaxTestTimeInSeconds" ),
            },// call count
        }, // resource testing
        CertificateOverrides: {
            TimeInvalid:       Settings.SafeRead( "/Advanced/CertificateOverrides/DisableCertificateTimeInvalid",       { Type: "bool" } ),
            RevocationUnknown: Settings.SafeRead( "/Advanced/CertificateOverrides/DisableCertificateRevocationUnknown", { Type: "bool" } ),
            UseNotAllowed:     Settings.SafeRead( "/Advanced/CertificateOverrides/DisableCertificateUseNotAllowed",     { Type: "bool" } ),
            HostNameInvalid:   Settings.SafeRead( "/Advanced/CertificateOverrides/DisableCertificateHostNameInvalid",   { Type: "bool" } ),
        }, // certificate overrides
        TestTool: {
            MaxNodeValidationsPerTestscript: Settings.SafeRead( "/Advanced/Test Tool/MaxNodeValidationsPerTestscript" ),
            PostTestDelay: Settings.SafeRead( "/Advanced/Test Tool/PostTestDelay" ),
        },
    }, // advanced
    Discovery: {
        EndpointUrl:                 Settings.SafeRead( "/Discovery/Endpoint Url" ),
        MessageSecurityMode:         Settings.SafeRead( "/Discovery/MessageSecurityMode" ),
        RequestedSecurityPolicyUri:  Settings.SafeRead( "/Discovery/RequestedSecurityPolicyUri" ),
        SemaphoreFilePath:           Settings.SafeRead( "/Discovery/SemaphoreFilePath" ),
    },
    UserDefined: {
    },
    OPC_UA_FX: {
        VerificationMode_Identity_supported: Settings.SafeRead( "/OPC UA FX/VerificationMode Identity supported", { Type: "bool" } ),
        VerificationMode_IdentityAndCompatibility_supported: Settings.SafeRead( "/OPC UA FX/VerificationMode IdentityAndCompatibility supported", { Type: "bool" } )
    }
}

function getindent( indent ) { 
    var s = "";
    for( var i=0; i<indent; i++ ) s += "   ";
    return( s );
}

function printsettings( settings, indent ) {
    for( var setting in settings ) {
        var msg = setting;
        print( getindent( indent ) + msg + ": " + settings[setting] );
        if( typeof settings[setting] === "object" ) printsettings( settings[setting], 1 + indent );
    }
}

//printsettings( Settings, 0 );