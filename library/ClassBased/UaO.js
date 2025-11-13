/* Includes: 
    UaObjectAttributes.New()
    UaObjectTypeAttributes.New()
    UaOpcServer.AddDataTypeNode()
    UaOpcServer.AddMethodNode()
    UaOpcServer.AddObjectNode()
    UaOpcServer.AddReference()
    UaOpcServer.AddReferenceTypeNode()
    UaOpcServer.AddVariableNode()
    UaOpcServer.AddVariableTypeNode()
    UaOpcServer.AddViewNode()
    UaOpcServer.Connect()
    UaOpcServer.DeleteNode()
    UaOpcServer.DeleteNodeHierarchy()
    UaOpcServer.DeleteReference()
    UaOpcServer.Disconnect()
    UaOpcServer.GetChildNodeByBrowseName()
    UaOpcServer.GetNamespaceIndexFromUri()
    UaOpcServer.ImportNodeSet()
    UaOpcServer.InstantiateObject()
    UaOpcServer.IsSubTypeOfType()
    UaOpcServer.LearnEnumDefinition()
    UaOpcServer.LearnStructureDefinition()
    UaOpcServer.NodeExists()
    UaOpcServer.restartServer()
    UaOpcServer.SetCurrentPubSubConfig()
    UaOpcServer.StringIdentifierFromBrowsePath()
*/

include( "./library/Base/array.js" );

UaObjectAttributes.New = function( args ) {
    var x = new UaObjectAttributes();
    if( isDefined( args.Description ) ) {
        if( isDefined( args.Description.Text ) ) x.Description = args.Description;
        else x.Description.Text = args.Description;
    }
    if( isDefined( args.DisplayName ) ) {
        if( isDefined( args.DisplayName.Text ) ) x.DisplayName = args.DisplayName;
        else x.DisplayName.Text = args.DisplayName;
    }
    if( isDefined( args.EventNotifier ) ) x.EventNotifier = args.EventNotifier;
    if( isDefined( args.SpecifiedAttributes ) ) x.SpecifiedAttributes = args.SpecifiedAttributes;
    if( isDefined( args.UserWriteMask ) ) x.UserWriteMask = args.UserWriteMask;
    if( isDefined( args.WriteMask ) ) x.WriteMask = args.WriteMask;
    if( isDefined( args.ToExtensionObject ) ) {
        var extObj = new UaExtensionObject();
        extObj.setObjectAttributes( x );
        x = extObj;
    }
    return( x );
}// UaObjectAttributes.New = function( args )

UaObjectTypeAttributes.New = function( args ) {
    var x = new UaObjectTypeAttributes();
    if( isDefined( args.Description ) ) {
        if( isDefined( args.Description.Text ) ) x.Description = args.Description;
        else x.Description.Text = args.Description;
    }
    if( isDefined( args.DisplayName ) ) {
        if( isDefined( args.DisplayName.Text ) ) x.DisplayName = args.DisplayName;
        else x.DisplayName.Text = args.DisplayName;
    }
    if( isDefined( args.IsAbstract ) ) x.IsAbstract = args.IsAbstract;
    if( isDefined( args.SpecifiedAttributes ) ) x.SpecifiedAttributes = args.SpecifiedAttributes;
    if( isDefined( args.UserWriteMask ) ) x.UserWriteMask = args.UserWriteMask;
    if( isDefined( args.WriteMask ) ) x.WriteMask = args.WriteMask;
    if( isDefined( args.ToExtensionObject ) ) {
        var extObj = new UaExtensionObject();
        extObj.setObjectAttributes( x );
        x = extObj;
    }
    return( x );
}// UaObjectTypeAttributes.New = function( args )

/**
 * Function to add a DataType Node to the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId of the Node to add
 * @param {UaQualifiedName} args.BrowseName - The BrowseName of the Node to add
 * @param {UaNodeId} args.SourceNode - The parent node of the Node to add
 * @param {UaNodeId} args.ReferenceTypeId - (Optional) The ReferenceType to be used to reference the Node to add (default=Organizes)
 * @param {UaLocalizedText} args.DisplayName - (Optional) The DisplayName of the Node to add (default=same as BrowseName with Locale="")
 * @param {UaLocalizedText} args.Description - (Optional) The Description of the Node to add (default=empty)
 * @param {boolean} args.IsAbstract - (Optional) The IsAbstract attribute of the Node to add (default=FALSE)
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addDataTypeNode()
 */
