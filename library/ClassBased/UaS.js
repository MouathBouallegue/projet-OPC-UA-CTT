/* Includes:
    UaSignatureData.New()
    SecurityAlgorithms.getAlgorithms()
    SecurityAlgorithms.getKeyLength()
    UaStatusCode.fromString()
    UaStatusCode.ToHexString()
    UaStructureDefinition.FromNodeSet( typeId )
    UaStructureDefinition.FromTypeNodeId( nodeId )
    UaStructureDefinition.Print( sDef )
    UaSimpleAttributeOperand.New = function( args )
    UaSubscriptionDiagnosticsDataType.FindSubscription( args )
*/

// Extend NATIVE STRING method
String.prototype.lpad = function( width, string, padding ) {
    return( width <= string.length ) ? string : string.lpad( width, padding + string, padding );
}
String.prototype.rpad = function( width, string, padding ) {
    return( width <= string.length ) ? string : string.rpad( width, string + padding, padding );
}
/* creates the signature that accompanies a user x509 certificate
   parameters:
       - Session: 
       - RequestedSecurityPolicyUri
       - CertificateSetting */
UaSignatureData.New = function( args ) {
    var s = new UaSignatureData()
    if( isDefined( args ) && isDefined( args.Session ) ) {
        // other parameter checks..
        if( !isDefined( args.RequestedSecurityPolicyUri ) ) args.RequestedSecurityPolicyUri = args.Session.Channel.Channel.RequestedSecurityPolicyUri;
        if( isDefined ( args.RequestedSecurityPolicyUri.length ) ) args.RequestedSecurityPolicyUri = SecurityPolicy.policyFromString( args.RequestedSecurityPolicyUri );
        // check if the security policy is #none or empty, if so then it may be defaulting to what is defined in the channel
        if( args.RequestedSecurityPolicyUri == SecurityPolicy.None ) {
            args.RequestedSecurityPolicyUri = args.Session.Session.Channel.RequestedSecurityPolicyUri;
            if( args.RequestedSecurityPolicyUri == SecurityPolicy.None ) addWarning( "UaSignature.New() SecurityPolicy.None detected in requested EndpoinDescription.\nAlso checked the RequestedSecurityPolicy in the SecureChannel and it is also None.\nThis will prevent a UaSiganture from being created properly." );
        }
        if( !isDefined( args.CertificateSetting ) ) args.CertificateSetting = Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTPrivateKey;
        // load our pki provider and configure it
        var pkiProvider = new UaPkiUtility();
        pkiProvider.CertificateTrustListLocation = Settings.Advanced.Certificates.TrustListLocation;
        pkiProvider.CertificateRevocationListLocation = Settings.Advanced.Certificates.RevocationListLocation;
        pkiProvider.PkiType = PkiType.OpenSSL;
        // load the users private key
        var userPrivateKey = new UaPkiPrivateKey();
        var result = null;
        args.CertificateSetting = args.CertificateSetting.replace( "/certs/", "/private/" );
        args.CertificateSetting = args.CertificateSetting.replace( ".der", ".pem" );
        print( "SignatureData for '" + args.CertificateSetting + "' requested." );
        result = pkiProvider.loadPrivateKeyFromFile( args.CertificateSetting , userPrivateKey );
        
        if( result.isGood() ) {
            // now to create the signature based on the private key
            // first, add the serverCertificate + nonce (if not null)
            var dataToSign = new UaByteString();
            dataToSign.append( args.Session.Channel.Channel.ServerCertificate.clone() );
            if( args.Session.Response.ServerNonce.length > 0 ) dataToSign.append( args.Session.Response.ServerNonce );
            // now to sign
            var cryptoProvider = new UaCryptoProvider(args.RequestedSecurityPolicyUri);
            switch (args.RequestedSecurityPolicyUri) {
                case SecurityPolicy.Basic128Rsa15:      s.Algorithm = SignatureAlgorithm.signatureAlgorithmToString(SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1);  break;
                case SecurityPolicy.Basic256:           s.Algorithm = SignatureAlgorithm.signatureAlgorithmToString(SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1);  break;
                case SecurityPolicy.Basic256Sha256:     s.Algorithm = SignatureAlgorithm.signatureAlgorithmToString(SignatureAlgorithm.AlgorithmUri_Signature_RsaSha256);break;
                case SecurityPolicy.Aes128Sha256RsaOaep:s.Algorithm = SignatureAlgorithm.signatureAlgorithmToString(SignatureAlgorithm.AlgorithmUri_Signature_RsaSha256);break;
                case SecurityPolicy.Aes256Sha256RsaPss: s.Algorithm = SignatureAlgorithm.signatureAlgorithmToString(SignatureAlgorithm.AlgorithmUri_Signature_RsaPssSha256);break;
                default:                                s.Algorithm = SignatureAlgorithm.signatureAlgorithmToString(SignatureAlgorithm.AlgorithmUri_Signature_RsaSha256);break;
            }
           
            s.Signature.length = cryptoProvider.MaximumAsymmetricKeyLength;
            result = cryptoProvider.asymmetricSign( dataToSign, userPrivateKey, s.Signature );
            // DEBUG DATA
            print( "\n\tRESULT: " + result );
            // END DEBUG
            if( result.isBad() ) throw( "Unable to sign the SignatureData (required for user X509 authentication)" +
                   "\nUaSignatureData.New:\n\tRequestedSecurityPolicyUri: " + args.RequestedSecurityPolicyUri +
                   "\n\tdataToSign (length): " + dataToSign.length + "\n\tuserPrivateKey: " + userPrivateKey.toString() + "\n\tError: " + result );
        } // private key loaded ok?
        else throw( "Unable to load user's privatey key (x509). Error: " + result, result );
    }
    return( s );
}

