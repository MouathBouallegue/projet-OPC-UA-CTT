/* GLOBAL USE SCRIPT:
        Defines an instance of ALL UA Service Call helpers, including: 
*/

// Utilities
// Audit Infrastructure
include( "./library/Utilities/AuditInfrastructure/DropAuditRecord.js" );
include( "./library/Utilities/AuditInfrastructure/FindEntry.js" );
include( "./library/Utilities/AuditInfrastructure/GetAuditEventParams.js" );
include( "./library/Utilities/AuditInfrastructure/GetBuffer.js" );
include( "./library/Utilities/AuditInfrastructure/PushAuditRecord.js" );
include( "./library/Utilities/AuditInfrastructure/RemoveEntry.js" );

// Thread Infrastructure
include( "./library/Utilities/ThreadInfrastructure/ClearThreadData.js" );
include( "./library/Utilities/ThreadInfrastructure/GetDataValues.js" );
include( "./library/Utilities/ThreadInfrastructure/GetThreadPublishStatistics.js" );
include( "./library/Utilities/ThreadInfrastructure/PausePublish.js" );
include( "./library/Utilities/ThreadInfrastructure/StartThreadPublish.js" );
include( "./library/Utilities/ThreadInfrastructure/StartThreadSession.js" );
include( "./library/Utilities/ThreadInfrastructure/StopThread.js" );
include( "./library/Utilities/ThreadInfrastructure/ClearPublishData.js" );
include( "./library/Utilities/ThreadInfrastructure/GetPublishData.js" );
include( "./library/Utilities/ThreadInfrastructure/PublishStoreData.js" );

// Monitored Item Service Set 
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems.js" );

// Subscription Service Set
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscriptions.js" );

// Method Service Set 
include( "./library/ServiceBased/MethodServiceSet/Call.js" );
var CallHelper;

// Instanciate  Thread Helper methods with a specific session
function ThreadHelper( args ) { 
    if( !isDefined( args ) ) throw( "ThreadHelper() args not specified." );
    if( !isDefined( args.ThreadSession ) ) throw( "ThreadHelper() ThreadSession not specified." );
    
    this.ClearThreadDataHelper = new ClearThreadDataService( { Session: args.ThreadSession } );
    this.DropAuditRecordHelper = new DropAuditRecordService( { Session: args.ThreadSession } );
    this.FindEntryHelper = new FindEntryService( { Session: args.ThreadSession } );
    this.GetAuditEventParamsHelper = new GetAuditEventParamsService( { Session: args.ThreadSession } );
    this.GetBufferHelper = new GetBufferService( { Session: args.ThreadSession } );
    this.GetDataValuesHelper = new GetDataValuesService( { Session: args.ThreadSession } );
    this.GetThreadPublishStatisticsHelper = new GetThreadPublishStatisticsService( { Session: args.ThreadSession } );
    this.PausePublishHelper = new PausePublishService( { Session: args.ThreadSession } );
    this.PushAuditRecordHelper = new PushAuditRecordService( { Session: args.ThreadSession } );
    this.RemoveEntryHelper = new RemoveEntryService( { Session: args.ThreadSession } );
    this.StartThreadPublishHelper = new StartThreadPublishService( { Session: args.ThreadSession } );
    this.StartThreadSessionHelper = new StartThreadSessionService( { Session: args.ThreadSession } );
    this.StopThreadHelper = new StopThreadService( { Session: args.ThreadSession } );
    this.ClearPublishDataHelper = new ClearPublishDataService( { Session: args.ThreadSession } );
    this.GetPublishDataHelper = new GetPublishDataService( { Session: args.ThreadSession } );
    this.PublishStoreDataHelper = new PublishStoreDataService( { Session: args.ThreadSession } );

    // Monitored Item Service Set 
    this.CreateMonitoredItemsHelper = new CreateMonitoredItemsService( { Session: args.ThreadSession } );
    this.DeleteMonitoredItemsHelper = new DeleteMonitoredItemsService( { Session: args.ThreadSession } );

    print( "Creating Thread specific Subscription helper" );
    // Subscription Service Set
    this.CreateSubscriptionHelper = new CreateSubscriptionService( { Session: args.ThreadSession } );
    this.DeleteSubscriptionsHelper = new DeleteSubscriptionService( { Session: args.ThreadSession } );

    // Method Service Set 
    include( "./library/ServiceBased/MethodServiceSet/Call.js" );
    this.CallHelper = new CallService( { Session: args.ThreadSession } );

    
}//ThreadHelper()