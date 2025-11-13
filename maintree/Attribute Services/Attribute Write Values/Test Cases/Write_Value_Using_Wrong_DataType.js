/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to a value using the wrong data-type:
            Sent value of Type -> to the wrong node of Type
                 Int16 -> Bool          Int32-> Byte
                 Int64-> Float          UInt16-> String
                 UInt32-> DateTime      UInt64 -> decimal
                 String -> bool         Byte -> XmlElement
                 Guid -> UInt32         SByte -> DateTime etc. */

Test.Execute( { Procedure: function test() {
    this.itemOfType = function( items, types ) {
        if( items == undefined || items == null || items.length == 0 ) return( null );
        if( types == undefined || types == null || types.length == 0 ) return( null );
        for( var i=0; i<items.length; i++ ) { // iterate thru each item
            // check if *this* item matches any of the specified types...
            for( var t=0; t<types.length; t++ ) { // iterate thru each type
                if( items[i].originalValue.DataType == types[t] ) return( items[i] );
            }//for t...
        }//for i...
        return( null );
    };

    var writeItems = [];
    var testitems = [];

    // read the testitems and get their initial values, and then cache a copy...
    if( items == null || items.length < 2 ) { addSkipped( "Not enough items configured." ); return ( false ); }
    for( var s = 0; s < items.length; s++ ) {
        testitems.push( items[s].clone());
    }

    // for this test we need to exclude VARIANT
    for( var i=0; i<testitems.length; i++ ) {
        if( testitems[i].NodeSetting.indexOf( "Variant" ) > 0 ) {
            print( "Found 'Variant' as a configured node. Removed from test." );
            testitems.splice( i, 1 );
            break; // stop the search
        }
    }

    if( !ReadHelper.Execute( { NodesToRead: testitems } ) ) return( false );
    for( var i=0; i<testitems.length; i++ ) testitems[i].originalValue = testitems[i].Value.Value.clone();

    var expectedResults = [];
    //dynamically construct IDs of nodes to write, specifically their values.
    for( var i=0; i<testitems.length; i++ ) {
        // this variable will contain the SPECIFIC UA object that will then be passed to the WRITE call.
        var item;
        switch( testitems[i].NodeSetting ) {
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool":        item = this.itemOfType( testitems, [ BuiltInType.Float, BuiltInType.Byte, BuiltInType.UInt16, BuiltInType.String ] );      break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte":        item = this.itemOfType( testitems, [ BuiltInType.XmlElement, BuiltInType.Int16, BuiltInType.String, BuiltInType.Float ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString":  item = this.itemOfType( testitems, [ BuiltInType.Boolean, BuiltInType.String, BuiltInType.Int16, BuiltInType.UInt16 ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime":    item = this.itemOfType( testitems, [ BuiltInType.UInt32, BuiltInType.Boolean, BuiltInType.String, BuiltInType.Float ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Double":      item = this.itemOfType( testitems, [ BuiltInType.DateTime, BuiltInType.Boolean, BuiltInType.String, BuiltInType.UInt16 ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Duration":    item = this.itemOfType( testitems, [ BuiltInType.Boolean, BuiltInType.String, BuiltInType.UInt16, BuiltInType.Byte ] );     break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Enumeration": item = this.itemOfType( testitems, [ BuiltInType.Boolean, BuiltInType.String, BuiltInType.Float, BuiltInType.Int16 ] );  break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Float":       item = this.itemOfType( testitems, [ BuiltInType.UInt64, BuiltInType.Boolean, BuiltInType.String, BuiltInType.Int16 ] );    break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid":        item = this.itemOfType( testitems, [ BuiltInType.Float, BuiltInType.Int16, BuiltInType.String, BuiltInType.XmlElement ] );  break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Image":       item = this.itemOfType( testitems, [ BuiltInType.String, BuiltInType.Int16, BuiltInType.LocalizedText, BuiltInType.Float ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/ImageBMP":    item = this.itemOfType( testitems, [ BuiltInType.String, BuiltInType.Int16, BuiltInType.LocalizedText, BuiltInType.Float ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/ImageGIF":    item = this.itemOfType( testitems, [ BuiltInType.String, BuiltInType.Int16, BuiltInType.LocalizedText, BuiltInType.Float ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/ImagePNG":    item = this.itemOfType( testitems, [ BuiltInType.String, BuiltInType.Int16, BuiltInType.LocalizedText, BuiltInType.Float ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16":       item = this.itemOfType( testitems, [ BuiltInType.String, BuiltInType.Boolean, BuiltInType.Float, BuiltInType.UInt16 ] );      break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32":       item = this.itemOfType( testitems, [ BuiltInType.Guid, BuiltInType.String, BuiltInType.XmlElement, BuiltInType.UInt32 ] );    break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64":       item = this.itemOfType( testitems, [ BuiltInType.Float, BuiltInType.String, BuiltInType.XmlElement, BuiltInType.Boolean ] );  break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Integer":     item = this.itemOfType( testitems, [ BuiltInType.Double, BuiltInType.String, BuiltInType.Boolean, BuiltInType.Byte ] );     break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/LocaleId":    item = this.itemOfType( testitems, [ BuiltInType.Boolean, BuiltInType.Int16, BuiltInType.Float, BuiltInType.String ] );     break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/LocalizedText": item = this.itemOfType( testitems, [ BuiltInType.String, BuiltInType.Boolean, BuiltInType.Float, BuiltInType.Byte ] );   break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/NodeId":        item = this.itemOfType( testitems, [ BuiltInType.Float, BuiltInType.String, BuiltInType.Int16, BuiltInType.DateTime ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Number":        item = this.itemOfType( testitems, [ BuiltInType.Guid, BuiltInType.String, BuiltInType.XmlElement, BuiltInType.LocalizedText ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/QualifiedName": item = this.itemOfType( testitems, [ BuiltInType.Boolean, BuiltInType.String, BuiltInType.Float, BuiltInType.XmlElement ] );      break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/String":        item = this.itemOfType( testitems, [ BuiltInType.UInt16, BuiltInType.LocalizedText, BuiltInType.Boolean, BuiltInType.UInt16 ] );  break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte":         item = this.itemOfType( testitems, [ BuiltInType.Int32, BuiltInType.String, BuiltInType.DateTime, BuiltInType.Float ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/Time":          item = this.itemOfType( testitems, [ BuiltInType.UInt16, BuiltInType.String, BuiltInType.Float, BuiltInType.Guid ] );        break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16":        item = this.itemOfType( testitems, [ BuiltInType.Int16, BuiltInType.Guid, BuiltInType.String, BuiltInType.ByteString ] );    break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32":        item = this.itemOfType( testitems, [ BuiltInType.Guid, BuiltInType.String, BuiltInType.Float, BuiltInType.LocalizedText ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64":        item = this.itemOfType( testitems, [ BuiltInType.Float, BuiltInType.XmlElement, BuiltInType.UInt16, BuiltInType.Double ] );  break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/UtcTime":       item = this.itemOfType( testitems, [ BuiltInType.Float, BuiltInType.String, BuiltInType.Int16, BuiltInType.Guid ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInteger":      item = this.itemOfType( testitems, [ BuiltInType.Int32, BuiltInType.String, BuiltInType.Guid, BuiltInType.Float ] ); break;
            case "/Server Test/NodeIds/Static/All Profiles/Scalar/XmlElement":    item = this.itemOfType( testitems, [ BuiltInType.Double, BuiltInType.String, BuiltInType.Float, BuiltInType.Boolean ] ); break;
            default:
                print( "/n/n/t*** Unexpected Node received. Skipping '" + testitems[i].NodeId + " ' (Setting: '" + testitems[i].NodeSetting + "')" );
                break;
        }//switch
        if( item !== null ) {
            testitems[i].Value.Value = item.originalValue.clone();
            writeItems.push( testitems[i] );
            expectedResults.push( new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ) );
        }
        else continue;
    }//for

    //WRITE the nodes.
    return( WriteHelper.Execute( { NodesToWrite: writeItems, OperationResults: expectedResults, ReadVerification: false } ) );
} } );