/* SecurityAlgorithms class.
    Purpose: Query the set of security algorithms used by an OPC UA security policy. */
function SecurityAlgorithms() {
    this.SymmetricSignatureAlgorithm = "";
    this.SymmetricEncryptionAlgorithm = "";
    this.AsymmetricSignatureAlgorithm = "";
    this.AsymmetricKeyWrapAlgorithm= "";
    this.AsymmetricEncryptionAlgorithm = "";
    this.KeyDerivationAlgorithm = "";
}

SecurityAlgorithms.getAlgorithms = function( securityPolicy ) {
    var algorithms = new SecurityAlgorithms();
    switch ( securityPolicy ) {
        case SecurityPolicy.Basic128Rsa15:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes128-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString( SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1 );
            algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-1_5";
            algorithms.AsymmetricEncryptionAlgorithm = EncryptionAlgorithm.encryptionAlgorithmToString( EncryptionAlgorithm.AlgorithmUri_Encryption_Rsa15 );
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha1";
            break;
        case SecurityPolicy.Basic256:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString( SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1 );
            algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p";
            algorithms.AsymmetricEncryptionAlgorithm = EncryptionAlgorithm.encryptionAlgorithmToString( EncryptionAlgorithm.AlgorithmUri_Encryption_RsaOaep );
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha1";
            break;
        case SecurityPolicy.Basic256Sha256:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString( OpcUa_AlgorithmUri_Signature_RsaSha256 );
            algorithms.AsymmetricEncryptionAlgorithm = SignatureAlgorithm.signatureAlgorithmToString( OpcUa_AlgorithmUri_Encryption_RsaOaep );
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha256";
            algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p";
            break; 
        case SecurityPolicy.Aes128Sha256RsaOaep:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha2-256";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes128-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString(OpcUa_AlgorithmUri_Signature_RsaSha256);
            algorithms.AsymmetricEncryptionAlgorithm = SignatureAlgorithm.signatureAlgorithmToString(OpcUa_AlgorithmUri_Encryption_RsaOaep);
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha2-256";
            //algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p";
            break;
        case SecurityPolicy.Aes256Sha256RsaPss:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha2-256";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString(OpcUa_AlgorithmUri_Signature_RsaPssSha256);
            algorithms.AsymmetricEncryptionAlgorithm = SignatureAlgorithm.signatureAlgorithmToString(OpcUa_AlgorithmUri_Encryption_RsaOaepSha256);
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha2-256";
            //algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p";
            break;
    }
    return algorithms;
}

SecurityAlgorithms.getKeyLength = function( securityPolicy ) {
    var len = 0;
    switch( securityPolicy )
    {
        case SecurityPolicy.Basic128Rsa15:
            len = 128 / 8;
            break;
        case SecurityPolicy.Basic192Rsa15: 
            len = 192 / 8;
            break;
        case SecurityPolicy.Basic256Rsa15: 
            len = 256 / 8;
            break;
    }
    return( len );
}


