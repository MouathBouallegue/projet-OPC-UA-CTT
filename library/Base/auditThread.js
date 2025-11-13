include( "./library/Base/sessionThread.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/subscription.js" );

include( "./library/Base/whereClauseCreator.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode.js" );
include( "./library/Base/Objects/keyPairCollection.js" );
include( "./library/ClassBased/Events.js" );


/* 
    An Encapsulation of a thread specifically used for handling the behind the scenes 
    audit event testing.  This has the potential to be used by the Full Run with beforetest and aftertest,
    or individually if so desired.
*/

function AuditThread(){

    this.Started = false;
    this.SessionThread = null;
    this.Subscription = null;
    this.EventMonitoredItem = null;
    this.SubscriptionCreated = false;
    this.ItemCreated = false;
    this._SelectFields = null;
    this.WhereClauseCreator = new WhereClauseCreatorService();
    this.SetPublishingModeFunction = null;

    //#region Select Fields

    this.baseEventTypeFields = [
        "EventId",
        "EventType",
        "SourceNode",
        "SourceName",
        "Time",
        "ReceiveTime",
        "LocalTime",
        "Message",
        "Severity"
    ];

    this.auditEventTypeFields = [
        "ActionTimeStamp",
        "Status",
        "ServerId",
        "ClientAuditEntryId",
        "ClientUserId"
    ];

    this.auditSecurityEventTypeFields = [ "StatusCodeId" ];

    this.auditChannelEventTypeFields = [ "SecureChannelId" ];

    this.auditOpenSecureChannelEventTypeFields = [
        "ClientCertificate",
        "ClientCertificateThumbprint",
        "RequestType",
        "SecurityPolicyUri",
        "SecurityMode",
        "RequestedLifetime"
    ];

    this.auditSessionEventTypeFields = [    
        "SessionId"
    ];
    
    this.auditCreateSessionEventTypeFields = [    
        "SecureChannelId",
        "ClientCertificate",
        "ClientCertificateThumbprint",
        "RevisedSessionTimeout"
    ];
    
    this.auditUrlMismatchEventTypeFields = [    
        "EndpointUrl"
    ];
    
    this.auditActivateSessionEventTypeFields = [    
        "ClientSoftwareCertificates",
        "UserIdentityToken",
        "SecureChannelId"
    ];
    
    this.auditCancelEventTypeFields = [    
        "RequestHandle"
    ];
    
    this.auditCertificateEventTypeFields = [    
        "Certificate"
    ];
    
    this.auditCertificateDataMismatchEventTypeFields = [    
        "InvalidHostname",
        "InvalidUri"
    ];
    
    this.auditCertificateExpiredEventTypeFields = [];
    
    this.auditCertificateInvalidEventTypeFields = [];
    
    this.auditCertificateUntrustedEventTypeFields = [];
    
    this.auditCertificateRevokedEventTypeFields = [];
    
    this.auditCertificateMismatchEventTypeFields = [];
    
    this.auditNodeManagementEventTypeFields = [];
    
    this.auditAddNodesEventTypeFields = [
        "NodesToAdd"
    ];
    
    this.auditDeleteNodesEventTypeFields = [
        "NodesToDelete"
    ];
    
    this.auditAddReferencesEventTypeFields = [
        "ReferencesToAdd"
    ];
    
    this.auditDeleteReferencesEventTypeFields = [
        "ReferencesToDelete"
    ];
    
    this.auditUpdateEventTypeFields = [];
    
    this.auditWriteUpdateEventTypeFields = [
        "AttributeId",
        "IndexRange",
        "NewValue",
        "OldValue"
    ];
    
    this.auditHistoryUpdateEventTypeFields = [
        "ParameterDataTypeId"
    ];
    
    this.auditUpdateMethodEventTypeFields = [
        "MethodId",
        "InputArguments"
    ];

    this.SelectFields = function(){
        if ( this._SelectFields == null ){
            var dictionary = new KeyPairCollection();
            this.addSelectFields( this.baseEventTypeFields, dictionary );
            this.addSelectFields( this.auditEventTypeFields, dictionary );
            this.addSelectFields( this.auditSecurityEventTypeFields, dictionary );
            this.addSelectFields( this.auditChannelEventTypeFields, dictionary );
            this.addSelectFields( this.auditOpenSecureChannelEventTypeFields, dictionary );
            this.addSelectFields( this.auditSessionEventTypeFields, dictionary );
            this.addSelectFields( this.auditCreateSessionEventTypeFields, dictionary );
            this.addSelectFields( this.auditUrlMismatchEventTypeFields, dictionary );
            this.addSelectFields( this.auditActivateSessionEventTypeFields, dictionary );
            this.addSelectFields( this.auditCancelEventTypeFields, dictionary );
            this.addSelectFields( this.auditCertificateEventTypeFields, dictionary );
            this.addSelectFields( this.auditCertificateDataMismatchEventTypeFields, dictionary );
            this.addSelectFields( this.auditCertificateExpiredEventTypeFields, dictionary );
            this.addSelectFields( this.auditCertificateInvalidEventTypeFields, dictionary );
            this.addSelectFields( this.auditCertificateUntrustedEventTypeFields, dictionary );
            this.addSelectFields( this.auditCertificateRevokedEventTypeFields, dictionary );
            this.addSelectFields( this.auditCertificateMismatchEventTypeFields, dictionary );
            this.addSelectFields( this.auditNodeManagementEventTypeFields, dictionary );
            this.addSelectFields( this.auditAddNodesEventTypeFields, dictionary );
            this.addSelectFields( this.auditDeleteNodesEventTypeFields, dictionary );
            this.addSelectFields( this.auditAddReferencesEventTypeFields, dictionary );
            this.addSelectFields( this.auditDeleteReferencesEventTypeFields, dictionary );
            this.addSelectFields( this.auditUpdateEventTypeFields, dictionary );
            this.addSelectFields( this.auditWriteUpdateEventTypeFields, dictionary );
            this.addSelectFields( this.auditHistoryUpdateEventTypeFields, dictionary );
            this.addSelectFields( this.auditUpdateMethodEventTypeFields, dictionary );
            this._SelectFields = dictionary.Values();
        }

        return this._SelectFields;
    }

    this.addSelectFields = function( array, dictionary ){
        for( var index = 0; index < array.length; index++ ) {
            var currentValue = array[index];

            if ( !dictionary.Contains( currentValue ) ){
                dictionary.Set( currentValue, currentValue );
            }
        }
    }

    this.GetSelectFieldIndex = function( fieldName ){
        var fieldIndex = -1;
        var selectFields = this.SelectFields();

        for( var index = 0; index < selectFields.length; index++ ){
            if ( selectFields[index] == fieldName ){
                fieldIndex = index;
                break;
            }
        }

        return fieldIndex;
    }

    //#endregion

    this.Start = function( args ){
        if ( isDefined( args ) ){
            print("AuditThread::Start args = " + args );
        }
        if ( args === 'true' || ( isDefined( args ) && isDefined( args.MonitoredItems ) ) ){
            this.SessionThread = new SessionThread();
            if ( this.SessionThread.Start() ){
                print( "AuditThread - Thread Created" );
                this.Started = true;
                this.AddEventItem( args );  
            }else{
                print( "AuditThread - Thread not started" );
            }
        }
    }

    this.End = function( ){
        if ( this.Started ){
            if ( this.SubscriptionCreated === true ){
                this.RemoveEventItem();
            }
            print( "Killing Thread" );
            this.SessionThread.End();
            this.SessionThread = null;
        }
    }

    this.AddEventItem = function( args ){
        print( "AuditThread - AddEventItem Started" );

        this.EventMonitoredItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ) )[0];
        this.EventMonitoredItem.AttributeId = Attribute.EventNotifier;
        this.EventMonitoredItem.Filter = UaEventFilter.New( {
                SelectClauses: this.CreateSelect( this.SelectFields() ) } ).toExtensionObject();

        var monitoredItems = [];
        monitoredItems.push( this.EventMonitoredItem );
        
        if ( isDefined( args ) && isDefined( args.MonitoredItems ) ){
            if ( isDefined( args.MonitoredItems.length ) ){
                for( var index = 0; index < args.MonitoredItems.length; index++ ){
                    monitoredItems.push( args.MonitoredItems[index]);
                }
            }else{
                monitoredItems.push( args.MonitoredItems );
            }
        }

        print( "AuditThread - Creating Subscription" );
    
        this.Subscription = new Subscription( );
        print( "AuditThread - Creating Subscription on server" );
        if ( !this.SessionThread.Helpers.CreateSubscriptionHelper.Execute( 
            { Subscription: this.Subscription, ThreadId : this.SessionThread.ThreadId } ) ){
                print( "Fatal Error - Unable to create audit event subscription" );
        }else{
            print( "AuditThread - Subscription Created" );
            this.SubscriptionCreated = true;
            if ( !this.SessionThread.Helpers.CreateMonitoredItemsHelper.Execute( 
                { ItemsToCreate: monitoredItems, SubscriptionId: this.Subscription, ThreadId : this.SessionThread.ThreadId } ) ){
                    print( "Fatal Error - Unable to create audit event Monitored Item" );
            }else{
                print( "AuditThread - MonitoredItems Created" );
                this.ItemCreated = true;
            }
        }
    }

    this.RemoveEventItem = function(){
        if ( this.SubscriptionCreated === true ){
            this.SessionThread.Helpers.DeleteSubscriptionsHelper.Execute( { SubscriptionId: this.Subscription } );
            this.Subscription = null;
        }
    }

    this.GetBuffer = function(){

        if ( this.Started === true && this.SubscriptionCreated === true ){
            var getBufferResults = this.SessionThread.Helpers.GetBufferHelper.Execute(
                { ThreadId: this.SessionThread.ThreadId,
                 SubscriptionId: this.Subscription.SubscriptionId,
                 ClientId: this.EventMonitoredItem.ClientHandle }
            );

            if ( getBufferResults.status === true ){
                print( 'AuditThread::GetBuffer succeeded' );
            }else{
                print( 'AuditThread::GetBuffer failed' );
            }

            return getBufferResults;
        }else{
            print( 'AuditThread::GetBuffer failed due to thread and or subscription not started' );
        }

        return{status: false, events: null};
    }

    this.RemoveEntry = function( eventEntryIds ){
        
        var success = false;
        
        if ( this.Started === true && this.SubscriptionCreated === true ){
            if ( isDefined( eventEntryIds ) && eventEntryIds.length > 0 ){

                success = this.SessionThread.Helpers.RemoveEntryHelper.Execute(
                    { ThreadId: this.SessionThread.ThreadId,
                      SubscriptionId: this.Subscription.SubscriptionId,
                      ClientId: this.EventMonitoredItem.ClientHandle,
                      EventEntries : eventEntryIds }
                );
    
                if ( success === true ){
                    print( 'AuditThread::RemoveEntry succeeded' );
                }else{
                    print( 'AuditThread::RemoveEntry failed' );
                }
    
            }else{
                print( 'AuditThread::RemoveEntry failed due to bad event entry ids' );
            }

        }else{
            print( 'AuditThread::RemoveEntry failed due to thread and or subscription not started' );
        }

        return success;
    }

    this.FindEntry = function( filter ){
        var findEntryResults = {status:false, EventEntries : null };        
        if ( this.Started === true && this.SubscriptionCreated === true ){
            if ( isDefined( filter ) ){

                findEntryResults = this.SessionThread.Helpers.FindEntryHelper.Execute(
                    { ThreadId: this.SessionThread.ThreadId,
                     SubscriptionId: this.Subscription.SubscriptionId,
                     ClientId: this.EventMonitoredItem.ClientHandle,
                     EventFilter : filter }
                );
    
                if ( findEntryResults.status === true ){
                    print( 'AuditThread::FindEntry succeeded' );
                }else{
                    print( 'AuditThread::FindEntry failed' );
                }
    
            }else{
                print( 'AuditThread::FindEntry failed due to no filter' );
            }

        }else{
            print( 'AuditThread::FindEntry failed due to thread and or subscription not started' );
        }

        return findEntryResults;
    }

    this.FindEntryVerbose = function( select, where ){
        var success = false;
        
        var filter = new UaEventFilter( );
        
        filter.SelectClauses = this.CreateSelect( select );
        if( isDefined( where ) ){
            filter.WhereClause = where;
        }

        return this.FindEntry( filter );
    }

    this.PushAuditRecord = function( args ){

        var result = true;

        var name = "Audit::PushAuditRecord";

        if ( isDefined( this.SessionThread )               && 
             isDefined( this.SessionThread.ThreadId )      &&
             isDefined( this.Subscription )                &&
             isDefined( this.Subscription.SubscriptionId ) && 
             isDefined( this.EventMonitoredItem )          &&
             isDefined( this.EventMonitoredItem.ClientHandle ) ) {
            
            if ( !isDefined( args ) ){ throw( name + " - args not specified" ); }
            args.ThreadId = this.SessionThread.ThreadId;
            args.SubscriptionId = this.Subscription.SubscriptionId;
            args.ClientId = this.EventMonitoredItem.ClientHandle;

            result = this.SessionThread.Helpers.PushAuditRecordHelper.Execute( args );
        }else{
            print( name + " - Thread and/or Subscription id is not initialized yet" );
        }

        return result;
    }

    this.GetAuditEventParams = function( args ){
        var result = true;

        var name = "Audit::GetAuditEventParams";

        if ( isDefined( this.SessionThread )                && 
             isDefined( this.SessionThread.ThreadId )       &&
             isDefined( this.Subscription )                 &&
             isDefined( this.Subscription.SubscriptionId    &&
             isDefined( this.EventMonitoredItem )           &&
             isDefined( this.EventMonitoredItem.ClientHandle ) ) ) {
            
            if ( !isDefined( args ) ){ throw( name + " - args not specified" ); }
            args.ThreadId = this.SessionThread.ThreadId;
            args.SubscriptionId = this.Subscription.SubscriptionId;
            args.ClientId = this.EventMonitoredItem.ClientHandle;

            result = this.SessionThread.Helpers.GetAuditEventParamsHelper.Execute( args );
        }else{
            print( name + " - Thread and/or Subscription id is not initialized yet" );
        }

        return result;
    }

    this.DropAuditRecord = function( eventEntryIds ){
        
        var success = false;
        
        if ( this.Started === true && this.SubscriptionCreated === true ){
            if ( isDefined( eventEntryIds ) && eventEntryIds.length > 0 ){

                success = this.SessionThread.Helpers.DropAuditRecordHelper.Execute(
                    { ThreadId: this.SessionThread.ThreadId,
                      SubscriptionId: this.Subscription.SubscriptionId,
                      ClientId: this.EventMonitoredItem.ClientHandle,
                      EventEntries : eventEntryIds }
                );
    
                if ( success === true ){
                    print( 'AuditThread::DropAuditRecord succeeded' );
                }else{
                    print( 'AuditThread::DropAuditRecord failed' );
                }
    
            }else{
                print( 'AuditThread::DropAuditRecord failed due to bad event entry ids' );
            }

        }else{
            print( 'AuditThread::DropAuditRecord failed due to thread and or subscription not started' );
        }

        return success;
    }

    this.GetAllAuditEventParams = function(){
        // This method will take some time.  It should just be used for testing purposes
        
        var startTime = new Date();
        
        var emptyEntryIds = new UaStrings();
        var all = [];

        this.AddToAllEventParams( all, Identifier.AuditSecurityEventType );
        this.AddToAllEventParams( all, Identifier.AuditChannelEventType );
        this.AddToAllEventParams( all, Identifier.AuditOpenSecureChannelEventType );
        this.AddToAllEventParams( all, Identifier.AuditSessionEventType );
        this.AddToAllEventParams( all, Identifier.AuditCreateSessionEventType );
        this.AddToAllEventParams( all, Identifier.AuditUrlMismatchEventType );
        this.AddToAllEventParams( all, Identifier.AuditActivateSessionEventType );
        this.AddToAllEventParams( all, Identifier.AuditCancelEventType );
        this.AddToAllEventParams( all, Identifier.AuditCertificateEventType );
        this.AddToAllEventParams( all, Identifier.AuditCertificateDataMismatchEventType );
        this.AddToAllEventParams( all, Identifier.AuditCertificateExpiredEventType );
        this.AddToAllEventParams( all, Identifier.AuditCertificateInvalidEventType );
        this.AddToAllEventParams( all, Identifier.AuditCertificateUntrustedEventType );
        this.AddToAllEventParams( all, Identifier.AuditCertificateRevokedEventType );
        this.AddToAllEventParams( all, Identifier.AuditCertificateMismatchEventType );
        this.AddToAllEventParams( all, Identifier.AuditNodeManagementEventType );
        this.AddToAllEventParams( all, Identifier.AuditAddNodesEventType );
        this.AddToAllEventParams( all, Identifier.AuditDeleteNodesEventType );
        this.AddToAllEventParams( all, Identifier.AuditAddReferencesEventType );
        this.AddToAllEventParams( all, Identifier.AuditDeleteReferencesEventType );
        this.AddToAllEventParams( all, Identifier.AuditUpdateEventType );
        this.AddToAllEventParams( all, Identifier.AuditWriteUpdateEventType );
        this.AddToAllEventParams( all, Identifier.AuditHistoryUpdateEventType );
        this.AddToAllEventParams( all, Identifier.AuditUpdateMethodEventType );
        this.AddToAllEventParams( all, Identifier.AuditUpdateStateEventType );
        this.AddToAllEventParams( all, Identifier.AuditConditionEventType );
        this.AddToAllEventParams( all, Identifier.AuditConditionEnableEventType );
        this.AddToAllEventParams( all, Identifier.AuditConditionCommentEventType );
        this.AddToAllEventParams( all, Identifier.AuditConditionRespondEventType );
        this.AddToAllEventParams( all, Identifier.AuditConditionAcknowledgeEventType );
        this.AddToAllEventParams( all, Identifier.AuditConditionConfirmEventType );
        this.AddToAllEventParams( all, Identifier.AuditConditionShelvingEventType );
        this.AddToAllEventParams( all, Identifier.AuditProgramTransitionEventType );
        this.AddToAllEventParams( all, Identifier.AuditHistoryEventUpdateEventType );
        this.AddToAllEventParams( all, Identifier.AuditHistoryValueUpdateEventType );
        this.AddToAllEventParams( all, Identifier.AuditHistoryDeleteEventType );
        this.AddToAllEventParams( all, Identifier.AuditHistoryRawModifyDeleteEventType );
        this.AddToAllEventParams( all, Identifier.AuditHistoryAtTimeDeleteEventType );
        this.AddToAllEventParams( all, Identifier.AuditHistoryEventDeleteEventType );

        var endTime = new Date();
        var roughElapsedTime = ( endTime - startTime ) / 1000;

        print( "Time in GetAllAuditEventParams = " + roughElapsedTime + " ms" );

        return all;
    }

    this.AddToAllEventParams = function( all, identifier ){

        var results = this.GetAuditEventParams( { AuditEventType : new UaNodeId( identifier ), AuditEntryIds : new UaStrings() } );

        if ( results.status == true ){
            for ( var index = 0; index < results.events.length; index++ ){
                all.push( results.events[index] );
            }
        }
    }

    this.SetPublishingMode = function( args ){
        if ( !isDefined( args ) ) { throw( "AuditThread - SetPublishingMode args not specified." ) };
        if ( !isDefined( args.PublishingEnabled ) ) { throw( "AuditThread - SetPublishingMode args.PublishingEnabled not specified." )};
        
        var setPublishingModeFunction = this.GetPublishingModeFunction();
        setPublishingModeFunction.Execute( { SubscriptionIds: this.Subscription, PublishingEnabled: args.PublishingEnabled } );
    }

    this.GetPublishingModeFunction = function(){
        if ( this.SetPublishingModeFunction == null ){
             this.SetPublishingModeFunction = new SetPublishingModeService( { Session: this.SessionThread.Session } );
        }
        return this.SetPublishingModeFunction;
    }

    this.StartPublish = function( args ){
        var startPublish = false;
        if (  isDefined( this.SessionThread ) && this.Started ){
            startPublish = this.SessionThread.StartPublish( args );            
        }
        return startPublish;
    }

    this.PausePublish = function(){
        return this.SessionThread.PausePublish();
    }

    this.ResumePublish = function(){
        return this.SessionThread.ResumePublish();
    }

    this.GetDataValues = function( clientId ){
        if ( this.Started === true && this.SubscriptionCreated === true ){
            var results = this.SessionThread.Helpers.GetDataValuesHelper.Execute(
                { ThreadId: this.SessionThread.ThreadId,
                  SubscriptionId: this.Subscription.SubscriptionId,
                  ClientId: clientId }
            );

            if ( results.status === true ){
                print( 'AuditThread::GetDataValues succeeded' );
            }else{
                print( 'AuditThread::GetDataValues failed' );
            }

            return results;
        }else{
            print( 'AuditThread::GetDataValues failed due to thread and or subscription not started' );
        }

        return{ status: false, values: null };
    }

    this.ClearThreadData = function( args ){
        if ( this.Started === true && this.SubscriptionCreated === true ){
            if ( !isDefined( args ) ) args = new Object();
            args.ThreadId = this.SessionThread.ThreadId;
            args.SubscriptionId = this.Subscription.SubscriptionId;
            var result = this.SessionThread.Helpers.ClearThreadDataHelper.Execute( args );

            if ( result === true ){
                print( 'AuditThread::ClearThreadData succeeded' );
            }else{
                print( 'AuditThread::ClearThreadData failed' );
            }
            
        }else{
            print( 'AuditThread::GetDataValues failed due to thread and or subscription not started' );
        }

    }

    this.GetThreadPublishStatistics = function(){
        return this.SessionThread.GetThreadPublishStatistics();
    }

    this.CreateSelect = function( select ){

        var selectClauses = null;

        if( isDefined( select ) ){
            if ( isDefined( select.length ) ){ 
                selectClauses = new UaSimpleAttributeOperands( select.length );
                for ( var index = 0; index < select.length; index++ ){
                    selectClauses[index] = this.WhereClauseCreator.CreateSimpleOperand( select[index] ); 
                }
            }else{
                filter.SelectClauses = [ this.WhereClauseCreator.CreateSimpleOperand( select ) ];
            }
        }

        return selectClauses;
    }
}
