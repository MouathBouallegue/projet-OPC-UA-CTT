include( "./library/Base/safeInvoke.js" );
include( "./library/OPC UA FX/Base.js" );

CU_Variables = new Object();
CU_Variables.CU_Name = "UAFX AutomationComponent ConnectionEstablishment ReserveCommunicationIds";

CU_Variables.Test = new Object();
CU_Variables.TC001_Failed = false;

if( Test.Connect() ) {
    // Start SessionThread
    CU_Variables.SessionThread = new SessionThread();
    CU_Variables.SessionThread.Start( { Session: Test.Session } );
    if( !initializeStandardVariables( { TestObject: CU_Variables.Test } ) ) {
        addError( "Error while initializing. Aborting CU." );
        stopCurrentUnit();
    }
    else {
        // Get DefaultDatagramPublisherId
        var DefaultDatagramPublisherId_item = new MonitoredItem( new UaNodeId( Identifier.PublishSubscribe_DefaultDatagramPublisherId ) );
        if( ReadHelper.Execute( { NodesToRead: DefaultDatagramPublisherId_item, OperationResults: [ new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) ] } ) ) {
            if( DefaultDatagramPublisherId_item.Value.StatusCode.StatusCode == StatusCode.BadNodeIdUnknown ) addWarning( "Optional DefaultDatagramPublisherId property is not exposed. Tests will not compare the returned DefaultPublisherId argument, but only test if something >0 is returned." );
            else CU_Variables.DefaultDatagramPublisherId = DefaultDatagramPublisherId_item.Value.Value;
        }
        
        // Get MaxDataSetWriters
        var MaxDataSetWriters_item = new MonitoredItem( new UaNodeId( Identifier.PublishSubscribe_PubSubCapablities_MaxDataSetWriters ) );
        if( ReadHelper.Execute( { NodesToRead: MaxDataSetWriters_item, OperationResults: [ new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) ] } ) ) {
            if( MaxDataSetWriters_item.Value.StatusCode.StatusCode != StatusCode.BadNodeIdUnknown ) CU_Variables.MaxDataSetWriters = MaxDataSetWriters_item.Value.Value;
        }
        
        // Get MaxWriterGroups
        var MaxWriterGroups_item = new MonitoredItem( new UaNodeId( Identifier.PublishSubscribe_PubSubCapablities_MaxWriterGroups ) );
        if( ReadHelper.Execute( { NodesToRead: MaxWriterGroups_item, OperationResults: [ new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) ] } ) ) {
            if( MaxWriterGroups_item.Value.StatusCode.StatusCode != StatusCode.BadNodeIdUnknown ) CU_Variables.MaxWriterGroups = MaxWriterGroups_item.Value.Value;
        }
        
        // Check if PublishSubscribe object is exposed
        CU_Variables.PublishSubscribeObject = CheckHasReferenceToNodeId( { 
            SourceNode: new UaNodeId( Identifier.Server ),
            TargetNode: new UaNodeId( Identifier.PublishSubscribe ),
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
        } );
        
        CU_Variables.SupportedTransportProfiles = [ "http://opcfoundation.org/UA-Profile/Transport/pubsub-udp-uadp" ];
        
        if( isDefined( CU_Variables.PublishSubscribeObject ) ) {
            // Get SupportedTransportProfiles
            var SupportedTransportProfiles_item = new MonitoredItem( new UaNodeId( Identifier.PublishSubscribe_SupportedTransportProfiles ) );
            if( ReadHelper.Execute( { NodesToRead: SupportedTransportProfiles_item, OperationResults: [ new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) ] } ) ) {
                CU_Variables.SupportedTransportProfiles = SupportedTransportProfiles_item.Value.Value.toStringArray();
            }
        }
    }
}
else stopCurrentUnit();

print( "\n\n\n***** CONFORMANCE UNIT '" + CU_Variables.CU_Name + "' TESTING BEGINS ******\n" );