UaSimpleAttributeOperand.New = function( args ) {
    var u = new UaSimpleAttributeOperand();
    if( isDefined( args ) ) {
        if( isDefined( args.AttributeId ) ) u.AttributeId = args.AttributeId;
        if( isDefined( args.BrowsePath ) ) {
            if( isDefined( args.BrowsePath.length ) ) {
                for( var b=0; b<args.BrowsePath.length; b++ ) u.BrowsePath[b] = args.BrowsePath[b];
            }
            else u.BrowsePath[0] = args.BrowsePath;
        }
        if( isDefined( args.IndexRange ) )  u.IndexRange  = args.IndexRange;
        if( isDefined( args.TypeDefinitionId ) ) u.TypeDefinitionId = args.TypeDefinitionId;
    }
    return( u );
}


UaStatusCode.ToHexString = function( number ) {
    if (number < 0) number = 0xFFFFFFFF + number + 1;
    return "0x" + number.toString(16).toUpperCase();
}
StatusCode.BadTooManyArguments            = 0x80E50000;
StatusCode.BadNotExecutable               = 0x81110000;
StatusCode.BadCertificateChainIncomplete  = 0x810D0000;
StatusCode.BadLicenseExpired              = 0x810E0000;
StatusCode.BadLicenseLimitsExceeded       = 0x810F0000;
StatusCode.BadLicenseNotAvailable         = 0x81100000;
StatusCode.BadSecurityModeInsufficient    = 0x80E60000;
StatusCode.BadRequestNotAllowed           = 0x80E40000;
StatusCode.GoodDependentValueChanged      = 0x00E00000;
StatusCode.BadDominantValueChanged        = 0x80E10000;
StatusCode.UncertainDependentValueChanged = 0x40E20000;
StatusCode.BadDependentValueChanged       = 0x80E30000;
StatusCode.GoodEdited                     = 0x00DC0000;
StatusCode.GoodPostActionFailed           = 0x00DD0000;
StatusCode.UncertainDominantValueChanged  = 0x40DE0000;
StatusCode.GoodDependendValueChanged      = 0x00DF0000;

/**
 * Function reads the StructureDefinition of a given type NodeId from the NodeSet File and creates a UaStructureDefinition object
 * 
 * @param {UaNodeId} typeId - The type NodeId
 * 
 * @returns {UaStructureDefinition|boolean} Returns the created UaStructureDefinition on success, FALSE otherwise
 */
