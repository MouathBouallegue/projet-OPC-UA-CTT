include( "./library/Base/safeInvoke.js" );

function TestHeartBeat(){


    // this.audit is actually Test.Audit in safeInvoke.js, so as to be able to use the
    // existing infrastructure as it would be used in a test.
    this.thread = null;
    this.monitoredItem = null
    this.actualRecordHelper = null;
    this.Subscription = null;
    this.SubscriptionCreated = false;
    this.ItemCreated = false;
    this.SessionTimeout = 2500;

    //#region Test

    this.run = function(){
        this.initialize();

        this.test();

        print ("TestHeartBeat - Test Passed");

        this.end();
    }

    this.test = function(previousResults){

        // Wait until the timeout has passed, then start publishing, and retrieve data.
        // If the session has timed out, it should fail.  If the heartbeat is working correctly,
        // it should work fine.

        wait(20000);

        this.addItem();

        this.thread.StartPublish({ThreadId : this.thread.ThreadId});
        wait( 5000 );

        var data = this.thread.GetDataValues({ 
            ThreadId : this.thread.ThreadId,
            SubscriptionId: this.Subscription.SubscriptionId,
            ClientId : this.monitoredItem.ClientHandle
        });

        if ( data.status === true ){
            if( isDefined( data.values) && isDefined(data.values.length)){
                if ( data.values.length == 0 ){
                    this.error("GetDataValue didn't have any data");
                }else{
                    print("Data had " + data.values.length + " values");
                }

            }
        }else{
            this.error("GetDataValues failed");
        }
    }

    this.initialize = function(){
        Test.Connect({CreateSession : {RequestedSessionTimeout : this.SessionTimeout }});

        var session = isDefined( Test.Session.Session )? Test.Session.Session : Test.Session;
//        session.SessionTimeout = this.SessionTimeout;
        this.thread = new SessionThread();

        this.thread.Start({Session : session});
    }

    this.end = function(){
        this.removeItem();
        this.thread.StopThread();
        this.thread = null;
        Test.Disconnect();
    }

    this.error = function(message){
        this.end();
        throw(message);
    }

    this.addItem = function(){

        this.monitoredItem = MonitoredItem.fromSetting( "/Server Test/NodeIds/Static/DA Profile/AnalogItemType/Int32");

        var monitoredItems = [];
        monitoredItems.push(this.monitoredItem);
        
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
            this.thread.Helpers.DeleteMonitoredItemsHelper.Execute( 
                { ItemsToDelete: this.monitoredItem, SubscriptionId: this.Subscription, SuppressMessaging: true } );
            this.thread.Helpers.DeleteSubscriptionsHelper.Execute( { SubscriptionId: this.Subscription } );
            this.Subscription = null;
            this.SubscriptionCreated = false;
            this.ItemCreated = false;
        }
    }

    //#endregion
}

var testHeartBeat = new TestHeartBeat();
testHeartBeat.run();
