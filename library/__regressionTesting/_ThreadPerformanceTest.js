include( "./library/Base/safeInvoke.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write.js" );
include( "./library/Information/BrowseAddressSpace.js" );
include( "./library/Information/FindObjectsOfType.js" );
include( "./library/Information/IsSubTypeOfType.js" );
include( "./library/Information/GetTypeHierarchy.js" );
include( "./library/Information/ClearModelCache.js" );


function ThreadPerformanceTest(){

    this.run = function(){
        this.testStatic();
        this.dataTest();
        this.eventTest();
    }

    this.testStatic = function(){
        var numberOfSessions = 2;
        var numberOfSubscriptions = 2;
        var numberOfItems = 100;

        var testTimer = new PerformanceTimer();
        var timer = new PerformanceTimer();

        var sessions = this.createSessions(numberOfSessions, numberOfSubscriptions, numberOfItems, false);

        print("Create Sessions took " + timer.TakeReading() + " ms");
        timer.start();

        this.publish(sessions);

        print("Start publish took " + timer.TakeReading() + " ms");
        timer.start();

        var items = sessions[0].subscriptionData[0].Items;
        var writer = new WriteService( { Session: sessions[0].thread.Session } );
        var browseAddressSpaceHelper = new BrowseAddressSpaceService( { Session: sessions[0].thread.Session } );
        var findObjectsOfTypeHelper = new FindObjectsOfTypeService( { Session: sessions[0].thread.Session } );
        var isSubTypeOfTypeHelper = new IsSubTypeOfTypeService( { Session: sessions[0].thread.Session } );
        var getTypeHierarchyHelper = new GetTypeHierarchyService( { Session: sessions[0].thread.Session } );
        var clearModelCacheHelper = new ClearModelCacheService( { Session: sessions[0].thread.Session } );
    
        var writeIterations = 5;

        for ( var writeIterationIndex = 1; writeIterationIndex <= writeIterations; writeIterationIndex++ ){
            for ( var itemIndex = 0; itemIndex < items.length; itemIndex++){
                items[itemIndex].Value.Value.setUInt32( writeIterationIndex );
            }
            writer.Execute( { NodesToWrite: items } );

            findObjectsOfTypeHelper.test();   
            getTypeHierarchyHelper.test();
            isSubTypeOfTypeHelper.test();    
            browseAddressSpaceHelper.test();
    
            clearModelCacheHelper.Execute();

            wait(1000);
        }

        timer.start();
        var statistics = this.getStatistics(sessions);

        var expectedUpdates = numberOfSessions * numberOfSubscriptions * numberOfItems * ( writeIterations + 1 );

        if ( statistics.Totals.AddDataCount == expectedUpdates ){
            print("Found Expected number of data updates")
        }else{
               print("Error expected " + expectedUpdates + " got " + statistics.Totals.AddDataCount);
        }

        timer.start();
        this.pause(sessions);
        print("Pause took " + timer.TakeReading() + " ms");
        wait(5000);
        
        timer.start();

        this.kill(sessions);

        print("Shutdown took " + timer.TakeReading() + " ms");

        print("TotalTest  took " + testTimer.TakeReadingSeconds() + " seconds");
        wait(5000);
    }


    this.dataTest = function(){
        // Two Tests - One involving Changing items, another for configured static items.

        // Create a temporary test to determine what my server is actually capable of.

        // All sessions should have a thread
        // I should be able to support 5 - 50 sessions
        // Each session should be able to support 2 - 5 subscriptions
        // Each session should be able to support 2 - 5 outstanding publish requests
        // Each Subscription should be able to support 100 - 500 monitored items

        // var numberOfSessions = 1;
        // var numberOfSubscriptions = 5;
        // var numberOfItems = 500;

        var numberOfSessions = 5;
        var numberOfSubscriptions = 5;
        var numberOfItems = 500;

        var testTimer = new PerformanceTimer();
        var timer = new PerformanceTimer();

        var sessions = this.createSessions(numberOfSessions, numberOfSubscriptions, numberOfItems, true);

        print("Create Sessions took " + timer.TakeReading() + " ms");
        timer.start();

        this.publish(sessions);

        print("Start publish took " + timer.TakeReading() + " ms");
        timer.start();


        this.delayAndClear(sessions, 60000, 5000);
        print("Delay took " + timer.TakeReading() + " ms");
        timer.start();

        this.getStatistics(sessions);
        print("Get Statistics took " + timer.TakeReading() + " ms");

        timer.start();
        this.pause(sessions);
        print("Pause took " + timer.TakeReading() + " ms");
        wait(5000);
        
        timer.start();

        this.kill(sessions);

        print("Shutdown took " + timer.TakeReading() + " ms");

        print("TotalTest  took " + testTimer.TakeReadingSeconds() + " seconds");
        wait(5000);
    }

    this.eventTest = function(){
        var numberOfSessions = 1;
        var numberOfSubscriptions = 2;
        var numberOfIterations = 20;

        var testTimer = new PerformanceTimer();
        var timer = new PerformanceTimer();

        var sessions = this.createSessions(numberOfSessions, numberOfSubscriptions, 0, true);

        print("Create Sessions took " + timer.TakeReading() + " ms");
        timer.start();

        this.publish(sessions);

        print("Start publish took " + timer.TakeReading() + " ms");
        timer.start();

        // generate data
        this.generateEventData(numberOfIterations);

        this.getStatistics(sessions);
        print("Get Statistics took " + timer.TakeReading() + " ms");

        timer.start();
        this.pause(sessions);
        print("Pause took " + timer.TakeReading() + " ms");
        wait(1000);
        
        timer.start();

        this.kill(sessions);

        print("Shutdown took " + timer.TakeReading() + " ms");

        print("TotalTest  took " + testTimer.TakeReadingSeconds() + " seconds");
    }

    this.createSessions = function(numberOfSessions, numberOfSubscriptions, numberOfItems, dynamic){
        var sessions = [];
        for ( var index = 0; index < numberOfSessions; index++ ){
            sessions.push(this.createSession(numberOfSubscriptions, numberOfItems, dynamic));
        }
        return sessions;
    }

    this.createSession = function(numberOfSubscriptions, numberOfItems, dynamic){

        var session = new Object();
        session.status = false;

        var thread = new SessionThread();

        if ( thread.Start() ){
            var subscriptionData = [];
            for ( var index = 0; index < numberOfSubscriptions; index++ ){
                print("Creating Subscription " + index + " of " + numberOfSubscriptions);
                var subscription = new Subscription();

                var items;
                if ( numberOfItems > 0 ){
                    items = this.createItems(numberOfItems, dynamic);
                }else {
                    items = this.createEventItem();
                }

                if ( thread.Helpers.CreateSubscriptionHelper.Execute( 
                    { Subscription: subscription, ThreadId : thread.ThreadId } ) ){

                    if ( thread.Helpers.CreateMonitoredItemsHelper.Execute( 
                        { ItemsToCreate: items, 
                          SubscriptionId: subscription,
                          ThreadId : thread.ThreadId } ) ){
                        subscriptionData.push({ Subscription: subscription, Items : items });
                        
                        print("Finished Creating Subscription " + index + " of " + numberOfSubscriptions);

                    }else{
                        thread.Helpers.DeleteSubscriptionsHelper.Execute( { SubscriptionId: subscription } );
                            unitSubscription = null;
                            thread.End();
                            print("ThreadPerformance::createSession Unable to create monitored Items for subscription " + index);
                    }
                }else{
                    thread.End();
                    print("createSession - Unable to create Thread Subscription " + index);
                }
            }
            session.status = true;
            session.thread = thread;
            session.subscriptionData = subscriptionData;
        }else{
            addError("CreateThreadAndSubscription - Unable to create Thread");
        }
    
        return session;
    }

    this.createItems = function(numberOfItems, dynamic){
        var folderName = "Static";
        if(dynamic === true){
            folderName = "Dynamic";
        }
        var items = [];
        for ( var index = 0; index < numberOfItems; index++){
            var itemName = "Demo.Massfolder_" + folderName + ".Variable" + this.pad(index, 4);
            items.push(MonitoredItem.fromNodeIds( new UaNodeId( itemName, 2 ) )[0]);
        }

        return items;
    }

    this.createEventItem = function(){
        var items = [];

        var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ) )[0];

        item.AttributeId = Attribute.EventNotifier;

        var auditThread = new AuditThread();

        item.Filter = UaEventFilter.New( {
                SelectClauses: auditThread.CreateSelect(auditThread.SelectFields()) } ).toExtensionObject();
        items.push( item );

        return items;
    }


    this.pause = function( sessions ){
        for ( var index = 0; index < sessions.length; index++){
            sessions[index].thread.PausePublish();
        }
    }

    this.publish = function(sessions){
        for ( var index = 0; index < sessions.length; index++){
            sessions[index].thread.StartPublish();
        }
    }

    this.kill = function(sessions){
        for ( var index = 0; index < sessions.length; index++){
            this.deleteSession(sessions[index]);
        }
    }

    this.deleteSession = function( session ){
        var thread = session.thread;
        var helpers = session.thread.Helpers;
        for ( var index = 0; index < session.subscriptionData.length; index++ ){
            var subscriptionData = session.subscriptionData[index];
            helpers.DeleteMonitoredItemsHelper.Execute( 
                { ItemsToDelete: subscriptionData.Items, SubscriptionId: subscriptionData.Subscription, SuppressMessaging: true } );
            helpers.DeleteSubscriptionsHelper.Execute( { SubscriptionId: subscriptionData.Subscription } );
        }
        thread.End();
    }

    this.delayAndClear = function( sessions, totalTime, timeToClear ){
        var iterations = totalTime / timeToClear;

        for ( var index = 0; index < iterations; index++ ){
            print("Doing delay " + index + " of " + iterations);
            wait(timeToClear);
            // for ( var sessionIndex = 0; sessionIndex < sessions.length; sessionIndex++ ){
            //     sessions[sessionIndex].thread.ClearThreadData({
            //         ThreadId : sessions[sessionIndex].thread.ThreadId,
            //         SubscriptionId : 0,
            //         ClearEvents : true,
            //         ClearExpectedEvents : true,
            //         ClearData : true,
            //         ClientId : 0,
            //         ClearStatistics : false
            //     });
            // }
        }

    }

    this.getStatistics = function( sessions ){
        var all = [];
        var totals = new UaGetThreadPublishStatisticsResponse();
        for ( var index = 0; index < sessions.length; index++ ){
            var results = sessions[index].thread.GetThreadPublishStatistics();
            all.push(results);
            if ( results.status === true){
                totals.CallCount += results.statistics.CallCount;
                totals.GoodCount += results.statistics.GoodCount;
                totals.BadCount += results.statistics.BadCount;
                totals.ServiceResultGoodCount += results.statistics.ServiceResultGoodCount;
                totals.ServiceResultBadCount += results.statistics.ServiceResultBadCount;
                totals.AddDataCount += results.statistics.AddDataCount;
                totals.AdEventCount += results.statistics.AdEventCount;
            }else{
                print("Unable to get statistics");
            }
        }
        print("Total Statistics count");
        var lines = sessions[0].thread.Helpers.GetThreadPublishStatisticsHelper.ValuesToString( {
            status: true, statistics: totals});
        print(lines.join("\n"));
        return ({Totals : totals, All : all});
    }

    this.generateEventData = function( iterations ){

        print("Generate Data Starting");

        for ( var index = 0; index < iterations; index++ ){
            var sessionInformation = SessionCreator.Connect();
            if ( sessionInformation.result === true ){
                wait(1000);
                SessionCreator.Disconnect(sessionInformation);
            }
            else{
                this.error("Unable to create session - iteration " + index);
            }
        }
        // Let the last few events come through
        wait(500);
        print("Generate Data Complete");
    }


    this.pad = function(value, width, padValue){
        padValue = padValue || '0';
        value = value + '';
        return value.length >= width ? value : new Array(width - value.length + 1).join(padValue) + value;

    }


}

var threadPerformanceTest = new ThreadPerformanceTest();
threadPerformanceTest.run();