UaStructureDefinition.FromNodeSet = function( typeId ) {
    if( !isDefined( typeId ) ) throw( "UaStructureDefinition.FromNodeSet(typeId): Argument 'typeId' is not defined" );
    IsSubTypeOfTypeHelper.Execute( { ItemNodeId: typeId, TypeNodeId: Identifier.Structure, SuppressErrors: true } );
    if( !IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
        addError( "UaStructureDefinition.FromNodeSet(typeId): Provided type '" + typeId + "' is no Subtype of Structure." );
        return false;
    }
    var nodeSetUtility = new NodeSetUtility();
    var nodeSet = nodeSetUtility.GetNodeSet();
    var node = nodeSet[typeId];
    if( !isDefined( node ) ) {
        addError( "UaStructureDefinition.FromNodeSet(typeId): Could not find Node '" + typeId + "' in the NodeSetFile" );
        return false;
    }
    if( !isDefined( node['Definition'] ) ) {
        addError( "UaStructureDefinition.FromNodeSet(typeId): Could not find 'Definition' on node '" + typeId + "' in the NodeSetFile." );
        return false;
    }
    var fields = node['Definition']['Field'];
    if( !isDefined( fields ) ) {
        addLog( "UaStructureDefinition.FromNodeSet(typeId): Definition of node '" + typeId + "' in the NodeSetFile, does not define any fields." );
        fields = [];
    }
    
    var resultStructureDefinition = new UaStructureDefinition();
    resultStructureDefinition.setDataTypeId( typeId );
    if( isDefined( node['Definition']['_Name'] ) ) {
        resultStructureDefinition.setName( node['Definition']['_Name'] );
        // Guess BinaryEncodingId from Identifiers
        var binaryEncodingId = Identifier[ node['Definition']['_Name'] + "_Encoding_DefaultBinary" ];
        if( binaryEncodingId ) resultStructureDefinition.setBinaryEncodingId( new UaNodeId( binaryEncodingId ) );
    }
    
    for( var i=0; i<fields.length; i++ ) {
        var newChild = new UaStructureField();
        if( isDefined( fields[i]['_Name'] ) ) newChild.setName( fields[i]['_Name'] );
        if( isDefined( fields[i]['_DataType'] ) ) {
            // check if type is Enumeration or Structure
            IsSubTypeOfTypeHelper.Execute( { ItemNodeId: new UaNodeId.fromString( fields[i]['_DataType'] ), TypeNodeId: Identifier.Enumeration, SuppressErrors: true } );
            if( IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                // Field containing an EnumDefinition
                var definition = UaEnumDefinition.FromNodeSet( new UaNodeId.fromString( fields[i]['_DataType'] ) );
                if( definition !== false ) newChild.setEnumDefinition( definition );
                else return false;
            }
            else {
                IsSubTypeOfTypeHelper.Execute( { ItemNodeId: new UaNodeId.fromString( fields[i]['_DataType'] ), TypeNodeId: Identifier.Structure, SuppressErrors: true } );
                if( IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                    // Field containing a StructureDefinition
                    var definition = UaStructureDefinition.FromNodeSet( new UaNodeId.fromString( fields[i]['_DataType'] ) );
                    if( definition !== false ) newChild.setStructureDefinition( definition );
                    else return false;
                }
                else newChild.setDataTypeId( new UaNodeId.fromString( fields[i]['_DataType'] ) );
            }
        }
        else newChild.setDataTypeId( new UaNodeId( Identifier.BaseDataType ) );
        if( isDefined( fields[i]['_ValueRank'] ) && fields[i]['_ValueRank'] == 1 ) newChild.setArrayType(1);
        resultStructureDefinition.addChild( newChild );
    }
    return( resultStructureDefinition );
}

/**
 * Function to dynamically learn StructureDefinitions from the server during runtime given the Type NodeId
 * 
 * @param {UaNodeId} nodeId - The NodeId of the Structure type to learn
 * 
 * @returns {UaStructureDefinition|boolean} Returns the created UaStructureDefinition on success, FALSE otherwise
 */
UaStructureDefinition.FromTypeNodeId = function( nodeId, forceUsageOfServerType, overrideTypeTree ) {
    if( !isDefined( nodeId ) ) throw( "UaStructureDefinition.FromTypeNodeId(nodeId): Argument 'nodeId' is not defined" );
    if( !isDefined( forceUsageOfServerType ) ) forceUsageOfServerType = false;
    if( overrideTypeTree === null || overrideTypeTree === undefined ) overrideTypeTree = [];
    try{
        var mI = new MonitoredItem( nodeId );
    } catch( ex ) {
        addError( "UaStructureDefinition.FromTypeNodeId(nodeId): Error creating new MonitoredItem from argument 'nodeId':\n\t==> " + ex );
        return false;
    }
    mI.AttributeId = Attribute.DataTypeDefinition;
    ReadHelper.Execute( { NodesToRead: mI, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadAttributeIdInvalid ) ], TimestampsToReturn: TimestampsToReturn.Neither } );
    if( mI.Value.Value.isEmpty() ) {
        addError( "UaStructureDefinition.FromTypeNodeId(nodeId): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'. Returned variant is empty." );
        return false;
    }
    else {
        var structureDefinition_extObj = mI.Value.Value.toExtensionObject();
        if( isDefined( structureDefinition_extObj.TypeId ) ) {
            if( structureDefinition_extObj.TypeId.NodeId.getIdentifierNumeric() == Identifier.StructureDefinition_Encoding_DefaultBinary ) {
                var flatStructureDefinition = structureDefinition_extObj.toStructureDefinition();
            }
            else {
                addError( "UaStructureDefinition.FromTypeNodeId(nodeId): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'.\n" +
                          "TypeId of returned ExtensionObject is not 'i=122' (StructureDefinition_Encoding_DefaultBinary), but is '" + structureDefinition_extObj.TypeId.NodeId + "' (" + Identifier.toString( structureDefinition_extObj.TypeId.NodeId ) + ")" );
                return false;
            }
        }
        else {
            addError( "UaStructureDefinition.FromTypeNodeId(nodeId): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'. Returned variant does not appear to be of type ExtensionObject." );
            return false;
        }
    }
    var deepStructureDefinition = new UaStructureDefinition();
      deepStructureDefinition.setBaseType         ( flatStructureDefinition.baseTypeId()       );
      deepStructureDefinition.setBinaryEncodingId ( flatStructureDefinition.binaryEncodingId() );
      deepStructureDefinition.setDataTypeId       ( nodeId                                     );
      deepStructureDefinition.setName             ( flatStructureDefinition.name()             );
      deepStructureDefinition.setNamespace        ( flatStructureDefinition.getNamespace()     );
      deepStructureDefinition.setNamespace        ( flatStructureDefinition.getNamespace()     );
      deepStructureDefinition.setUnion            ( flatStructureDefinition.isUnion()          );
    for( var i=0; i<flatStructureDefinition.childrenCount(); i++ ) {
        var forceUsageOfServerTypeOverridden = ( isDefined( overrideTypeTree[i] ) && isDefined( overrideTypeTree[i].ForceUsageOfServerType ) ) ? overrideTypeTree[i].ForceUsageOfServerType : forceUsageOfServerType;
        var baseChildTypeId = flatStructureDefinition.child(i).typeId();
        var childTypeId = baseChildTypeId;
        var childValueType = flatStructureDefinition.child(i).valueType();
        if( isDefined( overrideTypeTree[i] ) && isDefined( overrideTypeTree[i].TypeNodeId ) && isDefined( overrideTypeTree[i].TypeNodeId.getIdentifierNumeric ) ) {
            childTypeId = overrideTypeTree[i].TypeNodeId.clone();
            childValueType = 0;
        }
        var childrenToOverride = ( isDefined( overrideTypeTree[i] ) && overrideTypeTree[i].Children != null ) ? overrideTypeTree[i].Children : [];
        if( childValueType == 0 ) {
            addLog( "Getting field information for field '" + flatStructureDefinition.child(i).name() + "' of node '" + nodeId.toString() + "'" );
            var tempStructureField = new UaStructureField();
            tempStructureField.setName           ( flatStructureDefinition.child(i).name()            );
            tempStructureField.setOptional       ( flatStructureDefinition.child(i).isOptional()      );
            tempStructureField.setMaxStringLength( flatStructureDefinition.child(i).maxStringLength() );
            tempStructureField.setArrayDimensions( flatStructureDefinition.child(i).arrayDimensions() );
            
            // children of a union must not be optional
            if( flatStructureDefinition.isUnion() ) tempStructureField.setOptional( false );
            
            var isOfKnownType = false;
            
            // check if DataType is known by CTT yet
            var typeName = Identifier.toString( childTypeId );
            if( isDefined( typeName ) && typeName.length > 0 && childTypeId.NamespaceIndex == 0 && !forceUsageOfServerTypeOverridden ) {
                addLog( "UaStructureDefinition.FromTypeNodeId(): Field[" + i + "] is of known type '" + typeName + "' and will not be learned from the server" );
                isOfKnownType = true;
            }
            IsSubTypeOfTypeHelper.Execute( { ItemNodeId: childTypeId, TypeNodeId: Identifier.Enumeration, SuppressErrors: true } );
            if( IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                // Field containing an EnumDefinition
                if( isOfKnownType ) var fieldEnumDefinition = UaEnumDefinition.FromNodeSet( childTypeId );
                else var fieldEnumDefinition = UaEnumDefinition.FromTypeNodeId( childTypeId );
                if( fieldEnumDefinition !== false ) tempStructureField.setEnumDefinition( fieldEnumDefinition );
                else return false;
            }
            else {
                IsSubTypeOfTypeHelper.Execute( { ItemNodeId: childTypeId, TypeNodeId: Identifier.Structure, SuppressErrors: true } );
                if( IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                    // Field containing a Structure
                    // Check if StructureDefinition of the field is abstract
                    var IsAbstract = false;
                    try{
                        var childType_mI = new MonitoredItem( childTypeId );
                    } catch( ex ) {
                        addError( "UaStructureDefinition.FromTypeNodeId(nodeId): Error creating new MonitoredItem for type NodeId '" + childTypeId + "' of field " + i + " (" + tempStructureField.name() + ") of StructureDefinition '" + nodeId + "':\n\t==> " + ex );
                        return false;
                    }
                    childType_mI.AttributeId = Attribute.IsAbstract;
                    ReadHelper.Execute( { NodesToRead: childType_mI, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadAttributeIdInvalid ) ], TimestampsToReturn: TimestampsToReturn.Neither } );
                    if( !childType_mI.Value.Value.isEmpty() ) IsAbstract = childType_mI.Value.Value.toBoolean();
                    
                    // Allow subtypes if the DataType of the field is abstract
                    var allowSubTypes = ( isDefined( overrideTypeTree[i] ) && overrideTypeTree[i].AllowSubTypes ) ? true : IsAbstract;
                    
                    if( isOfKnownType ) {
                        var fieldStructureDefinition = UaStructureDefinition.FromNodeSet( childTypeId );
                    }
                    else {
                        if( !allowSubTypes ) {
                            var fieldStructureDefinition = UaStructureDefinition.FromTypeNodeId( childTypeId, forceUsageOfServerTypeOverridden, childrenToOverride );
                        }
                        else {
                            tempStructureField.setAllowSubtypes( true );
                            var fieldStructureDefinition = UaStructureDefinition.FromTypeNodeId( baseChildTypeId, forceUsageOfServerTypeOverridden );
                            if( fieldStructureDefinition !== false ) {
                                fieldStructureDefinition = fieldStructureDefinition.createSubtype();
                                var fieldStructureDefinitionSubtype = UaStructureDefinition.FromTypeNodeId( childTypeId, forceUsageOfServerTypeOverridden );
                                fieldStructureDefinition.setName             ( fieldStructureDefinitionSubtype.name()             );
                                fieldStructureDefinition.setDataTypeId       ( fieldStructureDefinitionSubtype.dataTypeId()       );
                                fieldStructureDefinition.setBinaryEncodingId ( fieldStructureDefinitionSubtype.binaryEncodingId() );
                                for( var field=0; field<fieldStructureDefinitionSubtype.childrenCount(); field++ ) {
                                    var fieldAlreadyExists = false;
                                    for( var fieldBase=0; fieldBase<fieldStructureDefinition.childrenCount(); fieldBase++ ) {
                                        if( fieldStructureDefinitionSubtype.child(field).name() == fieldStructureDefinition.child(fieldBase).name() ) {
                                            fieldAlreadyExists = true;
                                            break;
                                        }
                                    }
                                    if( !fieldAlreadyExists ) {
                                        fieldStructureDefinition.addChild( fieldStructureDefinitionSubtype.child(field) );
                                    }
                                }
                            }
                            else return false;
                        }
                    }
                    if( fieldStructureDefinition !== false ) tempStructureField.setStructureDefinition( fieldStructureDefinition );
                    else return false;
                }
                else {
                    // check if type is derived from a BuiltInType
                    for( var b=1; b<26; b++ ) {
                        IsSubTypeOfTypeHelper.Execute( { ItemNodeId: childTypeId, TypeNodeId: new UaNodeId(b), SuppressErrors: true } );
                        if( IsSubTypeOfTypeHelper.Response.IsSubTypeOf ) {
                            // Field containing a type derived from a BuiltInType
                            addLog( "UaStructureDefinition.FromTypeNodeId(nodeId): " + childTypeId + " is derived from " + Identifier.toString( new UaNodeId(b) ) + " and will be treated as " + Identifier.toString( new UaNodeId(b) ) );
                            tempStructureField.setDataTypeId( childTypeId );
                            tempStructureField.setValueType( b );
                            break;
                        }
                        if( b == 25 ) { // if nothing found
                            addError( 
                                "UaStructureDefinition.FromTypeNodeId(nodeId): Failed to load Fields of StructureDefinition '" + nodeId + "'.\n" +
                                "Field '" + flatStructureDefinition.child(i).name() + "' has an unknown type and " +
                                "is neither an Enumeration nor a Structure that could be learned from the Types folder."
                            );
                            return false;
                        }
                    }
                }
            }
            if( flatStructureDefinition.child(i).valueRank() == 1 ) tempStructureField.setArrayType(1);
            tempStructureField.setDataTypeId( childTypeId );
            deepStructureDefinition.addChild( tempStructureField );
        }
        else deepStructureDefinition.addChild( flatStructureDefinition.child(i) );
    }
    return deepStructureDefinition;
}

