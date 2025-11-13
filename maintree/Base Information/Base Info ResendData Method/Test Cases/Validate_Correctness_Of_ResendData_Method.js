/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Validate the correctness of the ResendData method.
*/

function test() {
    var TC_Variables = new Object();
    var inputArgumentsArrayAsExtensionObjectArray = null;
    var inputArgument = null;
    var i = 0;
    TC_Variables.TestResult = true;

    if( isDefined( CU_Variables.LocalModelMap ) ) {
        TC_Variables.References = CU_Variables.LocalModelMap.Get( CU_Variables.ResendData.TypeSystemNode.NodeId.toString() );
        if( isDefined( TC_Variables.References ) && isDefined( TC_Variables.References.ReferenceDescriptions ) && TC_Variables.References.ReferenceDescriptions.length > 0 ) {
            for( i = 0; i < TC_Variables.References.ReferenceDescriptions.length; i++ ) {
                if( TC_Variables.References.ReferenceDescriptions[i].BrowseName.Name === "InputArguments" ) {
                    TC_Variables.InputArguments = new MonitoredItem( TC_Variables.References.ReferenceDescriptions[i].NodeId.NodeId );
                    if( ReadHelper.Execute( { NodesToRead: TC_Variables.InputArguments } ) ) {
                        if( ReadHelper.Response.Results[0].StatusCode.isGood() ) {
                            try {
                                inputArgumentsArrayAsExtensionObjectArray = ReadHelper.Response.Results[0].Value.toExtensionObjectArray();
                                if( !Assert.Equal( 1, inputArgumentsArrayAsExtensionObjectArray.length, "Received an unexpected length for the InputArguments (" + TC_Variables.InputArguments.NodeId + ") of ResendData method (" + CU_Variables.ResendData.TypeSystemNode.NodeId + ").", "The length of the InputArguments matches the expectations." ) ) TC_Variables.TestResult = false;
                                else {
                                    inputArgument = inputArgumentsArrayAsExtensionObjectArray[0].toArgument();
                                    if( !Assert.Equal( new UaNodeId( BuiltInType.UInt32 ), inputArgument.DataType, "Received an unexpected DataType for for the InputArgument (" + TC_Variables.InputArguments.NodeId + ") of ResendData method (" + CU_Variables.ResendData.TypeSystemNode.NodeId + ").", "DataTypeValidation of InputArgument (" + TC_Variables.InputArguments.NodeId + ") of ResendData method (" + CU_Variables.ResendData.TypeSystemNode.NodeId + ") succeeded." ) ) TC_Variables.TestResult = false;
                                }
                            }
                            catch( e ) {
                                addError( "Received an unexpected value when reading InputArguments (" + TC_Variables.InputArguments.NodeId + ") of ResendData method (" + CU_Variables.ResendData.TypeSystemNode.NodeId + ")." );
                                TC_Variables.TestResult = false;
                            }
                        }
                    }
                    break;
                }
            }
            if( i === TC_Variables.References.ReferenceDescriptions.length ) {
                addError( "Unable to find InputArguments of ResendData method (" + CU_Variables.ResendData.TypeSystemNode.NodeId + ")." );
                TC_Variables.TestResult = false;
            }
        }
        else {
            addWarning( "Unable to find ResendData method in the TypeDefinition of ServerType. This is only allowed for servers supporting the Nano Embedded Device Profil or Micro Embedded Device Profile." );
        }

        inputArgumentsArrayAsExtensionObjectArray = null;
        inputArgument = null;
        delete TC_Variables.References;
        delete TC_Variables.InputArguments

        TC_Variables.References = CU_Variables.LocalModelMap.Get( CU_Variables.ResendData.InstanceNode.NodeId.toString() );
        if( isDefined( TC_Variables.References ) && isDefined( TC_Variables.References.ReferenceDescriptions ) && TC_Variables.References.ReferenceDescriptions.length > 0 ) {
            for( i = 0; i < TC_Variables.References.ReferenceDescriptions.length; i++ ) {
                if( TC_Variables.References.ReferenceDescriptions[i].BrowseName.Name === "InputArguments" ) {
                    TC_Variables.InputArguments = new MonitoredItem( TC_Variables.References.ReferenceDescriptions[i].NodeId.NodeId );
                    if( ReadHelper.Execute( { NodesToRead: TC_Variables.InputArguments } ) ) {
                        if( ReadHelper.Response.Results[0].StatusCode.isGood() ) {
                            try {
                                inputArgumentsArrayAsExtensionObjectArray = ReadHelper.Response.Results[0].Value.toExtensionObjectArray();
                                if( !Assert.Equal( 1, inputArgumentsArrayAsExtensionObjectArray.length, "Received an unexpected length for the InputArguments (" + TC_Variables.InputArguments.NodeId + ") of ResendData method (" + CU_Variables.ResendData.InstanceNode.NodeId + ").", "The length of the InputArguments matches the expectations." ) ) TC_Variables.TestResult = false;
                                else {
                                    inputArgument = inputArgumentsArrayAsExtensionObjectArray[0].toArgument();
                                    if( !Assert.Equal( new UaNodeId( BuiltInType.UInt32 ), inputArgument.DataType, "Received an unexpected DataType for for the InputArgument (" + TC_Variables.InputArguments.NodeId + ") of ResendData method (" + CU_Variables.ResendData.InstanceNode.NodeId + ").", "DataTypeValidation of InputArgument (" + TC_Variables.InputArguments.NodeId + ") of ResendData method (" + CU_Variables.ResendData.InstanceNode.NodeId + ") succeeded." ) ) TC_Variables.TestResult = false;
                                }
                            }
                            catch( e ) {
                                addError( "Received an unexpected value when reading InputArguments (" + TC_Variables.InputArguments.NodeId + ") of ResendData method (" + CU_Variables.ResendData.InstanceNode.NodeId + ")." );
                                TC_Variables.TestResult = false;
                            }
                        }
                    }
                    break;
                }
            }
            if( i === TC_Variables.References.ReferenceDescriptions.length ) {
                addError( "Unable to find InputArguments of ResendData method (" + CU_Variables.ResendData.InstanceNode.NodeId + ")." );
                TC_Variables.TestResult = false;
            }
        }
    }

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );