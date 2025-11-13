include( "./library/Base/safeInvoke.js" );

function TestPublishCount(){


    // this.audit is actually Test.Audit in safeInvoke.js, so as to be able to use the
    // existing infrastructure as it would be used in a test.
    this.thread = null;
    this.ChangingMonitoredItem = null
    this.actualRecordHelper = null;
    this.Subscription = null;
    this.SubscriptionCreated = false;
    this.ItemCreated = false;

    //#region Test

    this.run = function(){
        this.initialize();

        this.test();

        print ("TestPublishCount - Test Passed");

        this.end();
    }

    this.test = function(previousResults){

        var maximumPublishRequests = 10;
        var startPublishArgs = new Object();
        startPublishArgs.ThreadId = this.thread.ThreadId;
        startPublishArgs.MaximumPublishCalls = maximumPublishRequests;
        startPublishArgs.MaximumOutstandingCalls = 3;

        var beforePublish = UaDateTime.utcNow();
        
        this.thread.StartPublish(startPublishArgs);

        var keepGoing = true;

        while( keepGoing ){
            var results = this.thread.GetThreadPublishStatistics();

            if ( results.status === true ){
                var statistics = results.statistics;
                if ( statistics.CallCount === maximumPublishRequests ){
                    if ( statistics.GoodCount === maximumPublishRequests && 
                         statistics.ServiceResultGoodCount === maximumPublishRequests ){
                            // Successful
                            keepGoing = false;
                            continue;
                    }else{
                        if ( statistics.BadCount > 0 || statistics.ServiceResultBadCount > 0 ){
                            var printLines = this.thread.Helpers.GetThreadPublishStatisticsHelper.ValuesToString(results);
                            this.error("TestPublishCount failed - " + printLines.join("\n"));
                        }
                    }
                }
            }else{
                this.error("Unable to get statistics");
            }
            wait(100);
        }
        var afterPublish = UaDateTime.utcNow();

        var msInPublish = beforePublish.msecsTo(afterPublish);

        // var timeInPublish = new UaDateTime();
        // timeInPublish.diff(beforePublish, afterPublish); 
        print("Time in publish = " + msInPublish + " ms");

        // There must be some data
        var data = this.thread.GetDataValues({
            ThreadId : this.thread.ThreadId,
            SubscriptionId : this.Subscription.SubscriptionId,
            ClientId : this.ChangingMonitoredItem.ClientHandle
        });

        if ( !data.status === true ){
            this.error("Error getting data to be had");
        }

        if ( data.values.length == 0 ){
            this.error("No Data retrieved");
        }
        
        var dataResults = this.thread.Helpers.GetDataValuesHelper.ValuesToString( data );
        print( dataResults.join("\n") );

        this.thread.ClearThreadData();

        print("debug clear thread data");

        var emptyData = this.thread.GetDataValues({
            ThreadId : this.thread.ThreadId,
            SubscriptionId : this.Subscription.SubscriptionId,
            ClientId : this.ChangingMonitoredItem.ClientHandle
        });

        if ( !emptyData.status === true ){
            this.error("Error getting empty data");
        }

        if ( emptyData.values.length > 0 ){
            this.error("Data retrieved when it should be deleted");
        }

        print("debug retrieved what is supposed to be empty data");

        var finalStatistics = this.thread.GetThreadPublishStatistics();

        if ( finalStatistics.statistics.CallCount > 0               || 
            finalStatistics.statistics.GoodCount > 0                ||
            finalStatistics.statistics.BadCount > 0                 ||
            finalStatistics.statistics.ServiceResultGoodCount > 0   || 
            finalStatistics.statistics.ServiceResultBadCount > 0    ||
            finalStatistics.statistics.AddDataCount > 0             ||
            finalStatistics.statistics.AddEventCount > 0 ){
            this.error("Unexpected Statistics Count");
        }
    }

    this.initialize = function(){

        this.ChangingMonitoredItem = MonitoredItem.fromNodeIds( new UaNodeId( "Demo.Dynamic.Scalar.Int32", 2 ) )[0]; 
        
        this.thread = new SessionThread();
        this.thread.Start();

        this.addItem();
    }

    this.end = function(){
        this.removeItem();
        this.thread.End();
        this.thread = null;
    }

    this.error = function(message){
        this.end();
        throw(message);
    }


    this.addItem = function(){

        var monitoredItems = [];
        monitoredItems.push(this.ChangingMonitoredItem);
        
        this.Subscription = new Subscription();

        if ( !this.thread.Helpers.CreateSubscriptionHelper.Execute( 
            { Subscription: this.Subscription, ThreadId : this.thread.ThreadId } ) ){
                this.error("Fatal Error - Unable to create audit event subscription");
        }else{
            this.SubscriptionCreated = true;
            if ( !this.thread.Helpers.CreateMonitoredItemsHelper.Execute( 
                { ItemsToCreate: monitoredItems, SubscriptionId: this.Subscription, ThreadId : this.thread.ThreadId } ) ){
                    this.error("Fatal Error - Unable to create  Monitored Item");
            }else{
                this.ItemCreated = true;
            }
        }
    }

    this.removeItem = function(){
        if ( this.SubscriptionCreated === true ){
            this.thread.Helpers.DeleteSubscriptionsHelper.Execute( { SubscriptionId: this.Subscription } );
            this.Subscription = null;
            this.SubscriptionCreated = false;
            this.ItemCreated = false;
        }
    }



    //#endregion


}

var testPublishCount = new TestPublishCount();
testPublishCount.run();