/**
 * Function to get a formatted string to print the Fields of a given UaStructureDefinition
 * 
 * @param {UaStructureDefinition} sDef - The StructureDefinition to print
 * @param {Number} indent - (To be left blank) Reserved for passing indentation by recursion level
 * 
 * @returns {string} Returns the StructureDefinition as formatted, printable string
 */
UaStructureDefinition.Print = function( sDef, indent ) {
    var result = "";
    if( !isDefined( indent ) ) var indent = "";
    for( var i=0; i<sDef.childrenCount(); i++ ) {
        var type = ( sDef.child(i).typeId().NamespaceIndex == 0 ) ? Identifier.toString( sDef.child(i).typeId() ) : "";
        type = ( type == "" ) ? sDef.child(i).typeId() : type;
        //if( !sDef.child(i).enumDefinition().isNull() ) type = "EnumDefinition";
        result += indent + sDef.child(i).name() + 
                    " ( " +
                    "Type: " + type + ( sDef.child(i).arrayType() == 1 ? "[]" : "" ) + 
                    ", ValueType: " + sDef.child(i).valueType() + 
                    ", AllowSubtypes: " + sDef.child(i).allowSubtypes() +
                    //", Documentation: " + sDef.child(i).documentation() + 
                    ", MaxStringLength: " + sDef.child(i).maxStringLength() + 
                    ", ArrayDimensions: " + sDef.child(i).arrayDimensions() + 
                    //") [" + ( sDef.child(i).isOptional() ? "O" : "M" ) + "]";
                    ", isOptional: " + sDef.child(i).isOptional() + " )";
        if( !sDef.child(i).structureDefinition().isNull() ) {
            var subSDef = sDef.child(i).structureDefinition();
            result += " [ BaseTypeId: " + subSDef.baseTypeId();
            result += ", BinaryEncodingId: " + subSDef.binaryEncodingId();
            result += ", DataTypeId: " + subSDef.dataTypeId();
            result += ", isUnion: " + subSDef.isUnion() + " ] ";
            result += " {\n";
            result += UaStructureDefinition.Print( sDef.child(i).structureDefinition(), indent + "    " );
            result += indent + "}";
        }
        result += "\n";
    }
    return result;
}

