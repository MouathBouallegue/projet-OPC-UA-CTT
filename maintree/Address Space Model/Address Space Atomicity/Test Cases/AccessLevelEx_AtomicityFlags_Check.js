/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Atomicity flags in the AccessLevelEx are used.
*/

function test() {
    var TC_Variables = new Object();
    TC_Variables.Result = false;
    TC_Variables.NodeIds = [];
    TC_Variables.UsableNodes = [];

    TC_Variables.Nodes = FindObjectsOfTypeHelper.Execute( { TypeToFind: new UaNodeId( Identifier.BaseVariableType ), IncludeSubTypes: true, MaxNodesToReturn: 10000 } );
    if( TC_Variables.Nodes.result === true ) {
        for( var index = 0; index < TC_Variables.Nodes.nodes.length; index++ ) {
            var nodeInformation = CU_Variables.LocalModelMap.Get( TC_Variables.Nodes.nodes[index] );
            if( isDefined( nodeInformation ) ) {
                CU_Variables.LocalModelMapService.FindPaths( nodeInformation );
                if( isDefined( nodeInformation.Paths ) ) {
                    var isNotUsable = false;
                    for( var i = 0; i < nodeInformation.Paths.length; i++ ) {
                        if( nodeInformation.Paths[i].indexOf( "Root/Types/" ) > -1 || nodeInformation.Paths[i].indexOf( "/ServerDiagnostics" ) > -1 ) {
                            isNotUsable = true;
                            break;
                        }
                    }
                    if( !isNotUsable ) TC_Variables.NodeIds.push( TC_Variables.Nodes.nodes[index] );
                }
            }
        }
        if( isDefined( TC_Variables.NodeIds ) && TC_Variables.NodeIds.length > 0 ) {
            TC_Variables.Instances = MonitoredItem.fromNodeIds( TC_Variables.NodeIds );
            if( isDefined( TC_Variables.Instances ) && TC_Variables.Instances.length > 0 ) {
                for( index = 0; index < TC_Variables.Instances.length; index++ ) {
                    TC_Variables.Instances[index].AttributeId = Attribute.AccessLevelEx;
                }
                ReadHelper.Execute( { NodesToRead: TC_Variables.Instances, SuppressMessaging: true, SuppressBadValueStatus: true } );
                for( index = 0; index < TC_Variables.Instances.length; index++ ) {
                    var value = null;
                    if( isDefined( TC_Variables.Instances[index].Value.Value ) ) {
                        try {
                            value = TC_Variables.Instances[index].Value.Value.toUInt32();
                            if( isDefined( value ) ) {
                                if( value >> 8 & 3 !== 0 ) {
                                    TC_Variables.UsableNodes.push( TC_Variables.Instances[index].NodeId.toString() );
                                }
                            }
                        }
                        catch( e ) {
                            addError( "Converting value failed." );
                        }
                    }
                }
            }
        }
    }
    if( TC_Variables.UsableNodes.length < 1 ) {
        addNotSupported( "No node found that have the NonatomicRead or NonatomicWrite flag in the AccessLevelEx attribute set. Skipping Conformance Unit." );
        stopCurrentUnit();
    }
    else {
        addLog( "Nodes that can be used for subsequent Test Cases: " + TC_Variables.UsableNodes );
        TC_Variables.Result = true;
    }
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: test } );
