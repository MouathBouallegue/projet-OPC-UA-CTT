include( "./library/Base/safeInvoke.js" );

function TestPublishDuration(){


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

        print("Test Run 0");
        var results = this.test();
        for ( var index = 1; index <= 5; index++){
            print("Test Run " + index);
            results = this.test(results);
        }

        this.end();
    }

    this.test = function(previousResults){

        wait(2000);

        var millisecondsToRun = 10000;
        // Allow for half a second before, half a second after.
        var millisecondLimit = millisecondsToRun + 1000;
        var waitTime = millisecondsToRun + 5000;

        var startPublishArgs = new Object();
        startPublishArgs.ThreadId = this.thread.ThreadId;
        startPublishArgs.PublishDuration = millisecondsToRun;

        var beforePublish = UaDateTime.utcNow();
        var publishShouldEndTime = UaDateTime.utcNow();
        
        wait(500);
        this.thread.StartPublish(startPublishArgs);

        publishShouldEndTime.addMilliSeconds(millisecondLimit);

        wait(waitTime);

        var results = this.thread.Helpers.GetDataValuesHelper.Execute(
            {ThreadId: this.thread.ThreadId,
             SubscriptionId: this.Subscription.SubscriptionId,
             ClientId: this.ChangingMonitoredItem.ClientHandle }
        );

        // There should be no data before the start publish time
        // There should be no data after the publishShouldEndTime.

        if (results.status == false){
            this.error("No Data Received");
        }

        var startIndex = 0;
        if ( isDefined(previousResults)){
            startIndex = previousResults.values.length;
        }

        print("Start Index = " + startIndex);
        print("Before Publish Time " + beforePublish );
        print("Publish should end Time " + publishShouldEndTime );

        for ( var index = startIndex; index < results.values.length; index++ ){
            var dataValue = results.values[index];
            
            print( "Index [" + index + "] timestamp = " + dataValue.ServerTimestamp);

            if (dataValue.ServerTimestamp < beforePublish){
                this.error("Received a value before publishing began");
            }
            if( dataValue.ServerTimestamp > publishShouldEndTime ){
                this.error("Received a value after publishing should have stopped");
            }
        }

        return results;
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

var testPublishDuration = new TestPublishDuration();
testPublishDuration.run();