/* Find subscription(s) in a a collection of SubscriptionDiagnostics
   Parameters: 
       - Diagnostics: ExtensionObject array containing UaSubscriptionDiagnosticsDataType collection
       - SubscriptionId: single object of either (a) integers (b) subscription objects */
UaSubscriptionDiagnosticsDataType.FindSubscription = function( args ) {
    if( !isDefined( args ) ) throw( "UaSubscriptionDiagnostic.FindSubscription::args not specified" );
    if( !isDefined( args.Diagnostics ) || !isDefined( args.SubscriptionId ) ) throw( "UaSubscriptionDiagnostic.FindSubscription::args.Diagnostics or args.SubscriptionIds not specified" );
    var subid = isNaN( parseInt( args.SubscriptionId ) ) ? args.SubscriptionId.SubscriptionId : parseInt( args.SubscriptionId );
    for( var i=0; i<args.Diagnostics.length; i++ ) { // iterate thru all diagnostics
        var currDiag = args.Diagnostics[i].toSubscriptionDiagnosticsDataType();
        if( currDiag !== null ) if( currDiag.SubscriptionId === subid ) return( i );
    }//for i
    return( -1 );
}

ServiceLevel = {
    "Maintenance" : 0,
    "NoData" :  1,
    "Degraded" : 2,
    "Healthy" : 200 };
ServiceLevel.ToString = function( value ) {
    if( value === 0 ) return( "Maintenance" );
    else if( value === 1 ) return( "NoData" );
    else if( value >= 2 && value <= 199 ) return( "Degraded" );
    else if( value >= 200 && value <= 255 ) return( "Healthy" );
    else throw( "Invalid ServiceLevel value '" + value + "'." );
}