UaOpcServer.AddDataTypeNode = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.AddDataTypeNode(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.AddDataTypeNode(): No NodeId defined" );
    if( !isDefined( args.BrowseName ) ) throw( "UaOpcServer.AddDataTypeNode(): No BrowseName defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.AddDataTypeNode(): No SourceNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) args.ReferenceTypeId = new UaNodeId( Identifier.Organizes );
    if( !isDefined( args.DisplayName ) ) args.DisplayName = UaLocalizedText.New( { Locale: "", Text: args.BrowseName.Name } );
    if( !isDefined( args.Description ) ) args.Description = new UaLocalizedText();
    if( !isDefined( args.IsAbstract ) ) args.IsAbstract = false;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Adding DataType Node '" + args.NodeId + "' to embedded OpcServer" );
    var result = gOpcServer.addDataTypeNode( 
        args.NodeId, 
        args.BrowseName,
        args.SourceNode,
        args.ReferenceTypeId,
        args.DisplayName,
        args.Description,
        args.IsAbstract
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.AddDataTypeNode() returned: " + result );
    
    return( result );
}// UaOpcServer.AddDataTypeNode = function( args )

/**
 * Function to add a Method Node to the AddressSpace of the embedded OpcServer
 * including the InputArguments and OutputArguments properties
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId of the Node to add
 * @param {UaQualifiedName} args.BrowseName - The BrowseName of the Node to add
 * @param {UaNodeId} args.SourceNode - The parent node of the Node to add
 * @param {UaNodeId} args.ReferenceTypeId - (Optional) The ReferenceType to be used to reference the Node to add (default=HasComponent)
 * @param {UaArgument[]|UaArguments} args.InputArguments - (Optional) The InputArguments of the Method Node to add (default=empty)
 * @param {UaArgument[]|UaArguments} args.OutputArguments - (Optional) The OutputArguments of the Method Node to add (default=empty)
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addMethodNode()
 */
UaOpcServer.AddMethodNode = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.AddMethodNode(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.AddMethodNode(): No NodeId defined" );
    if( !isDefined( args.BrowseName ) ) throw( "UaOpcServer.AddMethodNode(): No BrowseName defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.AddMethodNode(): No SourceNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) args.ReferenceTypeId = new UaNodeId( Identifier.HasComponent );
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    var tempInArgs = new UaArguments();
    var tempOutArgs = new UaArguments();
    
    if( isDefined( args.InputArguments ) && isDefined( args.InputArguments.length ) ) {
        for( var i=0; i<args.InputArguments.length; i++ ) tempInArgs[i] = args.InputArguments[i];
    }
    
    if( isDefined( args.OutputArguments ) && isDefined( args.OutputArguments.length ) ) {
        for( var o=0; o<args.OutputArguments.length; o++ ) tempOutArgs[o] = args.OutputArguments[o];
    }
    
    addLog( "Adding Method Node '" + args.NodeId + "' to embedded OpcServer" );
    var result = gOpcServer.addMethodNode( 
        args.NodeId, 
        args.BrowseName,
        args.SourceNode,
        tempInArgs,
        tempOutArgs,
        args.ReferenceTypeId
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.AddMethodNode() returned: " + result );
    
    return( result );
}// UaOpcServer.AddMethodNode = function( args )

/**
 * Function to add an Object Node to the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId of the Node to add
 * @param {UaQualifiedName} args.BrowseName - The BrowseName of the Node to add
 * @param {UaNodeId} args.SourceNode - The parent node of the Node to add
 * @param {UaNodeId} args.ReferenceTypeId - (Optional) The ReferenceType to be used to reference the Node to add (default=HasComponent)
 * @param {UaLocalizedText} args.DisplayName - (Optional) The DisplayName of the Node to add (default=same as BrowseName with Locale="")
 * @param {UaLocalizedText} args.Description - (Optional) The Description of the Node to add (default=empty)
 * @param {boolean} args.TypeNodeId - (Optional) The TypeDefinition NodeId of the Node to add (default=BaseObjectType)
 * @param {boolean} args.EventNotifier - (Optional) The EventNotifier attribute of the Node to add (default=EventNotifier.None(0))
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addObjectNode()
 */
UaOpcServer.AddObjectNode = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.AddObjectNode(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.AddObjectNode(): No NodeId defined" );
    if( !isDefined( args.BrowseName ) ) throw( "UaOpcServer.AddObjectNode(): No BrowseName defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.AddObjectNode(): No SourceNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) args.ReferenceTypeId = new UaNodeId( Identifier.HasComponent );
    if( !isDefined( args.DisplayName ) ) args.DisplayName = UaLocalizedText.New( { Locale: "", Text: args.BrowseName.Name } );
    if( !isDefined( args.Description ) ) args.Description = new UaLocalizedText();
    if( !isDefined( args.TypeNodeId ) ) args.TypeNodeId = new UaNodeId( Identifier.BaseObjectType );
    if( !isDefined( args.EventNotifier ) ) args.EventNotifier = EventNotifier.None;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Adding Object Node '" + args.NodeId + "' to embedded OpcServer" );
    var result = gOpcServer.addObjectNode( 
        args.NodeId, 
        args.BrowseName,
        args.SourceNode,
        args.ReferenceTypeId,
        args.DisplayName,
        args.Description,
        args.TypeNodeId,
        args.EventNotifier
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.AddObjectNode() returned: " + result );
    
    return( result );
}// UaOpcServer.AddObjectNode = function( args )

/**
 * Function to add a Reference to the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.SourceNode - The SourceNode of the reference to add
 * @param {UaNodeId} args.TargetNode - The TargetNode of the reference to add
 * @param {UaNodeId} args.ReferenceTypeId - The ReferenceTypeId of the reference to add
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addReference()
 */
UaOpcServer.AddReference = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.AddReference(): No args defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.AddReference(): No SourceNode defined" );
    if( !isDefined( args.TargetNode ) ) throw( "UaOpcServer.AddReference(): No TargetNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) throw( "UaOpcServer.AddReference(): No ReferenceTypeId defined" );
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Adding Reference with Source='" + args.SourceNode + 
            "', Target='" + args.TargetNode + 
            "' and ReferenceTypeId='" + args.ReferenceTypeId + "' to embedded OpcServer" );
    var result = gOpcServer.addReference( 
        args.SourceNode, 
        args.TargetNode,
        args.ReferenceTypeId
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.AddReference() returned: " + result );
    
    return( result );
}// UaOpcServer.AddReference = function( args )

/**
 * Function to add a ReferenceType Node to the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId of the Node to add
 * @param {UaQualifiedName} args.BrowseName - The BrowseName of the Node to add
 * @param {UaNodeId} args.SourceNode - The parent node of the Node to add
 * @param {UaNodeId} args.ReferenceTypeId - (Optional) The ReferenceType to be used to reference the Node to add (default=Organizes)
 * @param {UaLocalizedText} args.DisplayName - (Optional) The DisplayName of the Node to add (default=same as BrowseName with Locale="")
 * @param {UaLocalizedText} args.Description - (Optional) The Description of the Node to add (default=empty)
 * @param {boolean} args.IsAbstract - (Optional) The IsAbstract attribute of the Node to add (default=FALSE)
 * @param {boolean} args.Symmetric - (Optional) The Symmetric attribute of the Node to add (default=FALSE)
 * @param {UaLocalizedText} args.InverseName - (Optional) The InverseName of the Node to add (default=empty)
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addReferenceTypeNode()
 */
UaOpcServer.AddReferenceTypeNode = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.AddReferenceTypeNode(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.AddReferenceTypeNode(): No NodeId defined" );
    if( !isDefined( args.BrowseName ) ) throw( "UaOpcServer.AddReferenceTypeNode(): No BrowseName defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.AddReferenceTypeNode(): No SourceNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) args.ReferenceTypeId = new UaNodeId( Identifier.Organizes );
    if( !isDefined( args.DisplayName ) ) args.DisplayName = UaLocalizedText.New( { Locale: "", Text: args.BrowseName.Name } );
    if( !isDefined( args.Description ) ) args.Description = new UaLocalizedText();
    if( !isDefined( args.IsAbstract ) ) args.IsAbstract = false;
    if( !isDefined( args.Symmetric ) ) args.Symmetric = false;
    if( !isDefined( args.InverseName ) ) args.InverseName = new UaLocalizedText();
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Adding ReferenceType Node '" + args.NodeId + "' to embedded OpcServer" );
    var result = gOpcServer.addReferenceTypeNode( 
        args.NodeId, 
        args.BrowseName,
        args.SourceNode,
        args.ReferenceTypeId,
        args.DisplayName,
        args.Description,
        args.IsAbstract,
        args.Symmetric,
        args.InverseName
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.AddReferenceTypeNode() returned: " + result );
    
    return( result );
}// UaOpcServer.AddReferenceTypeNode = function( args )

/**
 * Function to add a VariableNode Node to the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId of the Node to add
 * @param {UaQualifiedName} args.BrowseName - The BrowseName of the Node to add
 * @param {UaNodeId} args.SourceNode - The parent node of the Node to add
 * @param {UaNodeId} args.ReferenceTypeId - (Optional) The ReferenceType to be used to reference the Node to add (default=HasProperty)
 * @param {UaLocalizedText} args.DisplayName - (Optional) The DisplayName of the Node to add (default=same as BrowseName with Locale="")
 * @param {UaLocalizedText} args.Description - (Optional) The Description of the Node to add (default=empty)
 * @param {UaNodeId} args.TypeNodeId - (Optional) The TypeDefinition NodeId of the Node to add (default=BaseDataVariableType)
 * @param {UaVariant} args.Value - (Optional) The value of the Node to add (default=empty)
 * @param {UaNodeId} args.DataType - (Optional) The DataType of the Node to add (default=BaseDataType)
 * @param {Number} args.ValueRank - (Optional) The ValueRank of the Node to add (default=ValueRank.Any)
 * @param {Number} args.AccessLevel - (Optional) The AccessLevel attribute value of the node to add (default=AccessLevel.CurrentReadOrWrite)
 * @param {Number} args.UserAccessLevel - (Optional) The UserAccessLevel attribute value of the node to add (default=AccessLevel.CurrentReadOrWrite)
 * @param {Number} args.MinimumSamplingInterval - (Optional) The MinimumSamplingInterval attribute value of the node to add (default=0)
 * @param {boolean} args.Historizing - (Optional) The Historizing attribute value of the node to add (default=false)
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addVariableNode()
 */
UaOpcServer.AddVariableNode = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.AddVariableNode(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.AddVariableNode(): No NodeId defined" );
    if( !isDefined( args.BrowseName ) ) throw( "UaOpcServer.AddVariableNode(): No BrowseName defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.AddVariableNode(): No SourceNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) args.ReferenceTypeId = new UaNodeId( Identifier.HasProperty );
    if( !isDefined( args.DisplayName ) ) args.DisplayName = UaLocalizedText.New( { Locale: "", Text: args.BrowseName.Name } );
    if( !isDefined( args.Description ) ) args.Description = new UaLocalizedText();
    if( !isDefined( args.TypeNodeId ) ) args.TypeNodeId = new UaNodeId( Identifier.BaseDataVariableType );
    if( !isDefined( args.Value ) ) args.Value = new UaVariant();
    if( !isDefined( args.DataType ) ) args.DataType = new UaNodeId( Identifier.BaseDataType );
    if( !isDefined( args.ValueRank ) ) args.ValueRank = ValueRank.Any;
    if( !isDefined( args.AccessLevel ) ) args.AccessLevel = AccessLevel.CurrentReadOrWrite;
    if( !isDefined( args.UserAccessLevel ) ) args.UserAccessLevel = AccessLevel.CurrentReadOrWrite;
    if( !isDefined( args.MinimumSamplingInterval ) ) args.MinimumSamplingInterval = 0;
    if( !isDefined( args.Historizing ) ) args.Historizing = false;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Adding Variable Node '" + args.NodeId + "' to embedded OpcServer" );
    var result = gOpcServer.addVariableNode( 
        args.NodeId, 
        args.BrowseName,
        args.SourceNode,
        args.ReferenceTypeId,
        args.DisplayName,
        args.Description,
        args.TypeNodeId,
        args.Value,
        args.DataType,
        args.ValueRank,
        args.AccessLevel,
        args.UserAccessLevel,
        args.MinimumSamplingInterval,
        args.Historizing
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.AddVariableNode() returned: " + result );
    
    return( result );
}// UaOpcServer.AddVariableNode = function( args )

/**
 * Function to add a VariableType Node to the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId of the Node to add
 * @param {string} args.Name - The name of the Node to add
 * @param {UaNodeId} args.SourceNode - The parent node of the Node to add
 * @param {UaNodeId} args.ReferenceTypeId - (Optional) The ReferenceType to be used to reference the Node to add (default=Organizes)
 * @param {string} args.DefaultLocaleId - (Optional) The Locale of the DisplayName of the Node to add (default=empty)
 * @param {boolean} args.IsAbstract - (Optional) The IsAbstract attribute of the Node to add (default=FALSE)
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addVariableTypeNode()
 */
UaOpcServer.AddVariableTypeNode = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.AddVariableTypeNode(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.AddVariableTypeNode(): No NodeId defined" );
    if( !isDefined( args.Name ) ) throw( "UaOpcServer.AddVariableTypeNode(): No Name defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.AddVariableTypeNode(): No SourceNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) args.ReferenceTypeId = new UaNodeId( Identifier.Organizes );
    if( !isDefined( args.DefaultLocaleId ) ) args.DefaultLocaleId = "";
    if( !isDefined( args.IsAbstract ) ) args.IsAbstract = false;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Adding VariableType Node '" + args.NodeId + "' to embedded OpcServer" );
    var result = gOpcServer.addVariableTypeNode( 
        args.NodeId, 
        args.Name,
        args.SourceNode,
        args.ReferenceTypeId,
        args.DefaultLocaleId,
        args.IsAbstract
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.AddVariableTypeNode() returned: " + result );
    
    return( result );
}// UaOpcServer.AddVariableTypeNode = function( args )

/**
 * Function to add a View Node to the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId of the Node to add
 * @param {string} args.Name - The name of the Node to add
 * @param {UaNodeId} args.SourceNode - The parent node of the Node to add
 * @param {UaNodeId} args.ReferenceTypeId - (Optional) The ReferenceType to be used to reference the Node to add (default=Organizes)
 * @param {string} args.DefaultLocaleId - (Optional) The Locale of the DisplayName of the Node to add (default=empty)
 * @param {boolean} args.ContainsNoLoops - (Optional) The ContainsNoLoops attribute of the Node to add (default=TRUE)
 * @param {boolean} args.EventNotifier - (Optional) The EventNotifier attribute of the Node to add (default=EventNotifier.None)
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.addViewNode()
 */
UaOpcServer.AddViewNode = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.AddViewNode(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.AddViewNode(): No NodeId defined" );
    if( !isDefined( args.Name ) ) throw( "UaOpcServer.AddViewNode(): No Name defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.AddViewNode(): No SourceNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) args.ReferenceTypeId = new UaNodeId( Identifier.Organizes );
    if( !isDefined( args.DefaultLocaleId ) ) args.DefaultLocaleId = "";
    if( !isDefined( args.ContainsNoLoops ) ) args.ContainsNoLoops = true;
    if( !isDefined( args.EventNotifier ) ) args.EventNotifier = EventNotifier.None;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Adding View Node '" + args.NodeId + "' to embedded OpcServer" );
    var result = gOpcServer.addViewNode( 
        args.NodeId, 
        args.Name,
        args.SourceNode,
        args.ReferenceTypeId,
        args.DefaultLocaleId,
        args.ContainsNoLoops,
        args.EventNotifier
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.AddViewNode() returned: " + result );
    
    return( result );
}// UaOpcServer.AddViewNode = function( args )

/**
 * Function to connect to the embedded OpcServer, which creates a Channel and Session object in UaOpcServer
 * 
 * @returns {boolean} Returns TRUE on success, FALSE otherwise
 */
UaOpcServer.Connect = function() {
    if( !isDefined( UaOpcServer.ServerCertificateCached ) ) {
        // Get ServerCertificate of the embedded server
        var pathToServerCertificate = gOpcServer.getApplicationInstanceCertificateLocation();
        var serverCertificate = new UaByteString();
        var pkiProvider = new UaPkiUtility();
        pkiProvider.CertificateTrustListLocation      = Settings.Advanced.Certificates.TrustListLocation;
        pkiProvider.CertificateRevocationListLocation = Settings.Advanced.Certificates.RevocationListLocation;
        pkiProvider.PkiType                           = PkiType.OpenSSL;
        var uaStatus = pkiProvider.loadCertificateFromFile( pathToServerCertificate, serverCertificate );
        delete pkiProvider;
        if( uaStatus.isBad() ) {
            addError( "UaOpcServer.Connect(): Unable to load certificate of the embedded server. Error: '" + uaStatus.toString() + "'." );
            return( false );
        }
        // Copy certificate file to TrustListLocation
        writeBinaryFile( Settings.Advanced.Certificates.TrustListLocation + "/uacompliancetest.der", readBinaryFile( pathToServerCertificate ) );
        // Cache ServerCertificate so it only needs to be loaded once
        UaOpcServer.ServerCertificateCached = serverCertificate;
    }
    // Create channel
    UaOpcServer.Channel = new OpenSecureChannelService();
    if( !UaOpcServer.Channel.Execute( {
        ServerUrl: "opc.tcp://localhost:4842",
        SecurityMode: MessageSecurityMode.None,
        NetworkTimeout: 2000,
        RequestedLifetime: 0,
        SecurityPolicyUri: 0
    } ) ) {
        UaOpcServer.Channel = null;
        addError( "UaOpcServer.Connect(): Failed to create channel." );
        return( false );
    }
    // Replace ServerCertificate manually, as OpenSecureChannelService might use a (wrong) cached one
    UaOpcServer.Channel.Channel.ServerCertificate = UaOpcServer.ServerCertificateCached;
    // Create session
    UaOpcServer.Session = new CreateSessionService( { Channel: UaOpcServer.Channel } );
    if( !UaOpcServer.Session.Execute( { EndpointUrl: "opc.tcp://localhost:4842" } ) ) {
        UaOpcServer.Channel = null;
        UaOpcServer.Session = null;
        addError( "UaOpcServer.Connect(): Failed to create session." );
        return( false );
    }
    // Activate session
    if( !ActivateSessionHelper.Execute( {
        Session: UaOpcServer.Session,
        UserIdentityToken: UaUserIdentityToken.FromUserCredentials( { 
            Session: UaOpcServer.Session,
            UserCredentials: new UserCredentials( { Policy: UserTokenType.Anonymous } )
        } )
    } ) ) {
        UaOpcServer.Channel = null;
        UaOpcServer.Session = null;
        addError( "UaOpcServer.Connect(): Failed to activate session." );
        return( false );
    }
    return( true );
}// UaOpcServer.Connect = function()

/**
 * Function to delete a Node from the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId of the Node to delete
 * @param {boolean} args.DeleteTargetReferences - (Optional) If set to TRUE, the inverse references in the target nodes will be deleted (default=FALSE)
 * @param {boolean} args.DeleteSourceReferences - (Optional) If set to TRUE, the forward reference in the source node will be deleted (default=FALSE)
 * @param {boolean} args.DeleteAllChildren - (Optional) If set to TRUE, all child nodes and their references will also be deleted, excluding shared ones. (default=FALSE)
                                                        Note: This function will only follow references that are a subtype of HasChildren
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.deleteNode()
 */
UaOpcServer.DeleteNode = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.DeleteNode(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.DeleteNode(): No NodeId defined" );
    if( !isDefined( args.DeleteTargetReferences ) ) args.DeleteTargetReferences = false;
    if( !isDefined( args.DeleteSourceReferences ) ) args.DeleteSourceReferences = false;
    if( !isDefined( args.DeleteAllChildren ) ) args.DeleteAllChildren = false;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Deleting Node '" + args.NodeId + "' from embedded OpcServer" );
    var result = gOpcServer.deleteNode( 
        args.NodeId, 
        args.DeleteTargetReferences,
        args.DeleteSourceReferences,
        args.DeleteAllChildren
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.DeleteNode() returned: " + result );
    
    return( result );
}// UaOpcServer.DeleteNode = function( args )

/**
 * Function to delete a Node from the AddressSpace of the embedded OpcServer, including all nodes
 * in the hierarchy starting from this node and all of their references
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The starting Node of the Hierarchy to delete (including the starting node itself)
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * @param {boolean} args.SkipValidation - (Optional) SkipValidation of the browse calls (default=FALSE)
 * 
 * @returns {object} Returns a list of all nodes that have been deleted the according UaStatusCode returned by the call to UaOpcServer.deleteNode()
 */
UaOpcServer.DeleteNodeHierarchy = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.DeleteNodeHierarchy(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.DeleteNodeHierarchy(): No NodeId defined" );
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    if( !isDefined( args.SkipValidation ) ) args.SkipValidation = false;
    
    var result = new Object();
    
    var doDisconnect = false;
    
    if( !isDefined( this.Session ) ) {
        this.Connect();
        doDisconnect = true;
    }
    
    var tempBrowseHelper = new BrowseService( { Session: this.Session } );
    
    // Get all HierarchicalReferences first
    var HierarchicalReferences = [];
    this._getAllHierarchicalReferences = function( nodeId ) {
        var tempNode_mI = new MonitoredItem( nodeId );
        tempBrowseHelper.Execute( { NodesToBrowse: nodeId, SuppressMessaging: args.SuppressMessages, SkipValidation: args.SkipValidation } );
        var references = tempBrowseHelper.Response.Results[0].References;
        for( var b=0; b<references.length; b++ ) {
            if( references[b].IsForward && references[b].ReferenceTypeId.equals( new UaNodeId( Identifier.HasSubtype ) ) ) this._getAllHierarchicalReferences( references[b].NodeId.NodeId );
        }
        HierarchicalReferences.push( nodeId );
        delete tempNode_mI;
    }
    this._getAllHierarchicalReferences( new UaNodeId( Identifier.HierarchicalReferences ) );
    
    // Browse all hierarchically referenced nodes recursively and delete them
    this._deleteNodeHierarchy = function( nodeId ) {
        var tempNode_mI = new MonitoredItem( nodeId );
        tempBrowseHelper.Execute( { NodesToBrowse: nodeId, SuppressMessaging: args.SuppressMessages, SkipValidation: args.SkipValidation } );
        var references = tempBrowseHelper.Response.Results[0].References;
        
        for( var b=0; b<references.length; b++ ) {
            var reference = references[b];
            if( reference.IsForward ) {
                if( ArrayContains( HierarchicalReferences, reference.ReferenceTypeId ) ) this._deleteNodeHierarchy( reference.NodeId.NodeId );
            }
        }
        result[nodeId.toString()] = UaOpcServer.DeleteNode( { 
            NodeId: nodeId,
            DeleteTargetReferences: true,
            DeleteSourceReferences: true,
            SuppressMessages: args.SuppressMessages
        } );
        delete tempNode_mI;
    }
    addLog( "Deleting Node hierarchy starting with '" + args.NodeId + "' from embedded OpcServer" );
    this._deleteNodeHierarchy( args.NodeId );
    
    delete tempBrowseHelper;
    
    if( doDisconnect ) this.Disconnect();
    
    return( result );
}// UaOpcServer.DeleteNodeHierarchy = function( args )

/**
 * Function to delete a Reference from the AddressSpace of the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.SourceNode - The SourceNode of the reference to delete
 * @param {UaNodeId} args.TargetNode - The TargetNode of the reference to delete
 * @param {UaNodeId} args.ReferenceTypeId - The ReferenceTypeId of the reference to delete
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * 
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.deleteReference()
 */
UaOpcServer.DeleteReference = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.DeleteReference(): No args defined" );
    if( !isDefined( args.SourceNode ) ) throw( "UaOpcServer.DeleteReference(): No SourceNode defined" );
    if( !isDefined( args.TargetNode ) ) throw( "UaOpcServer.DeleteReference(): No TargetNode defined" );
    if( !isDefined( args.ReferenceTypeId ) ) throw( "UaOpcServer.DeleteReference(): No ReferenceTypeId defined" );
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    addLog( "Deleting Reference with Source='" + args.SourceNode + 
            "', Target='" + args.TargetNode + 
            "' and ReferenceTypeId='" + args.ReferenceTypeId + "' from embedded OpcServer" );
    var result = gOpcServer.deleteReference( 
        args.SourceNode, 
        args.TargetNode,
        args.ReferenceTypeId
    );
    
    if( result.isBad() && !args.SuppressMessages ) addError( "UaOpcServer.DeleteReference() returned: " + result );
    
    return( result );
}// UaOpcServer.DeleteReference = function( args )

/**
 * Function to disconnect from the embedded OpcServer
 * 
 * @returns {boolean} Returns TRUE on success, FALSE otherwise
 */
UaOpcServer.Disconnect = function() { 
    var args = new Object();
    if( !isDefined( this.Channel ) || !isDefined( this.Session ) ) {
        addError( "UaOpcServer.Disconnect(): Disconnect failed: UaOpcServer not connected" );
        return false
    }
    var disconnectResult = SessionCreator.Disconnect( { channel: this.Channel, session: this.Session } );
    if( disconnectResult ) {
        this.Channel = null;
        this.Session = null;
    }
    return disconnectResult;
}// UaOpcServer.Disconnect = function()

/**
 * Browses a node for child nodes of a certain BrowseName.Name and returns it
 * 
 * @param {UaNodeId} sourceNodeId - The source node to get the child node of
 * @param {string} browseName - The Name part of the BrowseName of the child node to retrieve
 * 
 * @returns {UaNodeId} Returns the first NodeId that fits the conditions, or null if nothing was found
 */
UaOpcServer.GetChildNodeByBrowseName = function( sourceNodeId, browseName ) {
    if( !isDefined( sourceNodeId ) ) throw( "UaOpcServer.GetChildNodeByBrowseName(): Argument sourceNodeId is not defined" );
    if( !isDefined( sourceNodeId.IdentifierType ) ) throw( "UaOpcServer.GetChildNodeByBrowseName(): Argument sourceNodeId does not appear to be a NodeId" );
    if( !isDefined( browseName ) ) throw( "UaOpcServer.GetChildNodeByBrowseName(): Argument browseName is not defined" );
    
    var result = null;
    
    var doDisconnect = false;
    
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    
    var tempBrowseHelper = new BrowseService( { Session: this.Session } );
    
    var sourceNode_mI = new MonitoredItem( sourceNodeId );
    sourceNode_mI.BrowseDirection = BrowseDirection.Forward;
    tempBrowseHelper.Execute( { NodesToBrowse: sourceNode_mI, SuppressMessaging: true, SkipValidation: true } );
    var foundReferences = tempBrowseHelper.Response.Results[0].References;
    for( var b=0; b<foundReferences.length; b++ ) {
        if( foundReferences[b].BrowseName.Name == browseName ) {
            result = foundReferences[b].NodeId.NodeId;
            break;
        }
    }
    delete sourceNode_mI;
    
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return result;
}// UaOpcServer.GetChildNodeByBrowseName = function( sourceNodeId, browseName )

/**
 * Function to get the NamespaceIndex of a namespace in the embedded OpcServer by its NamespaceUri
 * 
 * @param {string} namespaceUri - The NamespaceUri of the Namespace to get the NamespaceIndex from
 * @param {boolean} suppressMessages - (Optional) Suppress messages (default=FALSE)
 *
 * @returns {Number} Returns the NamespaceIndex of the given NamespaceUri or 65535
 *                   if the NamespaceUri was not found
 */
UaOpcServer.GetNamespaceIndexFromUri = function( namespaceUri, suppressMessages ) {
    if( !isDefined( namespaceUri ) ) var namespaceUri = "";
    if( !isDefined( suppressMessages ) ) var suppressMessages = false;
    
    var result = gOpcServer.getNameSpaceIndexFromUri( namespaceUri );
    
    if( result == 65535 && !suppressMessages ) addError( "UaOpcServer.GetNamespaceIndexFromUri(): NamespaceUri '" + namespaceUri + "' not found in the NamespaceArray of the embedded OpcServer" );
    
    return( result );
}// UaOpcServer.GetNamespaceIndexFromUri = function( namespaceUri, suppressMessages )

/**
 * Function to import a NodeSet into the AddressSpace of the embedded OpcServer
 * 
 * @param {string} pathToFile - The path to the xml-file to import, relative to the projects root folder (e.g. "/NodeSetsToImport/NodeSet.xml")
 * @param {boolean} suppressMessages - (Optional) Suppress messages (default=FALSE)
 *
 * @returns {UaStatusCode} Returns the UaStatusCode returned by the internal call to UaOpcServer.importNodeSet()
 */
UaOpcServer.ImportNodeSet = function( pathToFile, suppressMessages ) {
    if( !isDefined( pathToFile ) ) throw( "UaOpcServer.ImportNodeSet(): No path to file specified" );
    if( !isDefined( suppressMessages ) ) var suppressMessages = false;
    
    addLog( "Importing NodeSet '" + pathToFile + "' to embedded OpcServer" );
    var result = gOpcServer.importNodeSet( pathToFile );
    
    if( result.isBad() && !suppressMessages ) addError( "UaOpcServer.ImportNodeSet() returned: " + result );
    
    return( result );
}// UaOpcServer.ImportNodeSet = function( pathToFile, suppressMessages )

/**
 * Function to create an Instance based on an ObjectType node
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.ParentNodeId - The NodeId of the parent node to create the new object in
 * @param {UaQualifiedName} args.BrowseName - The BrowseName of the node to instantiate
 * @param {UaNodeId} args.TypeNodeId - The NodeId of the ObjectType node the instance should be based on
 * @param {boolean} args.UseRandomGuid - Use a random Guid Identifier for new NodeIds (default=FALSE)
 * @param {boolean} args.IncludeOptional - (Optional) If set to TRUE, optional members will be included (default=FALSE)
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 *
 * @returns {UaNodeId} Returns the NodeId of the instantiated object on success, or an empty one if the function fails
 */
UaOpcServer.InstantiateObject = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.InstantiateObject(): No args defined" );
    if( !isDefined( args.ParentNodeId ) ) throw( "UaOpcServer.InstantiateObject(): No ParentNodeId defined" );
    if( !isDefined( args.BrowseName ) ) throw( "UaOpcServer.InstantiateObject(): No BrowseName defined" );
    if( !isDefined( args.TypeNodeId ) ) throw( "UaOpcServer.InstantiateObject(): No TypeNodeId defined" );
    if( !isDefined( args.UseRandomGuid ) ) args.UseRandomGuid = false;
    if( !isDefined( args.IncludeOptional ) ) args.IncludeOptional = false;
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    
    var result = new UaNodeId();
    
    var doDisconnect = false;
    
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    
    var tempBrowseHelper = new BrowseService( { Session: this.Session } );
    var tempReadHelper = new ReadService( { Session: this.Session } );
    
    // Get all HierarchicalReferences first
    var HierarchicalReferences = [];
    this._getAllHierarchicalReferences = function( nodeId ) {
        var tempNode_mI = new MonitoredItem( nodeId );
        tempBrowseHelper.Execute( { NodesToBrowse: nodeId, SuppressMessaging: args.SuppressMessages, SkipValidation: args.SkipValidation } );
        var references = tempBrowseHelper.Response.Results[0].References;
        for( var b=0; b<references.length; b++ ) {
            if( references[b].IsForward && references[b].ReferenceTypeId.equals( new UaNodeId( Identifier.HasSubtype ) ) ) this._getAllHierarchicalReferences( references[b].NodeId.NodeId );
        }
        HierarchicalReferences.push( nodeId );
        delete tempNode_mI;
    }
    this._getAllHierarchicalReferences( new UaNodeId( Identifier.HierarchicalReferences ) );
    
    // Browse all hierarchically referenced nodes recursively and copy them
    this._copyNodeHierarchy = function( typeNodeId, sourceNodeId, newBrowseName, first ) {
        if( !isDefined( first ) ) var first = true;
        // Create node copy
        var tempTypeNodeId_mI = new MonitoredItem( typeNodeId );
        
        // Get references
        tempBrowseHelper.Execute( { NodesToBrowse: tempTypeNodeId_mI, SuppressMessaging: args.SuppressMessages, SkipValidation: args.SkipValidation } );
        var references = tempBrowseHelper.Response.Results[0].References;
        
        // Get NodeClass
        tempTypeNodeId_mI.AttributeId = Attribute.NodeClass;
        tempReadHelper.Execute( { NodesToRead: tempTypeNodeId_mI, SuppressMessaging: args.SuppressMessages } );
        var nodeClass = tempTypeNodeId_mI.Value.Value.toInt32();
        
        // Get BrowseName
        tempTypeNodeId_mI.AttributeId = Attribute.BrowseName;
        tempReadHelper.Execute( { NodesToRead: tempTypeNodeId_mI, SuppressMessaging: args.SuppressMessages } );
        var browseName = tempTypeNodeId_mI.Value.Value.toQualifiedName();
        
        // Get ModellingRule and TypeDefinition
        var modellingRule = new UaNodeId( Identifier.ModellingRule_Optional );
        var typeDefinition = new UaNodeId();
        for( var m=0; m<references.length; m++ ) {
            if( references[m].ReferenceTypeId.equals( new UaNodeId( Identifier.HasModellingRule ) ) ) modellingRule = references[m].NodeId.NodeId;
            if( references[m].ReferenceTypeId.equals( new UaNodeId( Identifier.HasTypeDefinition ) ) ) typeDefinition = references[m].NodeId.NodeId;
        }
        
        if( nodeClass == NodeClass.ObjectType || modellingRule.equals( new UaNodeId( Identifier.ModellingRule_Mandatory ) ) || ( modellingRule.equals( new UaNodeId( Identifier.ModellingRule_Optional ) ) && args.IncludeOptional ) ) {
            
            if( args.UseRandomGuid ) {
                var guidString = "";
                for( var g=0; g<36; g++ ) {
                    switch( g ) {
                        case 8:
                        case 13:
                        case 18:
                        case 23:
                            guidString += "-";
                            break;
                        default:
                            guidString += Math.floor( Math.random() * 16 ).toString(16);
                            break;
                    }
                }
                var newNodeId = new UaNodeId.fromString( "ns=" + typeNodeId.NamespaceIndex + ";g=" + guidString );
            }
            if( first ) {
                if( !args.UseRandomGuid ) var newNodeId = new UaNodeId.fromString( "ns=" + typeNodeId.NamespaceIndex + ";s=" + UaOpcServer.StringIdentifierFromBrowsePath( { NodeId: sourceNodeId } ) + "." + newBrowseName.Name );
                if( UaOpcServer.AddObjectNode( {
                    NodeId:           newNodeId,
                    BrowseName:       newBrowseName,
                    SourceNode:       sourceNodeId,
                    SuppressMessages: args.SuppressMessages
                } ).isGood() ) result = newNodeId;
            }
            else {
                if( !args.UseRandomGuid )var newNodeId = new UaNodeId.fromString( "ns=" + typeNodeId.NamespaceIndex + ";s=" + UaOpcServer.StringIdentifierFromBrowsePath( { NodeId: sourceNodeId } ) + "." + browseName.Name );
                switch( nodeClass ) {
                    case NodeClass.Method:
                        UaOpcServer.AddMethodNode( {
                            NodeId:           newNodeId,
                            BrowseName:       browseName,
                            SourceNode:       sourceNodeId,
                            SuppressMessages: args.SuppressMessages
                        } );
                        break;
                    case NodeClass.Object:
                        UaOpcServer.AddObjectNode( {
                            NodeId:           newNodeId,
                            BrowseName:       browseName,
                            SourceNode:       sourceNodeId,
                            TypeNodeId:       typeDefinition,
                            SuppressMessages: args.SuppressMessages
                        } );
                        break;
                    case NodeClass.Variable:
                        UaOpcServer.AddVariableNode( {
                            NodeId:           newNodeId,
                            BrowseName:       browseName,
                            SourceNode:       sourceNodeId,
                            SuppressMessages: args.SuppressMessages
                        } );
                        break;
                    default:
                }
            }
            
            // Instantiate children
            if( nodeClass != NodeClass.Method && ( nodeClass != NodeClass.ObjectType || first ) ) {
                for( var b=0; b<references.length; b++ ) {
                    var reference = references[b];
                    if( reference.IsForward ) {
                        if( ArrayContains( HierarchicalReferences, reference.ReferenceTypeId ) ) {   
                            this._copyNodeHierarchy( reference.NodeId.NodeId, newNodeId, undefined, false );
                        }
                    }
                }
            }
            
        }
        delete tempTypeNodeId_mI;
    }
    addLog( "Instantiating object of type '" + args.TypeNodeId + "' to '" + args.ParentNodeId + "'" );
    this._copyNodeHierarchy( args.TypeNodeId, args.ParentNodeId, args.BrowseName );
    
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return result;
}// UaOpcServer.InstantiateObject = function( args )

/**
 * Checks if node is under the hierarchy of another node in the embedded server, following SubtypeOf references
 * 
 * @param {UaNodeId} itemNodeId - The NodeId of the subtype to check
 * @param {UaNodeId|Number} typeNodeId - The supertype to check the ItemNodeId being a subtype of
 * 
 * @returns {boolean} Returns TRUE if itemNodeId is a SubType of typeNodeId, otherwise FALSE
 */
UaOpcServer.IsSubTypeOfType = function( itemNodeId, typeNodeId ) {
    if( !isDefined( itemNodeId ) ) throw( "UaOpcServer.IsSubTypeOfType(): Argument itemNodeId is not defined" );
    if( !isDefined( itemNodeId.IdentifierType ) ) throw( "UaOpcServer.IsSubTypeOfType(): Argument itemNodeId does not appear to be a NodeId" );
    if( !isDefined( typeNodeId ) ) throw( "UaOpcServer.IsSubTypeOfType(): Argument itemNodeId is not defined" );
    if( !isDefined( typeNodeId.IdentifierType ) ) typeNodeId = new UaNodeId( typeNodeId );
    var result = false;
    var doDisconnect = false;
    
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    
    var tempBrowseHelper = new BrowseService( { Session: this.Session } );
    
    this._isSubTypeOfType = function( subType, superType ) {
        var subType_mI = new MonitoredItem( subType );
        subType_mI.BrowseDirection = BrowseDirection.Inverse;
        subType_mI.ReferenceTypeId = new UaNodeId( Identifier.HasSubtype );
        subType_mI.IncludeSubtypes = false;
        tempBrowseHelper.Execute( { NodesToBrowse: subType_mI } );
        delete subType_mI;
        var references = tempBrowseHelper.Response.Results[0].References;
        for( var b=0; b<references.length; b++ ) {
            if( !references[b].IsForward && references[b].ReferenceTypeId.equals( new UaNodeId( Identifier.HasSubtype ) ) ) {
                if( references[b].NodeId.NodeId.equals( superType ) ) return true;
                if( this._isSubTypeOfType( references[b].NodeId.NodeId, superType ) ) return true;
            }
        }
        return false;
    }
    
    result = this._isSubTypeOfType( itemNodeId, typeNodeId );
    
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return result;
}// UaOpcServer.IsSubTypeOfType = function( itemNodeId, typeNodeId )

/**
 * Function to dynamically learn EnumDefinitions from the embedded server given the Type NodeId
 * 
 * @param {UaNodeId} nodeId - The NodeId of the Enumeration type to learn
 * 
 * @returns {UaEnumDefinition|boolean} Returns the created UaEnumDefinition on success, FALSE otherwise
 */
UaOpcServer.LearnEnumDefinition = function( nodeId, suppressMessages ) {
    if( !isDefined( nodeId ) ) throw( "UaOpcServer.LearnEnumDefinition(): Argument 'nodeId' is not defined" );
    if( !isDefined( suppressMessages ) ) var suppressMessages = false;
    
    var doDisconnect = false;
    
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    
    var tempReadService = new ReadService( { Session: UaOpcServer.Session } );
    var tempTBPTNI = new TranslateBrowsePathsToNodeIdsService( { Session: UaOpcServer.Session } );
    
    var result = new UaEnumDefinition();
    var resultDataTypeId = nodeId;
    result.setDataTypeId( resultDataTypeId );
    try{
        var mI = new MonitoredItem( nodeId );
    } catch( ex ) {
        if( !suppressMessages ) addError( "UaOpcServer.LearnEnumDefinition(): Error creating new MonitoredItem from argument 'nodeId':\n\t==> " + ex );
        return false;
    }
    mI.AttributeId = Attribute.BrowseName;
    if( !tempReadService.Execute( { NodesToRead: mI, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ], SuppressMessaging: suppressMessages } ) ) {
        if( !suppressMessages ) addError( "UaOpcServer.LearnEnumDefinition(): Could not read BrowseName attribute of Node '" + nodeId + "'" );
        return false;
    }
    var resultName = mI.Value.Value.toQualifiedName().Name;
    result.setName( resultName );
    mI.AttributeId = Attribute.DataTypeDefinition;
    tempReadService.Execute( { NodesToRead: mI, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadAttributeIdInvalid ) ], TimestampsToReturn: TimestampsToReturn.Neither, SuppressMessaging: suppressMessages } );
    if( !mI.Value.Value.isEmpty() ) {
        var enumDefinition_extObj = mI.Value.Value.toExtensionObject();
        if( isDefined( enumDefinition_extObj.TypeId ) ) {
            if( enumDefinition_extObj.TypeId.NodeId.getIdentifierNumeric() == Identifier.EnumDefinition_Encoding_DefaultBinary ) {
                var flatEnumDefinition = enumDefinition_extObj.toEnumDefinition();
                flatEnumDefinition.setDataTypeId( resultDataTypeId );
                flatEnumDefinition.setName( resultName );
                return flatEnumDefinition;
            }
            else {
                if( !suppressMessages ) addWarning( "UaOpcServer.LearnEnumDefinition(): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'.\n" +
                            "TypeId of returned ExtensionObject is not 'i=123' (EnumDefinition_Encoding_DefaultBinary), but is '" + enumDefinition_extObj.TypeId.NodeId + "' (" + Identifier.toString( enumDefinition_extObj.TypeId.NodeId ) + ")" );
                return false;
            }
        }
        else {
            if( !suppressMessages ) addError( "UaOpcServer.LearnEnumDefinition(): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'. Returned variant does not appear to be of type ExtensionObject." );
            return false;
        }
    }
    // if generating the EnumDefinition by the value attribute failed, try reading EnumValues or EnumStrings properties
    if( tempReadService.Response.ResponseHeader.ServiceResult.isGood() && tempReadService.Response.Results[0].StatusCode.StatusCode == StatusCode.BadAttributeIdInvalid ) {
        if( !suppressMessages ) addLog( "UaOpcServer.LearnEnumDefinition(): Node '" + nodeId + "' has no DataTypeDefinition attribute. Trying to read EnumStrings instead." );
    }
    else if( !suppressMessages ) addLog( "UaOpcServer.LearnEnumDefinition(): Reading DataTypeDefinition attribute of Node '" + nodeId + "' returned an empty variant. Trying to read EnumStrings instead." );
    
    // Check for property EnumValues or EnumStrings
    if( !tempTBPTNI.Execute( {
        UaBrowsePaths: [
            UaBrowsePath.New( { StartingNode: nodeId, RelativePathStrings: [ "EnumValues" ] } ),
            UaBrowsePath.New( { StartingNode: nodeId, RelativePathStrings: [ "EnumStrings" ] } )
        ],
        OperationResults: [
            new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ),
            new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] )
        ],
        SuppressMessaging: suppressMessages
    } ) ) return false;
    
    if( tempTBPTNI.Response.Results[0].StatusCode.StatusCode != StatusCode.BadNoMatch ) {
        var mI_EnumValues = new MonitoredItem( tempTBPTNI.Response.Results[0].Targets[0].TargetId.NodeId );
        if( tempReadService.Execute( { NodesToRead: mI_EnumValues, SuppressMessaging: suppressMessages } ) ) {
            if( !mI_EnumValues.Value.Value.isEmpty() ) {
                var enumValueTypeArray = mI_EnumValues.Value.Value.toExtensionObjectArray();
                for( var i=0; i<enumValueTypeArray.length; i++ ) result.addChild( enumValueTypeArray[i].toEnumValueType().DisplayName.Text, enumValueTypeArray[i].toEnumValueType().Value );
            }
            else {
                if( !suppressMessages ) addError( "UaOpcServer.LearnEnumDefinition(): Could not read value attribute of EnumValues property of Node '" + nodeId + "'. Returned variant is empty." );
                return false;
            }
        }
        else {
            if( !suppressMessages ) addError( "UaOpcServer.LearnEnumDefinition(): Failed to read value attribute of EnumValues of type '" + nodeId + "'" );
            return false;
        }
    }
    else if( tempTBPTNI.Response.Results[1].StatusCode.StatusCode != StatusCode.BadNoMatch ) {
        var mI_EnumStrings = new MonitoredItem( tempTBPTNI.Response.Results[1].Targets[0].TargetId.NodeId );
        if( tempReadService.Execute( { NodesToRead: mI_EnumStrings, SuppressMessaging: suppressMessages } ) ) {
            if( !mI_EnumStrings.Value.Value.isEmpty() ) {
                var enumStringsArray = mI_EnumStrings.Value.Value.toLocalizedTextArray();
                for( var i=0; i<enumStringsArray.length; i++ ) result.addChild( enumStringsArray[i].Text, i );
            }
            else {
                if( !suppressMessages ) addError( "UaOpcServer.LearnEnumDefinition(): Could not read value attribute of EnumStrings property of Node '" + nodeId + "'. Returned variant is empty." );
                return false;
            }
        }
        else {
            if( !suppressMessages ) addError( "UaOpcServer.LearnEnumDefinition(): Failed to read value attribute of EnumStrings of type '" + nodeId + "'" );
            return false;
        }
    }
    
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return result;
}// UaOpcServer.LearnEnumDefinition = function( nodeId, suppressMessages )

/**
 * Function to dynamically learn StructureDefinitions from the embedded server given the Type NodeId
 * 
 * @param {UaNodeId} nodeId - The NodeId of the Structure type to learn
 * 
 * @returns {UaStructureDefinition|boolean} Returns the created UaStructureDefinition on success, FALSE otherwise
 */
UaOpcServer.LearnStructureDefinition = function( nodeId, overrideTypeTree, suppressMessages, namespaceIndexReplacement ) {
    if( !isDefined( nodeId ) ) throw( "UaOpcServer.LearnStructureDefinition(): Argument 'nodeId' is not defined" );
    if( !isDefined( suppressMessages ) ) var suppressMessages = false;
    
    if( namespaceIndexReplacement < 0 ) {
        addWarning( "UaOpcServer.LearnStructureDefinition(): Provided namespaceIndexReplacement value of '" + namespaceIndexReplacement + "' is invalid and will be ignored." );
        namespaceIndexReplacement = undefined;
    }
    
    var doDisconnect = false;
    
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    
    var tempReadService = new ReadService( { Session: UaOpcServer.Session } );
    
    if( overrideTypeTree === null || overrideTypeTree === undefined ) overrideTypeTree = [];
    try{
        var mI = new MonitoredItem( nodeId );
    } catch( ex ) {
        if( !suppressMessages ) addError( "UaOpcServer.LearnStructureDefinition(): Error creating new MonitoredItem from argument 'nodeId':\n\t==> " + ex );
        return false;
    }
    mI.AttributeId = Attribute.DataTypeDefinition;
    tempReadService.Execute( { NodesToRead: mI, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadAttributeIdInvalid ) ], TimestampsToReturn: TimestampsToReturn.Neither, SuppressMessaging: suppressMessages } );
    if( mI.Value.Value.isEmpty() ) {
        if( !suppressMessages ) addError( "UaOpcServer.LearnStructureDefinition(): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'. Returned variant is empty." );
        return false;
    }
    else {
        var structureDefinition_extObj = mI.Value.Value.toExtensionObject();
        if( isDefined( structureDefinition_extObj.TypeId ) ) {
            if( structureDefinition_extObj.TypeId.NodeId.getIdentifierNumeric() == Identifier.StructureDefinition_Encoding_DefaultBinary ) {
                var flatStructureDefinition = structureDefinition_extObj.toStructureDefinition();
            }
            else {
                if( !suppressMessages ) addError( "UaOpcServer.LearnStructureDefinition(): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'.\n" +
                          "TypeId of returned ExtensionObject is not 'i=122' (StructureDefinition_Encoding_DefaultBinary), but is '" + structureDefinition_extObj.TypeId.NodeId + "' (" + Identifier.toString( structureDefinition_extObj.TypeId.NodeId ) + ")" );
                return false;
            }
        }
        else {
            if( !suppressMessages ) addError( "UaOpcServer.LearnStructureDefinition(): Could not read DataTypeDefinition attribute of Node '" + nodeId + "'. Returned variant does not appear to be of type ExtensionObject." );
            return false;
        }
    }
    var binEncId = flatStructureDefinition.binaryEncodingId();
    if( isDefined( namespaceIndexReplacement ) ) binEncId.NamespaceIndex = namespaceIndexReplacement;
    var deepStructureDefinition = new UaStructureDefinition();
      deepStructureDefinition.setBaseType         ( flatStructureDefinition.baseTypeId()       );
      deepStructureDefinition.setBinaryEncodingId ( binEncId                                   );
      deepStructureDefinition.setDataTypeId       ( nodeId                                     );
      deepStructureDefinition.setName             ( flatStructureDefinition.name()             );
      deepStructureDefinition.setNamespace        ( flatStructureDefinition.getNamespace()     );
      deepStructureDefinition.setNamespace        ( flatStructureDefinition.getNamespace()     );
      deepStructureDefinition.setUnion            ( flatStructureDefinition.isUnion()          );
    for( var i=0; i<flatStructureDefinition.childrenCount(); i++ ) {
        var baseChildTypeId = flatStructureDefinition.child(i).typeId();
        var childTypeId = baseChildTypeId;
        var childValueType = flatStructureDefinition.child(i).valueType();
        if( isDefined( overrideTypeTree[i] ) && isDefined( overrideTypeTree[i].TypeNodeId ) && isDefined( overrideTypeTree[i].TypeNodeId.getIdentifierNumeric ) ) {
            childTypeId = overrideTypeTree[i].TypeNodeId.clone();
            childValueType = 0;
        }
        var childrenToOverride = ( isDefined( overrideTypeTree[i] ) && overrideTypeTree[i].Children != null ) ? overrideTypeTree[i].Children : [];
        if( childValueType == 0 ) {
            if( !suppressMessages ) addLog( "Getting field information for field '" + flatStructureDefinition.child(i).name() + "' of node '" + nodeId.toString() + "'" );
            var tempStructureField = new UaStructureField();
            tempStructureField.setName           ( flatStructureDefinition.child(i).name()            );
            tempStructureField.setOptional       ( flatStructureDefinition.child(i).isOptional()      );
            tempStructureField.setMaxStringLength( flatStructureDefinition.child(i).maxStringLength() );
            tempStructureField.setArrayDimensions( flatStructureDefinition.child(i).arrayDimensions() );
            
            // children of a union must not be optional
            if( flatStructureDefinition.isUnion() ) tempStructureField.setOptional( false );
            
            var typeName = Identifier.toString( childTypeId );
            if( UaOpcServer.IsSubTypeOfType( childTypeId, Identifier.Enumeration ) ) {
                // Field containing an EnumDefinition
                var fieldEnumDefinition = UaOpcServer.LearnEnumDefinition( childTypeId, suppressMessages );
                if( fieldEnumDefinition !== false ) tempStructureField.setEnumDefinition( fieldEnumDefinition );
                else return false;
            }
            else {
                if( UaOpcServer.IsSubTypeOfType( childTypeId, Identifier.Structure ) ) {
                    // Field containing a Structure
                    // Check if StructureDefinition of the field is abstract
                    var IsAbstract = false;
                    try{
                        var childType_mI = new MonitoredItem( childTypeId );
                    } catch( ex ) {
                        if( !suppressMessages ) addError( "UaOpcServer.LearnStructureDefinition(): Error creating new MonitoredItem for type NodeId '" + childTypeId + "' of field " + i + " (" + tempStructureField.name() + ") of StructureDefinition '" + nodeId + "':\n\t==> " + ex );
                        return false;
                    }
                    childType_mI.AttributeId = Attribute.IsAbstract;
                    tempReadService.Execute( { NodesToRead: childType_mI, OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadAttributeIdInvalid ) ], TimestampsToReturn: TimestampsToReturn.Neither, SuppressMessaging: suppressMessages } );
                    if( !childType_mI.Value.Value.isEmpty() ) IsAbstract = childType_mI.Value.Value.toBoolean();
                    
                    // Allow subtypes if the DataType of the field is abstract
                    var allowSubTypes = ( isDefined( overrideTypeTree[i] ) && overrideTypeTree[i].AllowSubTypes ) ? true : IsAbstract;
                    
                    if( !allowSubTypes ) {
                        var fieldStructureDefinition = UaOpcServer.LearnStructureDefinition( childTypeId, childrenToOverride, suppressMessages, namespaceIndexReplacement );
                    }
                    else {
                        tempStructureField.setAllowSubtypes( true );
                        var fieldStructureDefinition = UaOpcServer.LearnStructureDefinition( baseChildTypeId, undefined, suppressMessages, namespaceIndexReplacement );
                        if( fieldStructureDefinition !== false ) {
                            fieldStructureDefinition = fieldStructureDefinition.createSubtype();
                            var fieldStructureDefinitionSubtype = UaOpcServer.LearnStructureDefinition( childTypeId, undefined, suppressMessages, namespaceIndexReplacement );
                            var binEncId = fieldStructureDefinitionSubtype.binaryEncodingId();
                            if( isDefined( namespaceIndexReplacement ) ) binEncId.NamespaceIndex = namespaceIndexReplacement;
                            fieldStructureDefinition.setName             ( fieldStructureDefinitionSubtype.name()             );
                            fieldStructureDefinition.setDataTypeId       ( fieldStructureDefinitionSubtype.dataTypeId()       );
                            fieldStructureDefinition.setBinaryEncodingId ( binEncId                                           );
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
                    if( fieldStructureDefinition !== false ) tempStructureField.setStructureDefinition( fieldStructureDefinition );
                    else return false;
                }
                else {
                    // check if type is derived from a BuiltInType
                    for( var b=1; b<26; b++ ) {
                        if( UaOpcServer.IsSubTypeOfType( childTypeId, new UaNodeId(b) ) ) {
                            // Field containing a type derived from a BuiltInType
                            if( !suppressMessages ) addLog( "UaOpcServer.LearnStructureDefinition(): " + childTypeId + " is derived from " + Identifier.toString( new UaNodeId(b) ) + " and will be treated as " + Identifier.toString( new UaNodeId(b) ) );
                            tempStructureField.setDataTypeId( childTypeId );
                            tempStructureField.setValueType( b );
                            break;
                        }
                        if( b == 25 ) { // if nothing found
                            if( !suppressMessages ) addError( 
                                "UaOpcServer.LearnStructureDefinition(): Failed to load Fields of StructureDefinition '" + nodeId + "'.\n" +
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
    
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return deepStructureDefinition;
}// UaOpcServer.LearnStructureDefinition = function( nodeId, overrideTypeTree, suppressMessages, namespaceIndexReplacement )

/**
 * Function to check if a Node exists in the embedded server
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId to check the existence of
 * 
 * @returns {boolean} Returns TRUE if the Node exists, FALSE otherwise
 */
UaOpcServer.NodeExists = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.NodeExists(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.NodeExists(): No 'NodeId' defined" );
    
    var result = true;
    
    var doDisconnect = false;
    
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    
    var tempReadService = new ReadService( { Session: UaOpcServer.Session } );
    
    var temp_mI = new MonitoredItem( args.NodeId );
    tempReadService.Execute( { 
        NodesToRead: temp_mI,
        TimestampsToReturn: TimestampsToReturn.Neither,
        SuppressMessaging: true,
        SuppressBadValueStatus: true
    } );
    
    if( tempReadService.Response.Results[0].StatusCode.StatusCode == StatusCode.BadNodeIdUnknown ) result = false;
    
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return result;
}// UaOpcServer.NodeExists = function( args )

/**
 * Procedure to restart the embedded OpcServer
 * 
 * @param {object} args - An object containing all parameter
 * @param {boolean} args.SkipTestReconnect - (Optional) If set, the function will not call Test.Disconnect() before
 *                                           and Test.Connect() after restarting the OpcServer (default=FALSE)
 * @param {Number} args.SecondsToWaitAfterStop - (Optional) Seconds to wait after stopping the
 *                                               server to give clients time to recognize (default=0)
 * @param {boolean} args.ClearPubSubConfig - (Optional) If set to TRUE, the PubSubConfig will be cleared (default=FALSE)
 */
UaOpcServer.restartServer = function( args ) {
    if( !isDefined( args ) ) args = new Object();
    if( !isDefined( args.SkipTestReconnect ) ) args.SkipTestReconnect = false;
    if( !isDefined( args.SecondsToWaitAfterStop ) ) args.SecondsToWaitAfterStop = 0;
    if( !isDefined( args.ClearPubSubConfig ) ) args.ClearPubSubConfig = false;
    
    var doConnect = false;
    
    if( isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Disconnect();
        doConnect = true;
    }
    
    if( args.ClearPubSubConfig ) gOpcServer.setPubSubConfiguration2DataType( new UaPubSubConfiguration2DataType() );
    
    if( !args.SkipTestReconnect ) Test.Disconnect();
    gOpcServer.stopServer( args.SecondsToWaitAfterStop );
    gOpcServer = new UaOpcServer();
    gOpcServer.startServer();
    if( !args.SkipTestReconnect ) Test.Connect();
    
    if( doConnect ) UaOpcServer.Connect();
    
}// UaOpcServer.restartServer = function( args )

/**
 * Sets and loads a given PubSubConfiguration in the embedded server and caches it in UaOpcServer.CurrentPubSubConfig
 * 
 * @param {UaPubSubConfiguration2DataType} pubSubConfig - The PubSubConfig to set
 * 
 * @returns {boolean} Returns TRUE on success, FALSE otherwise.
                      If the function fails, UaOpcServer.CurrentPubSubConfig will remain unchanged
 */
UaOpcServer.SetCurrentPubSubConfig = function( pubSubConfig ) {
    if( !isDefined( pubSubConfig ) ) throw( "UaOpcServer.SetCurrentPubSubConfig(): No pubSubConfig defined" );
    var result = gOpcServer.setPubSubConfiguration2DataType( pubSubConfig );
    if( result ) UaOpcServer.CurrentPubSubConfig = pubSubConfig.clone();
    return result;
}// UaOpcServer.SetCurrentPubSubConfig = function( pubSubConfig )
    
/**
 * Resolves the BrowsePath of a Node in the embedded server and creates a String Identifier from it
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaNodeId} args.NodeId - The NodeId to resolve the BrowsePath of
 * @param {boolean} args.SuppressMessages - (Optional) Suppress messages (default=FALSE)
 * @param {boolean} args.SkipValidation - (Optional) SkipValidation of the browse calls (default=FALSE)
 * 
 * @returns {string} Returns the BrowsePath as string, seperated with '.', or an empty string on error
 */
UaOpcServer.StringIdentifierFromBrowsePath = function( args ) {
    if( !isDefined( args ) ) throw( "UaOpcServer.StringIdentifierFromBrowsePath(): No args defined" );
    if( !isDefined( args.NodeId ) ) throw( "UaOpcServer.StringIdentifierFromBrowsePath(): No NodeId defined" );
    if( !isDefined( args.SuppressMessages ) ) args.SuppressMessages = false;
    if( !isDefined( args.SkipValidation ) ) args.SkipValidation = false;
    
    var result = "";
    
    var doDisconnect = false;
    
    if( !isDefined( UaOpcServer.Session ) ) {
        UaOpcServer.Connect();
        doDisconnect = true;
    }
    
    var tempBrowseHelper = new BrowseService( { Session: this.Session } );
    var tempReadHelper = new ReadService( { Session: this.Session } );
    
    // Get all HierarchicalReferences first
    var HierarchicalReferences = [];
    this._getAllHierarchicalReferences = function( nodeId ) {
        var tempNode_mI = new MonitoredItem( nodeId );
        tempBrowseHelper.Execute( { NodesToBrowse: nodeId, SuppressMessaging: args.SuppressMessages, SkipValidation: args.SkipValidation } );
        var references = tempBrowseHelper.Response.Results[0].References;
        for( var b=0; b<references.length; b++ ) {
            if( references[b].IsForward && references[b].ReferenceTypeId.equals( new UaNodeId( Identifier.HasSubtype ) ) ) this._getAllHierarchicalReferences( references[b].NodeId.NodeId );
        }
        HierarchicalReferences.push( nodeId );
        delete tempNode_mI;
    }
    this._getAllHierarchicalReferences( new UaNodeId( Identifier.HierarchicalReferences ) );
    
    this._getBrowsePath = function( targetId, browsePath ) {
        var targetId_mI = new MonitoredItem( targetId );
        targetId_mI.AttributeId = Attribute.BrowseName;
        tempReadHelper.Execute( { NodesToRead: targetId_mI } );
        var currentBrowseName = targetId_mI.Value.Value.toQualifiedName().Name;
        
        targetId_mI.BrowseDirection = BrowseDirection.Inverse;
        tempBrowseHelper.Execute( { NodesToBrowse: targetId_mI } );
        delete targetId_mI;
        
        var references = tempBrowseHelper.Response.Results[0].References;
        for( var b=0; b<references.length; b++ ) {
            if( !references[b].IsForward && ArrayContains( HierarchicalReferences, references[b].ReferenceTypeId ) ) {
                browsePath = currentBrowseName + ( browsePath.length == 0 ? "" : "." ) + browsePath;
                return this._getBrowsePath( references[b].NodeId.NodeId, browsePath );
            }
        }
        return browsePath;
    }
    
    result = this._getBrowsePath( args.NodeId, "" );
    
    if( doDisconnect ) UaOpcServer.Disconnect();
    
    return result;
}// UaOpcServer.StringIdentifierFromBrowsePath = function( args )