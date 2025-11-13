include( "./library/Base/sessionThread.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/subscription.js" );

include( "./library/Base/Objects/keyPairCollection.js" );
include( "./library/ClassBased/Events.js" );

function AlarmThread () {

    this.Started = false;
    this.SessionThread = null;
    this.Subscription = null;
    this.EventMonitoredItem = null;
    this.SubscriptionCreated = false;
    this.ItemCreated = false;
    this.DesiredQueueSize = 10000;
    this.StartTime = null;


    this.Start = function ( args ) {

        if ( !isDefined( args ) ){
            args = new Object();
        }

        // Don't wipe out the Helpers
        if ( !isDefined( args.Session ) && !isDefined( args.InstanciateHelpers) ){
            args.InstanciateHelpers = false;
        }

        this.SessionThread = new SessionThread();
        if ( this.SessionThread.Start( args ) ) {
            var session = isDefined( this.SessionThread.Session.Session ) ? 
                this.SessionThread.Session.Session : this.SessionThread.Session;

            print( "AlarmThread - Thread Created Session id " + session.SessionId );
            if ( isDefined( Test.Alarm )){
                Test.Alarm.RequiresShutdown = true;
            }
            this.Started = true;
            this.AddEventItem( args );
        } else {
            print( "AlarmThread - Thread not started" );
        }

        this.StartTime = UaDateTime.utcNow();
    }

    this.End = function () {
        if ( this.Started ) {
            if ( this.SubscriptionCreated === true ) {
                this.RemoveEventItem();
            }
            print( "Killing Alarm Thread" );
            this.SessionThread.End();
            this.SessionThread = null;
        }
    }

    this.AddEventItem = function ( args ) {

        var createdVariables = this.AddEventItemExtended( args );

        if ( isDefined( createdVariables.EventMonitoredItem ) ) {
            this.EventMonitoredItem = createdVariables.EventMonitoredItem;
        }
        if ( isDefined( createdVariables.Subscription ) ) {
            this.Subscription = createdVariables.Subscription;
        }
        if ( isDefined( createdVariables.SubscriptionCreated ) ) {
            this.SubscriptionCreated = createdVariables.SubscriptionCreated;
        }
        if ( isDefined( createdVariables.ItemCreated ) ) {
            this.ItemCreated = createdVariables.ItemCreated;
        }
    }

    this.AddEventItemExtended = function ( args ) {
        if ( !isDefined( args ) ) { throw ( "AlarmThread:AddEventItem has no arguments" ) };
        if ( !isDefined( args.EventNodeId ) ) { throw ( "AlarmThread:AddEventItem has no arguments" ) };
        if ( !isDefined( args.SelectFields ) ) { throw ( "AlarmThread:AddEventItem has no SelectFields to monitor" ) };

        print( "AlarmThread - AddEventItem Started" );

        var created = new Object();
        created.EventMonitoredItem = MonitoredItem.fromNodeIds( args.EventNodeId )[ 0 ];
        created.EventMonitoredItem.QueueSize = this.DesiredQueueSize;
        created.EventMonitoredItem.AttributeId = Attribute.EventNotifier;

        var filter = { SelectClauses: this.CreateSelect( args.SelectFields ) }; 
        if ( isDefined( args.WhereClause ) ){
            filter.WhereClause = args.WhereClause;
        }
        
        created.EventMonitoredItem.Filter = UaEventFilter.New( filter ).toExtensionObject();

        var monitoredItems = [];
        monitoredItems.push( created.EventMonitoredItem );

        if ( isDefined( args ) && isDefined( args.MonitoredItems ) ) {
            if ( isDefined( args.MonitoredItems.length ) ) {
                for ( var index = 0; index < args.MonitoredItems.length; index++ ) {
                    monitoredItems.push( args.MonitoredItems[ index ] );
                }
            } else {
                monitoredItems.push( args.MonitoredItems );
            }
        }

        var creationResult = this.AddEventMonitor( monitoredItems, args.Subscription );
        created.Subscription = creationResult.Subscription;
        created.SubscriptionCreated = creationResult.SubscriptionCreated;
        created.ItemCreated = creationResult.ItemCreated;

        return created;
    }

    this.AddEventMonitor = function ( monitoredItems, subscription ) {
        print( "AlarmThread - Creating Subscription" );

        var created = new Object();

        var subscriptionValid = true;

        if ( isDefined(subscription) ){
            created.Subscription = subscription;
            created.SubscriptionCreated = true;
        }else{
            created.Subscription = new Subscription();
            print( "AlarmThread - Creating Subscription on server" );
            if ( !this.SessionThread.Helpers.CreateSubscriptionHelper.Execute(
                { Subscription: created.Subscription, ThreadId: this.SessionThread.ThreadId } ) ) {
                print( "Fatal Error - Unable to create audit event subscription" );
                subscriptionValid = false;
            }else{
                print( "AlarmThread - Subscription Created " + created.Subscription.SubscriptionId );
                created.SubscriptionCreated = true;
            }
        }

        if ( subscriptionValid ){
            if ( !this.SessionThread.Helpers.CreateMonitoredItemsHelper.Execute(
                { 
                    ItemsToCreate: monitoredItems, 
                    TimestampsToReturn: TimestampsToReturn.Both, 
                    SubscriptionId: created.Subscription, 
                    ThreadId: this.SessionThread.ThreadId } ) ) {
                print( "Fatal Error - Unable to create audit event Monitored Item" );
            } else {
                print( "AlarmThread - MonitoredItems Created" );
                created.ItemCreated = true;
            }
        }

        return created;
    }

    this.RemoveEventItem = function () {
        if ( this.SubscriptionCreated === true ) {
            this.RemoveEventItemExtended( this.Subscription );
        }
    }

    this.RemoveEventItemExtended = function ( subscription ) {
        var expectedResults = [];
        expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSubscriptionIdInvalid ] ) );
        this.SessionThread.Helpers.DeleteSubscriptionsHelper.Execute( { SubscriptionId: subscription, 
            SuppressMessaging: true,
            OperationResults: expectedResults } );
        subscription = null;
    }

    this.GetBuffer = function ( subscriptionId, clientId ) {

        var subscriptionIdToUse = this.Subscription.SubscriptionId;
        if ( isDefined( subscriptionId ) ) {
            subscriptionIdToUse = subscriptionId;
        }

        var clientIdToUse = this.EventMonitoredItem.ClientHandle;
        if ( isDefined( clientId ) ){
            clientIdToUse = clientId;
        }

        if ( this.Started === true && this.SubscriptionCreated === true ) {
            return this.SessionThread.Helpers.GetBufferHelper.Execute(
                {
                    ThreadId: this.SessionThread.ThreadId,
                    SubscriptionId: subscriptionIdToUse,
                    ClientId: clientIdToUse
                }
            );
        } else {
            print( 'AlarmThread::GetBuffer failed due to thread and or subscription not started' );
        }

        return { status: false, events: null };
    }

    this.RemoveEntry = function ( eventEntryIds, subscriptionId, clientId ) {

        var success = false;

        var subscriptionIdToUse = this.Subscription.SubscriptionId;
        if ( isDefined( subscriptionId ) ) {
            subscriptionIdToUse = subscriptionId;
        }

        var clientIdToUse = this.EventMonitoredItem.ClientHandle;
        if ( isDefined( clientId ) ){
            clientIdToUse = clientId;
        }


        if ( this.Started === true && this.SubscriptionCreated === true ) {
            if ( isDefined( eventEntryIds ) && eventEntryIds.length > 0 ) {

                success = this.SessionThread.Helpers.RemoveEntryHelper.Execute(
                    {
                        ThreadId: this.SessionThread.ThreadId,
                        SubscriptionId: subscriptionIdToUse,
                        ClientId: clientIdToUse,
                        EventEntries: eventEntryIds
                    }
                );

                if ( success != true ) {
                    print( 'AlarmThread::RemoveEntry failed' );
                }

            } else {
                print( 'AlarmThread::RemoveEntry failed due to bad event entry ids' );
            }

        } else {
            print( 'AlarmThread::RemoveEntry failed due to thread and or subscription not started' );
        }

        return success;
    }

    /**
     * Retrieve data values for a specific Data Monitored Item 
     * @param {integer} subscriptionId - the subscription id that contains the data monitored item
     * @param {integer} clientId - the identifier of the Data Monitored Item
     * @param {boolean} clear - flag to tell the thread whether to clear all data for the monitored item after retrieval
     * @returns status and data values
     */
    this.GetDataValues = function ( subscriptionId, clientId, clear ) {

        var subscriptionIdToUse = this.Subscription.SubscriptionId;
        if ( isDefined( subscriptionId ) ) {
            subscriptionIdToUse = subscriptionId;
        }

        if ( this.Started === true && this.SubscriptionCreated === true ) {
            return this.SessionThread.Helpers.GetDataValuesHelper.Execute(
                {
                    ThreadId: this.SessionThread.ThreadId,
                    SubscriptionId: subscriptionIdToUse,
                    ClientId: clientId,
                    Clear: clear
                }
            );
        } else {
            print( 'AlarmThread::GetDataValues failed due to thread and or subscription not started' );
        }

        return { status: false, events: null };
    }



    this.StartPublish = function ( args ) {
        var startPublish = false;
        if ( isDefined( this.SessionThread ) && this.Started ) {
            startPublish = this.SessionThread.StartPublish( args );
        }
        return startPublish;
    }

    this.CreateSelect = function ( select ) {
        var numberOfClauses = select.Length() + 1;
        var lastIndex = numberOfClauses - 1;
        var selectClauses = new UaSimpleAttributeOperands( numberOfClauses );

        var selectKeys = select.Keys();
        for ( var index = 0; index < selectKeys.length; index++ ) {
            var selectKey = selectKeys[ index ];
            var selectObject = select.Get( selectKey );
            selectClauses[ index ] = this.CreateSimpleOperand( selectObject );
        }

        // This looks oddball, and it is, but this is the way to get the ConditionId
        selectClauses[ lastIndex ] = this.CreateConditionIdOperand( );

        return selectClauses;
    }

    this.CreateSimpleSelect = function ( select ) {
        var selectClauses = new UaSimpleAttributeOperands( select.Length() );

        var selectKeys = select.Keys();
        for ( var index = 0; index < selectKeys.length; index++ ) {
            var selectKey = selectKeys[ index ];
            var selectObject = select.Get( selectKey );
            selectClauses[ index ] = this.CreateSimpleOperand( selectObject );
        }

        return selectClauses;
    }

    this.CreateSimpleOperand = function ( selectObject ) {
        var operand = new UaSimpleAttributeOperand();

        if ( isDefined( selectObject.BrowsePaths ) ) {
            var browsePaths = new UaQualifiedNames( selectObject.BrowsePaths.length );
            for ( var index = 0; index < selectObject.BrowsePaths.length; index++ ) {
                browsePaths[ index ] = UaQualifiedName.New( { Name: selectObject.BrowsePaths[ index ] } );
            }
            operand.BrowsePath = browsePaths;
        }

        if ( isDefined( selectObject.AttributeId ) ) {
            operand.AttributeId = selectObject.AttributeId;
        } else {
            operand.AttributeId = Attribute.Value;
        }

        operand.TypeDefinitionId = new UaNodeId( selectObject.Identifier );

        return operand;
    }

    this.CreateConditionIdOperand = function ( ) {
        var operand = new UaSimpleAttributeOperand();
        operand.AttributeId = Attribute.NodeId;
        operand.TypeDefinitionId = new UaNodeId( Identifier.ConditionType );
        return operand;
    }
}
