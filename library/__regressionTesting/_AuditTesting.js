include( "./library/Base/safeInvoke.js" );

function AuditTest(){

    // this.audit is actually Test.Audit in safeInvoke.js, so as to be able to use the
    // existing infrastructure as it would be used in a test.
    this.audit = null;
    this.ChangingMonitoredItem = null
    this.actualRecordHelper = null;

    //#region Test

    this.run = function(){

        this.ChangingMonitoredItem = MonitoredItem.fromNodeIds( new UaNodeId( "Demo.Dynamic.Scalar.Int32", 2 ) )[0]; 
        
        var args = new Object();
        args.MonitoredItems = this.ChangingMonitoredItem;

        Test.ConnectAudit(args);
        this.audit = Test.Audit;

        // At this point nothing should be happening.
        this.TestWithoutStartPublish();

        this.audit.StartPublish();
        //Give a chance for the thread to start processing before proceeding
        wait(500);

        this.TestClearOutAccumulatedEvents();

        // This should leave everything in an empty state.
        this.TestExpectedRecordsComplete();

       this.generateEventData();

        this.TestPausePublish();
        this.TestSetPublishingMode();

        this.TestFindEntry();

        // This will kill off the entries
        this.TestBuffers();
        this.TestGetStatistics();             

        this.runUnitTests();

        print("Audit Test Completed Successfully");
        Test.DisconnectAudit();
        this.audit = null;
    }

    //#endregion

    //#region Tests

    this.TestGetStatistics = function(){
        var results = this.audit.GetThreadPublishStatistics();
        var printLines = this.audit.SessionThread.Helpers.GetThreadPublishStatisticsHelper.ValuesToString(results);
        print( printLines.join("\n"));
    }

    this.TestWithoutStartPublish = function(){
        this.generateEventData();
        var getBufferResults = this.audit.GetBuffer();
        var actualRecords = this.GetRecordArray(getBufferResults);

        if (actualRecords.length > 0 ){
            this.error("Collecting publish data when it should not")
        }
    }

    this.TestClearOutAccumulatedEvents = function(){
       
        this.audit.ClearThreadData({
            ClearEvents : true,
            ClearExpectedEvents : true,
            ClearData : true,
            ClientId : 0,
            ClearStatistics: true
        });
    }


    this.TestPausePublish = function(){
        this.audit.PausePublish();
        var startOfPause = UaDateTime.utcNow();
        startOfPause.addMilliSeconds(200);
        
        wait(5000);
        var initialResults = this.audit.GetDataValues( this.ChangingMonitoredItem.ClientHandle );
        var endOfPause = UaDateTime.utcNow();
        // There should be no entries between the two times.

        print("TestPausePublish: " + initialResults.values.length + " entries to check.");
        print("Start Of Pause " + startOfPause);
        print("End Of Pause " + endOfPause);

        var failed = false;
        for ( var index = 0; index < initialResults.values.length; index++ ){
            var changeInValue = initialResults.values[index];
            print("Index [" + index + "] " + changeInValue.ServerTimestamp);
            if ( changeInValue.ServerTimestamp >= startOfPause && changeInValue.ServerTimestamp  < endOfPause ){
                failed = true;
            }
        }
        if ( failed == true ){
            this.error("Unexpected value during Pause Publish");
        }

        this.audit.ResumePublish();
        wait(5000);
        var secondResults = this.audit.GetDataValues( this.ChangingMonitoredItem.ClientHandle );

        var found = false;
        // Now need to verify times
        for ( var index = 0; index < secondResults.values.length; index++ ){
            var changeInValue = secondResults.values[index];
            if ( changeInValue.ServerTimestamp > endOfPause ){
                found = true;
                break;
            }
        }

        if ( !found ){
            this.error("TestPausePublish No Values after Resume");
        }
    }

    this.TestSetPublishingMode = function(){
        this.audit.SetPublishingMode( { PublishingEnabled: false } );
        var startOfPause = UaDateTime.utcNow();
        wait(5000);
        var initialResults = this.audit.GetDataValues( this.ChangingMonitoredItem.ClientHandle );
        var endOfPause = UaDateTime.utcNow();
        for ( var index = 0; index < initialResults.values.length; index++ ){
            var changeInValue = initialResults.values[index];
            if ( changeInValue.ServerTimestamp >= startOfPause && changeInValue.ServerTimestamp  < endOfPause ){
                this.error("Unexpected value during paused subscription");
            }
        }
        this.audit.SetPublishingMode( { PublishingEnabled: true } );
        wait(5000);
        // Now need to verify times.
        var secondResults = this.audit.GetDataValues( this.ChangingMonitoredItem.ClientHandle );

        var found = false;
        // Now need to verify times
        for ( var index = 0; index < secondResults.values.length; index++ ){
            var changeInValue = secondResults.values[index];
            if ( changeInValue.ServerTimestamp > endOfPause ){
                found = true;
                break;
            }
        }

        if ( !found ){
            this.error("TestSetPublishingMode No Values after Resume");
        }
    }

    this.TestExpectedRecordsComplete = function(){

        this.generateEventData();
        var deleteHalf = true;
        this.TestExpectedRecords(deleteHalf);
        // Delete All
        deleteHalf = false;
        this.TestExpectedRecords(deleteHalf);
        // There should be no data now.

        var getBufferResults = this.audit.GetBuffer();
        var allExpectedBufferResults = this.audit.GetAllAuditEventParams();
        var actualRecords = this.GetRecordArray(getBufferResults);
        var expectedRecords = this.GetRecordArray(allExpectedBufferResults);

        if ( actualRecords.length > 0 || expectedRecords > 0 ){
            this.error("Unexpected records found still in thread");
        }      
        
        // Test Drop and remove with bad data

        var badIds = [1000, 10001, 999];

        var removeResult = this.audit.RemoveEntry(badIds);
        if ( removeResult ){
            this.error("RemoveEntry with bad entries should have failed");
        }
        var printLines = this.audit.SessionThread.Helpers.RemoveEntryHelper.ValuesAsString();
        print( printLines.join("\n"));

        var dropResult = this.audit.DropAuditRecord(badIds);
        if ( dropResult ){
            this.error("DropAuditRecord with bad entries should have failed");
        }
        printLines = this.audit.SessionThread.Helpers.DropAuditRecordHelper.ValuesAsString();
        print( printLines.join("\n"));
    }

    this.TestExpectedRecords = function(deleteHalf){

        var getBufferResults = this.audit.GetBuffer();
        var allExpectedBufferResults = this.audit.GetAllAuditEventParams();
        var actualRecords = this.GetRecordArray(getBufferResults);
        var expectedRecords = this.GetRecordArray(allExpectedBufferResults);

        if ( !getBufferResults.status ){
            this.error('TestExpectedRecords GetBuffer failed');
        }

        var actualChannelAuditEvents = [];
        var actualOtherAuditEvents = [];

        this.SplitChannelAndOtherActualEvents( getBufferResults, actualChannelAuditEvents, actualOtherAuditEvents);

        var expectedChannelAuditEvents = [];
        var expectedOtherAuditEvents = [];

        this.SplitChannelAndOtherExpectedEvents( allExpectedBufferResults, expectedChannelAuditEvents, expectedOtherAuditEvents);

        // Now do a comparison of all actual to expected.
        var unfoundExpectedRecords = this.CompareExpectedVsActualTest("AllWithEntries", expectedOtherAuditEvents, actualOtherAuditEvents);

        if ( unfoundExpectedRecords.length > 0 ){
            print("There are expected records that could not be found.")
        }

        this.TestPushAuditMisc(getBufferResults);
        this.TestFindActualFromExpected(expectedOtherAuditEvents);
        this.TestFindExpectedFromActual(actualOtherAuditEvents);
        this.TestGetAuditEventParamsMultipleAuditIds(actualOtherAuditEvents);
        this.TestExpectedEmptyAuditIds( expectedChannelAuditEvents );
        this.TestActualEmptyAuditIds( actualChannelAuditEvents );

        this.DropAndRemove(actualRecords, expectedRecords, deleteHalf);
    }

    this.runUnitTests = function(){
        var unitTest = new UaTest();
        if ( !unitTest.testAll() ){
            this.error("Internal unit tests failed");
        }
    }

    this.TestBuffers = function(){
        var getBufferResults = this.audit.GetBuffer();

        if ( getBufferResults.status === true){
            print('TestBuffers GetBuffer succeeded');

            var eventBuffers = getBufferResults.events;
            var removeEvents = [];
            var remainingEvents = [];
            var remaingEventsSet = new IntegerSet();
            for( var eventIndex = 0; eventIndex < eventBuffers.length; eventIndex++ ) {
                var event = eventBuffers[eventIndex];
                if ( eventIndex % 2 == 0 ){
                    remainingEvents.push(event.EventHandle);
                    remaingEventsSet.insert(event.EventHandle);
                }else{
                    removeEvents.push(event.EventHandle);
                }
            }

            var result = this.audit.RemoveEntry(removeEvents);
            if ( result == true ){
                print('TestBuffers RemoveEntry succeeded');

                var testRemoveGetBuffersResult = this.audit.GetBuffer();
                if ( testRemoveGetBuffersResult.status === true){
                    var remainingBuffers = testRemoveGetBuffersResult.events;

                    if ( remainingBuffers.length == remaingEventsSet.size()){
                        print("TestBuffers second GetBuffer length has expected size");
                    }else{
                        print("TestBuffers second GetBuffer length " + remainingBuffers.length +
                        " does not have expected " + remaingEventsSet.size() + "remaining Events");
                    }

                    for ( var index = 0; index < remainingBuffers.length; index++){
                        var eventHandle = remainingBuffers[index].EventHandle;
                        if ( remaingEventsSet.contains(eventHandle)){
                            print("TestBuffers expected remaing result with handle " + eventHandle);
                        }else{
                            print("TestBuffers unexpected result");
                        }
                    }

                }else{
                    print('TestBuffers Second GetBuffer failed');
                }
            }else{
                print('TestBuffers RemoveEntry failed');
            }
        }else{
            print('AuditThread::GetBuffer failed');
        }
    }

    this.TestPushAuditMisc = function(getBufferResults){
        var emptyEntryIds = new UaStrings();
        var openChannelExpectedEvents = this.GetExpectedAuditResults(Identifier.AuditOpenSecureChannelEventType,emptyEntryIds);
        var closeChannelExpectedEvents = this.GetExpectedAuditResults(Identifier.AuditChannelEventType,emptyEntryIds);
        var createSessionExpectedEvents = this.GetExpectedAuditResults(Identifier.AuditCreateSessionEventType,emptyEntryIds);
        var activateSessionExpectedEvents = this.GetExpectedAuditResults(Identifier.AuditActivateSessionEventType,emptyEntryIds);
        var closeSessionExpectedEvents = this.GetExpectedAuditResults(Identifier.AuditSessionEventType,emptyEntryIds);

        // This should give us all results - that the server knows about.

        var openChannelResults = this.findEntryByType(Identifier.AuditOpenSecureChannelEventType);
        var closeChannelResults = this.findEntryByType(Identifier.AuditChannelEventType);
        var openSessionResults = this.findEntryByType(Identifier.AuditCreateSessionEventType);
        var activateSessionResults = this.findEntryByType(Identifier.AuditActivateSessionEventType);
        var closeSessionResults = this.findEntryByType(Identifier.AuditSessionEventType);

        // Is these all the audits that were received?  Do these events correspond?

        var totalCount = this.GetResultCount( getBufferResults );
        var openChannelCount = this.GetResultCount( openChannelResults );
        var closeChannelCount = this.GetResultCount( closeChannelResults );
        var openSessionCount = this.GetResultCount( openSessionResults );
        var activateSessionCount = this.GetResultCount( activateSessionResults );
        var closeSessionCount = this.GetResultCount( closeSessionResults );

        var totalIsolated = openChannelCount +
            closeChannelCount +
            openSessionCount +
            activateSessionCount +
            closeSessionCount;


        var openChannelCountExpected = this.GetResultCount( openChannelExpectedEvents );
        var closeChannelCountExpected = this.GetResultCount( closeChannelExpectedEvents );
        var openSessionCountExpected = this.GetResultCount( createSessionExpectedEvents );
        var activateSessionCountExpected = this.GetResultCount( activateSessionExpectedEvents );
        var closeSessionCountExpected = this.GetResultCount( closeSessionExpectedEvents );

        var totalExpected = openChannelCountExpected +
            closeChannelCountExpected +
            openSessionCountExpected +
            activateSessionCountExpected +
            closeSessionCountExpected;

        print('Collected Count = ' + totalCount + ' Channel/Session Count = ' + totalIsolated);

        // // At this point, we should have equal counts of expected vs actual.
        this.CompareExpectedVsActual(Identifier.AuditOpenSecureChannelEventType, openChannelExpectedEvents,openChannelResults);
        this.CompareExpectedVsActual(Identifier.AuditChannelEventType, closeChannelExpectedEvents,closeChannelResults);
        this.CompareExpectedVsActual(Identifier.AuditCreateSessionEventType, createSessionExpectedEvents,openSessionResults);
        this.CompareExpectedVsActual(Identifier.AuditActivateSessionEventType, activateSessionExpectedEvents,activateSessionResults);
        this.CompareExpectedVsActual(Identifier.AuditSessionEventType, closeSessionExpectedEvents,closeSessionResults);

    }

    this.TestFindExpectedFromActual = function(actual){

        var eventTypeFieldIndex = this.audit.GetSelectFieldIndex("EventType");
        var idIndex = this.audit.GetSelectFieldIndex("ClientAuditEntryId");

        for ( var index = 0; index < actual.length; index++ ){
            var record = actual[index];
            var fields = record.EventFieldList.EventFields;
            if ( fields.length <= eventTypeFieldIndex || fields.Length <= idIndex ){
                this.error("TestFindExpectedFromActual - Not enough data to get Event Type and Client Audit Entry Id");
            }
            var eventType = fields[eventTypeFieldIndex].toNodeId();
            var id = fields[idIndex].toString();
            var ids = new UaStrings(1);
            ids[0] = id;

            // Now I can search for them
            var result = this.GetExpectedAuditResultsNodeId(eventType, ids);
            this.ValidateExpectedResult("TestFindExpectedFromActual", result, 1, eventType, id);
        }
    }

    this.TestFindActualFromExpected = function(expected){

        var mySelectFields = ["EventType", "ClientAuditEntryId"];
        for ( var index = 0; index < expected.length; index++){
            var expectedEntry = expected[index];

            var value = new UaVariant();
            value.setString(expectedEntry.AuditEntryId);

            var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
            whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, "ClientAuditEntryId", value );

            // All I care about is the ClientAuditEntryId and the EventType
            var result = this.audit.FindEntryVerbose(mySelectFields, whereClause);

            if ( result.status != true ){
                this.error("TestFindActualFromExpected - Unable to Find Entry for ClientAuditEntryId " + expectedEntry.AuditEntryId );
            }

            if ( result.events.length != 1 ){
                this.error("TestFindActualFromExpected - Unexpected number of results for ClientAuditEntryId " + expectedEntry.AuditEntryId );
            }

            var eventFields = result.events[0].EventFieldList.EventFields;
            if ( eventFields.length != mySelectFields.length ){
                this.error("TestFindActualFromExpected - Unexpected returned fields");
            }

            var eventType = eventFields[0].toNodeId();
            var id = eventFields[1].toString();

            if ( !eventType.equals( expectedEntry.AuditEventType)){
                this.error("TestFindActualFromExpected - Unexpected Audit EventType looking for " + expectedEntry.AuditEntryId );
            }

            if ( id != expectedEntry.AuditEntryId ){
                this.error("TestFindActualFromExpected - Unexpected Audit Id looking for " + expectedEntry.AuditEntryId + " got " + id );
            }
        }
    }

    this.TestGetAuditEventParamsMultipleAuditIds = function( buffer ){
        this.TestGetAuditEventParamsMultipleAuditIdsTest( buffer, Identifier.AuditCreateSessionEventType );
        this.TestGetAuditEventParamsMultipleAuditIdsTest( buffer, Identifier.AuditActivateSessionEventType );
        this.TestGetAuditEventParamsMultipleAuditIdsTest( buffer, Identifier.AuditSessionEventType );
    }

    this.TestGetAuditEventParamsMultipleAuditIdsTest = function( buffer, identifier ){
        var ids = this.GetActualAuditEntryIdsOfType( buffer, identifier);
        var reversedIds = this.Reverse(ids);

        var forwardResults = this.GetExpectedAuditResults( identifier, ids);
        var reversedResults = this.GetExpectedAuditResults( identifier, reversedIds);

        if ( forwardResults.status != true || reversedResults.status != true ){
            this.error("Test Multiple Audit Ids failed due to failed calls");
        }

        var forwardEvents = forwardResults.events;
        // Walk Results at the same time.
        var reReversedEvents = this.Reverse( reversedResults.events );

        if ( forwardEvents.length != reReversedEvents.length || forwardEvents.length != ids.length ){
            this.error("Test Multiple Audit Ids failed due to inconsistent array lengths");
        }

        var desiredEventType = new UaNodeId( identifier );

        for( var index = 0; index < ids.length; index++){
            var forwardEvent = forwardEvents[index];
            var reReversedEvent = reReversedEvents[index];

            if ( !forwardEvent.AuditEventType.equals(desiredEventType) || !reReversedEvent.AuditEventType.equals(desiredEventType) ){
                this.error("Test Multiple Audit Ids retrieved unexpected event type");
            }

            if ( ids[index] != forwardEvent.AuditEntryId ){
                this.error("Test Multiple Audit Ids forward event retrieved audit entry id expected " + ids[index] + " was " + forwardEvent.AuditEntryId);
            }

            if ( ids[index] != reReversedEvent.AuditEntryId ){
                this.error("Test Multiple Audit Ids reversed event retrieved audit entry id expected " + ids[index] + " was " + forwardEvent.AuditEntryId);
            }
        }
    }

    this.TestExpectedEmptyAuditIds = function( expectedChannelAuditEvents ){
        // Given an expected audit event id of empty, find all actual events
        var mySelectFields = ["EventType", "ClientAuditEntryId"];

        var value = new UaVariant();
        value.setString("");

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, "ClientAuditEntryId", value );

        // All I care about is the ClientAuditEntryId and the EventType
        var result = this.audit.FindEntryVerbose(mySelectFields, whereClause);

        // This should get us all back.
        if ( result.status != true ){
            this.error("TestExpectedEmptyAuditIds - Unable to Find Entry for empty ClientAuditEntryId");
        }

        if ( result.events.length != expectedChannelAuditEvents.length ){
            this.error("TestExpectedEmptyAuditIds - Unexpected number of results for ClientAuditEntryId " + expectedChannelAuditEvents.AuditEntryId );
        }
    }

    this.TestActualEmptyAuditIds = function( actualChannelAuditEvents ){
        // TODO
        var helper = this.GetActualRecordHelper();

        var openChannelCount = 0;
        var closeChannelCount = 0;

        for ( var countIndex = 0; countIndex < actualChannelAuditEvents.length; countIndex++ ){
            var actualRecord = actualChannelAuditEvents[countIndex];
            var fields = actualRecord.EventFieldList.EventFields;
            if ( fields.length <= helper.eventTypeFieldIndex || fields.Length <= helper.idIndex ){
                this.error("TestFindExpectedFromActual - Not enough data to get Event Type and Client Audit Entry Id");
            }

            if ( fields.length <= helper.eventTypeFieldIndex || fields.Length <= helper.idIndex ){
                this.error("TestFindExpectedFromActual - Not enough data to get Event Type and Client Audit Entry Id");
            }

            var eventType = fields[helper.eventTypeFieldIndex].toNodeId();
            if ( eventType.equals(helper.openChannelEventType)){
                openChannelCount++;
            }else if(eventType.equals(helper.closeChannelEventType)){
                closeChannelCount++
            }
        }

        var ids = new UaStrings(1);
        ids[0] = "";

        // Now I can search for them
        var openResults = this.GetExpectedAuditResultsNodeId(helper.openChannelEventType, ids);
        var closeResults = this.GetExpectedAuditResultsNodeId(helper.closeChannelEventType, ids);

        this.ValidateExpectedResult("Test actual empty audit field Open Channel Results", openResults, openChannelCount, helper.openChannelEventType, "");
        this.ValidateExpectedResult("Test actual empty audit field Close Channel Results", closeResults, closeChannelCount, helper.closeChannelEventType, "");
    }

    this.TestFindEntry = function(){

        this.TestFindEntryAllFieldsServerNodeId();
        this.TestFindEntryEquals();
        this.TestFindEntryNotEquals();
        this.TestFindEntryGreaterThan();
        this.TestFindEntryGreaterThanOrEqual();
        this.TestFindEntryLessThan();
        this.TestFindEntryLessThanOrEqual();
        this.TestFindEntryNull();
        this.TestFindEntryNotNull();
        this.TestFindEntryBetween();
        this.TestFindEntryInList();
        this.TestFindEntryAnd();
        this.TestFindEntryOr();
        this.TestFindEntryLike();
        this.TestFindEntryOfType();
    }

    this.TestFindEntryAllFieldsServerNodeId = function(){

        var selectFields = [
            "EventId",
            "EventType",
            "SourceName",
            "Message",
            "LocalTime",
            "Time",
            "ReceiveTime",
            "SourceNode",
            "ClientAuditEntryId",
            "ClientUserId"
            ];

        var serverNodeId = new UaNodeId( Identifier.Server );
        var value = new UaVariant();
        value.setNodeId(serverNodeId);

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, "SourceNode", value );

        var result = this.audit.FindEntryVerbose(selectFields, whereClause);

        this.TestFindEntryResults("TestFindEntryAllFieldsServerNodeId", result, true, true);
    }

    this.TestFindEntryEquals = function(){

        this.TestFindEntryComparisonTest("Severity = 500", FilterOperator.Equals, 500, "Severity", true, true);
        // this.TestFindEntryComparisonTest("Severity = 499", FilterOperator.Equals, 499, "Severity", true, false);
        // this.TestFindEntryComparisonTest("Severity = 501", FilterOperator.Equals, 501, "Severity", true, false);

        // this.TestFindEntryComparisonTest("Archie = 501", FilterOperator.Equals, 500, "Archie", false, false);
    }

    this.TestFindEntryComparisonTest = function(name, filterOperator, numericValue, eventFieldName, shouldPass, shouldHaveResults){
        print("TestFindEntryComparison Test " + name + " starting");
        var value = new UaVariant();
        value.setUInt16(numericValue);

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( filterOperator, eventFieldName, value );        ;

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);
        this.TestFindEntryResults(name, result, shouldPass, shouldHaveResults);
    }

    this.TestFindEntryNotEquals = function(){
        this.TestFindEntryNotEqualsTest("Not Severity = 500", 500, "Severity", true, false);
        this.TestFindEntryNotEqualsTest("Not Severity = 499", 499, "Severity", true, true);
        this.TestFindEntryNotEqualsTest("Not Severity = 501", 501, "Severity", true, true);
    }

    this.TestFindEntryNotEqualsTest = function(name, numericValue, eventFieldName, shouldPass, shouldHaveResults ){
        print("TestFindEntryNotEquals Test " + name + " starting");
        var value = new UaVariant();
        value.setUInt16(numericValue);

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        // Create Not Filter
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateSingleOperandFilterElement(FilterOperator.Not, 1);
        // This gives me a FilterElement
        whereClause.Elements[1] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, eventFieldName, value );

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);

        this.TestFindEntryResults(name, result, shouldPass, shouldHaveResults);
    }

    this.TestFindEntryNull = function(name, eventFieldName, shouldPass, shouldHaveResults){
        this.TestFindEntryNullTest("LocalTime = Null", "LocalTime", true, true);
        this.TestFindEntryNullTest("Severity = Null", "Severity", true, false);
        this.TestFindEntryNullTest("SourceNode = Null", "SourceNode", true, false);
    }

    this.TestFindEntryNullTest = function(name, eventFieldName, shouldPass, shouldHaveResults){

        print("TestFindEntryNull Test " + name + " starting");

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();

        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateSimpleOperandFilterElement(FilterOperator.IsNull, eventFieldName);

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);

        this.TestFindEntryResults(name, result, shouldPass, shouldHaveResults);
    }

    this.TestFindEntryNotNull = function(){
        this.TestFindEntryNotNullTest("LocalTime = Null", "LocalTime", true, false);
        this.TestFindEntryNotNullTest("Severity = Null", "Severity", true, true);
        this.TestFindEntryNotNullTest("SourceNode = Null", "SourceNode", true, true);
    }

    this.TestFindEntryNotNullTest = function(name, eventFieldName, shouldPass, shouldHaveResults){

        print("TestFindEntryNotNull Test " + name + " starting");

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();

        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateSingleOperandFilterElement(FilterOperator.Not, 1);
        whereClause.Elements[1] = this.audit.WhereClauseCreator.CreateSimpleOperandFilterElement(FilterOperator.IsNull, eventFieldName);

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);

        this.TestFindEntryResults(name, result, shouldPass, shouldHaveResults);
    }

    this.TestFindEntryGreaterThan = function(){
        this.TestFindEntryComparisonTest("Severity > 500", FilterOperator.GreaterThan, 500, "Severity", true, false);
        this.TestFindEntryComparisonTest("Severity > 499", FilterOperator.GreaterThan, 499, "Severity", true, true);
        this.TestFindEntryComparisonTest("Severity > 501", FilterOperator.GreaterThan, 501, "Severity", true, false);
    }

    this.TestFindEntryGreaterThanOrEqual = function(){
        this.TestFindEntryComparisonTest("Severity >= 500", FilterOperator.GreaterThanOrEqual, 500, "Severity", true, true);
        this.TestFindEntryComparisonTest("Severity >= 499", FilterOperator.GreaterThanOrEqual, 499, "Severity", true, true);
        this.TestFindEntryComparisonTest("Severity >= 501", FilterOperator.GreaterThanOrEqual, 501, "Severity", true, false);
    }

    this.TestFindEntryLessThan = function(){
        this.TestFindEntryComparisonTest("Severity < 500", FilterOperator.LessThan, 500, "Severity", true, false);
        this.TestFindEntryComparisonTest("Severity < 499", FilterOperator.LessThan, 499, "Severity", true, false);
        this.TestFindEntryComparisonTest("Severity < 501", FilterOperator.LessThan, 501, "Severity", true, true);
    }

    this.TestFindEntryLessThanOrEqual = function(){
        this.TestFindEntryComparisonTest("Severity <= 500", FilterOperator.LessThanOrEqual, 500, "Severity", true, true);
        this.TestFindEntryComparisonTest("Severity <= 499", FilterOperator.LessThanOrEqual, 499, "Severity", true, false);
        this.TestFindEntryComparisonTest("Severity <= 501", FilterOperator.LessThanOrEqual, 501, "Severity", true, true);
    }

    this.TestFindEntryLike = function(){

        // There are many cases that cannot be tested with the server that is being used for development,
        // due to the few messages being sent back.
        // There are test cases in code to handle these conditions.

        // Passing Cases

        this.TestFindEntryLikeTest("Like ", "Session/ActivateSession", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "%Activate%", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "%Act%vate%", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "%/[AC][cr]%", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "Session%", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "_ession/%", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "__ssion/%", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "[S]ession/[A]ctivateSessio[n]", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "[S][e]ssion/[A][c]tivateSessi[o][n]", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "[^%]ession/[^%]ctivateSessio[^%]", "SourceName", true, true);

        this.TestFindEntryLikeTest("Like ", "[^C]ession/[^C]ctivateSessio[^C]", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "[^C][^a]ssion/[^C][^a]tivateSessi[^a][^C]", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "Session/_ctivateSessio_", "SourceName", true, true);
        this.TestFindEntryLikeTest("Like ", "S_ssion/__tivateSessi__", "SourceName", true, true);

        // Failing Cases

        this.TestFindEntryLikeTest("Like ", "ession/ActivateSession", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "Session/ctivateSession", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "Session/ActivateSessio", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "%Actiate%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "%Act%vte%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "%/[AC][bd-f]%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "%/[^A]c%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "%/[A][^c]%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "ession%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "_esion/%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "__sson/%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "_ession/FF%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "__ssion/FF%", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[^S]ession/[A]ctivateSessio[n]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[S]ession/[^A]ctivateSessio[n]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[S]ession/[A]ctivateSessio[^n]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[S][^e]ssion/[A][c]tivateSessi[o][n]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[S][e]ssion/[A][^c]tivateSessi[o][^n]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[C]ession/[^C]ctivateSessio[^C]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[^C]ession/[C]ctivateSessio[^C]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[^C]ession/[^C]ctivateSessio[C]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[^C][a]ssion/[^C][^a]tivateSessi[^a][^C]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[^C][^a]ssion/[^C][a]tivateSessi[^a][^C]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[^C][^a]ssion/[^C][^a]tivateSessi[^a][C]", "SourceName", true, false);
        this.TestFindEntryLikeTest("Like ", "[%]ession/[%]ctivateSessio[%]", "SourceName", true, false);

        // try some Node ids

        // SourceNode: i=2253
        this.TestFindEntryLikeTest("Like ", "i=2253", "SourceNode", true, true);
        this.TestFindEntryLikeTest("Like ", "__2253", "SourceNode", true, true);
        this.TestFindEntryLikeTest("Like ", "i=[12]253", "SourceNode", true, true);

        this.TestFindEntryLikeTest("Like ", "i=2254", "SourceNode", true, false);
        this.TestFindEntryLikeTest("Like ", "__2254", "SourceNode", true, false);
        this.TestFindEntryLikeTest("Like ", "i=[13-9]253", "SourceNode", true, false);
    }

    this.TestFindEntryLikeTest = function(name, stringValue, eventFieldName, shouldPass, shouldHaveResults ){
        var combinedName = name + " " + stringValue;

        var titleResult = " should have results ";

        if ( !shouldHaveResults ){
            titleResult = " should not have results ";
        }
        print("TestFindEntryLike Test " + combinedName + titleResult + " starting");
        var value = new UaVariant();
        value.setString(stringValue);

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Like, eventFieldName, value );

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);

        this.TestFindEntryResults(combinedName, result, shouldPass, shouldHaveResults);
    }

    this.TestFindEntryBetween = function(){
        this.TestFindEntryBetweenTest("Severity Between 499 and 501", 499, 501, "Severity", true, true);
        this.TestFindEntryBetweenTest("Severity Between 500 and 500", 500, 500, "Severity", true, true);
        this.TestFindEntryBetweenTest("Severity Between 500 and 501", 500, 501, "Severity", true, true);
        this.TestFindEntryBetweenTest("Severity Between 499 and 500", 499, 500, "Severity", true, true);
        this.TestFindEntryBetweenTest("Severity Between 1 and 499", 1, 499, "Severity", true, false);
        this.TestFindEntryBetweenTest("Severity Between 501 and 999", 501, 999, "Severity", true, false);
        this.TestFindEntryBetweenTest("Severity Between 501 and 499", 501, 499, "Severity", true, false);
    }

    this.TestFindEntryBetweenTest = function(name, lowNumeric, highNumeric, eventFieldName, shouldPass, shouldHaveResults ){
        print("TestFindEntryBetween Test " + name + " starting");
        var lowValue = new UaVariant();
        lowValue.setUInt16(lowNumeric);
        var highValue = new UaVariant();
        highValue.setUInt16(highNumeric);

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateBetweenOperandFilterElement( eventFieldName, lowValue, highValue);

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);
        this.TestFindEntryResults(name, result, shouldPass, shouldHaveResults);

    }

    this.TestFindEntryInList = function(){
        this.TestFindEntryInListTest("Severity not in list of 1,2,3", [1,2,3], "Severity", true, false);
        this.TestFindEntryInListTest("Severity not in list of 499", [499], "Severity", true, false);
        this.TestFindEntryInListTest("Severity not in list of 499, 501", [499, 501], "Severity", true, false);
        var largeList = [];
        var completeList = [];
        for ( var index = 0; index < 999; index++ ){
            completeList.push(index);
            if ( index != 500 ){
                largeList.push(index);
            }
        }
        this.TestFindEntryInListTest("Severity not in large list", largeList, "Severity", true, false);
        this.TestFindEntryInListTest("Severity in large list", completeList, "Severity", true, true);
        this.TestFindEntryInListTest("Severity in list of 500", [500], "Severity", true, true);
        this.TestFindEntryInListTest("Severity in list of 499, 500", [499, 500], "Severity", true, true);
    }

    this.TestFindEntryInListTest = function(name, values, eventFieldName, shouldPass, shouldHaveResults){
        print("TestFindEntryInList Test " + name + " starting");

        var element = new UaContentFilterElement();
        element.FilterOperator = FilterOperator.InList;
        element.FilterOperands = new UaExtensionObjects();
        element.FilterOperands[0] = this.audit.WhereClauseCreator.CreateSimpleAttributeOperand(eventFieldName);
        for ( var index = 0; index < values.length; index++ ){
            var value = new UaVariant();
            value.setUInt16(values[index]);
            element.FilterOperands[index + 1] = this.audit.WhereClauseCreator.CreateLiteralOperand(value);
        }

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = element;

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);
        this.TestFindEntryResults(name, result, shouldPass, shouldHaveResults);
    }

    this.TestFindEntryAnd = function(){

        this.TestFindEntryAndTest(
            "Severity = 500 AND EventType = AuditCreateSessionEventType",
            500, "Severity", Identifier.AuditCreateSessionEventType, "EventType", true, true);

        this.TestFindEntryAndTest(
            "Severity = 500 AND EventType == Server node id",
            500, "Severity", Identifier.Server, "EventType", true, false);

            this.TestFindEntryAndTest(
            "Severity = 499 AND = AuditCreateSessionEventType",
            499, "Severity", Identifier.AuditCreateSessionEventType, "EventType", true, false);
    }

    this.TestFindEntryAndTest = function(name, firstValue, firstFieldName, secondValue, secondFieldName, shouldPass, shouldHaveResults){
        print("TestFindEntryAnd Test " + name + " starting");
        var firstVariant = new UaVariant();
        firstVariant.setUInt16(firstValue);
        var secondVariant = new UaVariant();
        secondVariant.setNodeId(new UaNodeId( secondValue ));

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateSingleOperandFilterElement(FilterOperator.And, 1);
        whereClause.Elements[0].FilterOperands[1] = this.audit.WhereClauseCreator.CreateElementOperand(2);

        whereClause.Elements[1] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, firstFieldName, firstVariant);
        whereClause.Elements[2] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, secondFieldName, secondVariant );

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);

        this.TestFindEntryResults(name, result, shouldPass, shouldHaveResults);
    }

    this.TestFindEntryOr = function(){
        this.TestFindEntryOrTest(
            "Severity = 500 OR EventType = AuditCreateSessionEventType",
            500, "Severity", Identifier.AuditCreateSessionEventType, "EventType", true, true);
        this.TestFindEntryOrTest(
            "Severity = 500 OR EventType == Server node id",
            500, "Severity", Identifier.Server, "EventType", true, true);
        this.TestFindEntryOrTest(
            "Severity = 499 OR = AuditCreateSessionEventType",
            499, "Severity", Identifier.AuditCreateSessionEventType, "EventType", true, true);
        this.TestFindEntryOrTest(
                "Severity = 499 OR EventType == Server node id",
                499, "Severity", Identifier.Server, "EventType", true, false);
    }

    this.TestFindEntryOrTest = function(name, firstValue, firstFieldName, secondValue, secondFieldName, shouldPass, shouldHaveResults){
        print("TestFindEntryOr Test " + name + " starting");
        var firstVariant = new UaVariant();
        firstVariant.setUInt16(firstValue);
        var secondVariant = new UaVariant();
        secondVariant.setNodeId(new UaNodeId( secondValue ));

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateSingleOperandFilterElement(FilterOperator.Or, 1);
        whereClause.Elements[0].FilterOperands[1] = this.audit.WhereClauseCreator.CreateElementOperand(2);

        whereClause.Elements[1] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, firstFieldName, firstVariant);
        whereClause.Elements[2] = this.audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, secondFieldName, secondVariant );

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);

        this.TestFindEntryResults(name, result, shouldPass, shouldHaveResults);
    }

    this.TestFindEntryOfType = function(){
        this.TestFindEntryOfTypeTest("AuditCreateSessionEventType", Identifier.AuditCreateSessionEventType, true);
        this.TestFindEntryOfTypeTest("VendorServerInfoType", Identifier.VendorServerInfoType, false);
    }

    this.TestFindEntryOfTypeTest = function(name, nodeIdentifier, shouldHaveResults){

        var combinedName = name + " " + shouldHaveResults;
        print("TestFindEntryOfType Test " + combinedName + " starting");

        var typeNodeId = new UaNodeId( nodeIdentifier );
        var value = new UaVariant();
        value.setNodeId(typeNodeId);

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateOfTypeOperandFilterElement( value );

        var result = this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);

        this.TestFindEntryResults(combinedName, result, true, shouldHaveResults);
    }

    // Need a bunch of tests for return error codes.
    // Each test should have a condition where it cannot find the field.

    this.TestFindEntryResults = function(name, results, shouldPass, shouldHaveResults){
        if ( shouldPass == results.status ){
            if ( shouldPass && shouldHaveResults && results.events.length == 0){
                this.error(name + " should have had results but had none" );
            }
            if ( shouldPass && !shouldHaveResults && results.events.length > 0){
                this.error(name + " should not have had results but had " + results.events.length );
            }
            if ( shouldPass && results.events.length > 0){
                this.PrintTestResult(name, results, this.audit.SelectFields());
            }
        } else {
            this.error(name + " status not equal to " + shouldPass );
        }

        print("Test " + name + " completed");
    }

    //#endregion

    //#region Helper Functions

    this.CompareExpectedVsActual = function(type, expected, actual){

        var testName = GetAuditEventName(new UaNodeId(type));

        if ( expected.status == false){
            this.error(testName + " Expected values did not succeed");
        }
        if ( actual.status == false){
            this.error(testName + " Actual values did not succeed");
        }

        return this.CompareExpectedVsActualTest(testName, expected.events, actual.events);
    }

    this.CompareExpectedVsActualTest = function(testName, expected, actual){

        var unfoundExpectedRecords = [];

        if ( !isDefined(expected.length) ){
            this.error( testName + " expected did not have any results");
        }

        if ( !isDefined(actual.length) ){
            this.error( testName + " actual did not have any results");
        }

        if ( actual.length != expected.length ){
            print( testName + " actual length did not match expected length expected [" + expected.length + "] actual [" + actual.length + "]");
            //this.error( testName + " actual length did not match expected length expected [" + expected.events.length + "] actual [" + actual.events.length + "]");
        }

        // Each of the entry ids should match
        for ( var index = 0; index < expected.length; index++ ){
            var expectedRecord = expected[index];
            if ( expectedRecord.AuditEntryId.length > 0 && expectedRecord.AuditEntryId[0].length > 0  ){
                var foundRecord = this.FindRecordByEntryId(actual, expectedRecord.AuditEntryId);
                if ( foundRecord == null){
                    print("Unable to find expected record " + expectedRecord.AuditEntryId + " in actual record list");
                    unfoundExpectedRecords.push(expectedRecord);
                    //this.error("Unable to find expected record " + expectedRecord.AuditEntryId + " in actual record list");
                }else{
                    print("Found expected record " + expectedRecord.AuditEntryId + " in actual record list");
                }
            }else{
                print('Audit Entry Id is empty.  Not going to do check');
            }
        }

        return unfoundExpectedRecords;
    }

    this.DropAndRemove = function(actualResults, expectedResults, half){

        var loopStep = 1;
        if ( half == true ){
            loopStep = 2;
        }

        var actualRecords = this.GetRecordArray(actualResults);
        var expectedRecords = this.GetRecordArray(expectedResults);

        var removeEntryIds = [];
        var dropAuditRecordIds = [];

        for ( var index = 0; index < actualRecords.length; index += loopStep ){

            var actualRecord = actualRecords[index];
            removeEntryIds.push(actualRecord.EventHandle);

            var expectedRecord = this.FindExpectedFromActual(actualRecord, expectedRecords);
            dropAuditRecordIds.push( expectedRecord.EventId);
        }

        var removeResult = this.audit.RemoveEntry(removeEntryIds);
        var dropResult = this.audit.DropAuditRecord(dropAuditRecordIds);

        if ( !removeResult || !dropResult ){
            this.error("Unable to remove entries, and/or drop entries");
        }
    }

    this.DropAndRemoveAll = function(actualResults, expectedResults){

        var actualRecords = this.GetRecordArray(actualResults);
        var expectedRecords = this.GetRecordArray(expectedResults);

        var removeEntryIds = [];
        var dropAuditRecordIds = [];

        for ( var index = 0; index < actualRecords.length; index++ ){
            var actualRecord = actualRecords[index];
            removeEntryIds.push(actualRecord.EventHandle);
        }

        for ( var index = 0; index < expectedRecords.length; index++ ){
            var expectedRecord = expectedRecords[index];
            dropAuditRecordIds.push( expectedRecord.EventId);
        }

        var removeResult = this.audit.RemoveEntry(removeEntryIds);
        var dropResult = this.audit.DropAuditRecord(dropAuditRecordIds);

        if ( !removeResult || !dropResult ){
            this.error("Unable to remove entries, and/or drop entries");
        }
    }

    this.error = function(message){
        Test.DisconnectAudit();
        throw(message);
    }

    this.FindActualFromExpected = function(expectedRecord, actualRecords){
        var foundActualRecord = null;

        var expectedEventType = expectedRecord.AuditEventType;
        var expectedAuditEntryId =  expectedRecord.AuditEntryId;
        var expectedEventId = expectedRecord.EventId;
        var expectedTime = this.GetExpectedRecordTime(expectedRecord);

        var helper = this.GetActualRecordHelper();
        var actualEvents = this.GetRecordArray(actualRecords);

        for ( var index = 0; index < actualEvents.length; index++ ){
            var actualRecord = actualEvents[index];
            var fields = actualRecord.EventFieldList.EventFields;
            var eventType = fields[helper.eventTypeFieldIndex].toNodeId();
            var auditEntryId = fields[helper.idIndex].toString();
            var time = fields[helper.timeIndex].toDateTime();

            if ( eventType.equals( expectedEventType ) ){
                if ( this.IsChannelEvent(eventType)){
                    // Actual will always be first
                    var timeDifference = time.msecsTo(expectedTime);

                    if ( this.TimeIsWithinRange( timeDifference ) ){
                        foundActualRecord = actualRecord;
                        break;
                    }

                }else{
                    if ( expectedAuditEntryId == auditEntryId ){
                        foundActualRecord = actualRecord;
                        break;
                    }
                }
            }
        }

        return foundActualRecord;
    }

    this.findEntryByType = function(type){

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();

        var typeNodeId = new UaNodeId( type );
        var value = new UaVariant();
        value.setNodeId(typeNodeId);

        var whereClause = this.audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = this.audit.WhereClauseCreator.CreateOfTypeOperandFilterElement( value );

        return this.audit.FindEntryVerbose(this.audit.SelectFields(), whereClause);
    }

    this.FindExpectedFromActual = function(actualRecord, expectedRecords){
        var foundExpectedRecord = null;
        var helper = this.GetActualRecordHelper();

        var fields = actualRecord.EventFieldList.EventFields;
        var eventType = fields[helper.eventTypeFieldIndex].toNodeId();
        var auditEntryId = fields[helper.idIndex].toString();
        var time = fields[helper.timeIndex].toDateTime();

        for ( var index = 0; index < expectedRecords.length; index++ ){
            var expectedRecord = expectedRecords[index];

            if ( expectedRecord.AuditEventType.equals(eventType)){

                if ( this.IsChannelEvent(eventType ) ){
                    // Use Time
                    var pushTime = this.GetExpectedRecordTime(expectedRecord);
                    var timeDifference = time.msecsTo(pushTime);
                    if ( this.TimeIsWithinRange(timeDifference) ){
                        foundExpectedRecord = expectedRecord;
                        break;
                    }
                }else if ( expectedRecord.AuditEventType.equals(eventType)){
                    if ( expectedRecord.AuditEntryId == auditEntryId ){
                        foundExpectedRecord = expectedRecord;
                        break;
                    }
                }
            }
        }

        return foundExpectedRecord;
    }

    this.FindRecordByEntryId = function(actualRecords, entryId){

        var foundRecord = null;

        var clientAuditEntryIdIndex = this.audit.GetSelectFieldIndex("ClientAuditEntryId");

        if ( isDefined(actualRecords.length) ){
            for ( var index = 0; index < actualRecords.length; index++ ){
                var actualRecord = actualRecords[index];
                var eventFields = actualRecord.EventFieldList.EventFields;
                if ( eventFields.length > clientAuditEntryIdIndex ){
                    if ( eventFields[clientAuditEntryIdIndex] == entryId ){
                        foundRecord = actualRecord;
                        break;
                    }
                }
            }
        }

        return foundRecord;
    }

    this.generateEventData = function(){

        print("Generate Data Starting");
        var desiredIterations = 5;

        for ( var index = 0; index < desiredIterations; index++ ){
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

    this.GetActualAuditEntryIdsOfType = function( buffer, type ){
        var eventTypeFieldIndex = this.audit.GetSelectFieldIndex("EventType");
        var idIndex = this.audit.GetSelectFieldIndex("ClientAuditEntryId");

        var auditEntryIds = [];
        var typeId = new UaNodeId(type);

        for ( var index = 0; index < buffer.length; index++ ){
            var record = buffer[index];
            var fields = record.EventFieldList.EventFields;
            if ( fields.length <= eventTypeFieldIndex || fields.Length <= idIndex ){
                this.error("GetActualAuditEntryIdsOfType - Not enough data to get Event Type and Client Audit Entry Id");
            }
            var eventType = fields[eventTypeFieldIndex].toNodeId();
            if ( eventType.equals(typeId) ){
                auditEntryIds.push(fields[idIndex].toString());
            }
        }
        return auditEntryIds;
    }

    this.GetActualRecordHelper = function(){
        if ( !this.actualRecordHelper ){
            this.actualRecordHelper = new Object();
            this.actualRecordHelper.eventTypeFieldIndex = this.audit.GetSelectFieldIndex("EventType");
            this.actualRecordHelper.idIndex = this.audit.GetSelectFieldIndex("ClientAuditEntryId");
            this.actualRecordHelper.timeIndex = this.audit.GetSelectFieldIndex("Time");

            this.actualRecordHelper.openChannelEventType = new UaNodeId(Identifier.AuditOpenSecureChannelEventType);
            this.actualRecordHelper.closeChannelEventType= new UaNodeId(Identifier.AuditChannelEventType);
        }
        return this.actualRecordHelper;
    }

    this.GetExpectedAuditResults = function( identifier, entryIds ){

        return this.GetExpectedAuditResultsNodeId( new UaNodeId(identifier), entryIds);
    }

    this.GetExpectedAuditResultsNodeId = function( nodeId, entryIds ){

        var results = this.audit.GetAuditEventParams({
            AuditEventType : nodeId,
            AuditEntryIds : entryIds
        });

        // Takes up a lot of space to do this
        // var printLines = this.audit.SessionThread.Helpers.GetAuditEventParamsHelper.ValuesToString(results);

        // print( printLines.join("\n"));

        return results;
    }

    this.GetExpectedRecordTime = function(expectedRecord){
        var time = null;
        for ( var fieldIndex = 0; fieldIndex < expectedRecord.PropertyNames.length; fieldIndex++){
            var propertyName = expectedRecord.PropertyNames[fieldIndex].Name;
            var propertyValue = expectedRecord.PropertyValues[fieldIndex];

            if ( propertyName == "Time"){
                time = propertyValue.toDateTime();
                break;
            }
        }
        return time;
    }

    this.GetRecordArray = function(results){
        var recordArray = null;
        if ( isDefined( results ) && isDefined( results.status ) && isDefined( results.events ) ){
            // This is a results object
            recordArray = results.events;
        }else if ( isDefined( results ) && isDefined( results.length ) ){
            // This is a results array
            recordArray = results;
        }else{
            this.error("Unable to get Record array");
        }

        return recordArray;
    }

    this.GetResultCount = function( results ){
        // This function works for FindEntryByType as well as GetAuditEventParams
        var result = -1;

        if ( isDefined(results) && isDefined(results.events) && isDefined(results.events.length) ){
            result = results.events.length;
        }

        return result;
    }

    this.IsChannelEvent = function(eventType){
        var isChannel = false;
        var helper = this.GetActualRecordHelper();
        if ( eventType.equals(helper.openChannelEventType) || eventType.equals(helper.closeChannelEventType) ){
            isChannel = true;
        }

        return isChannel;
    }

    this.Reverse = function(originals){
        var reversed = [];

        for ( var index = originals.length - 1; index >= 0; index-- ){
            reversed.push(originals[index]);
        }

        return reversed;
    }

    this.SplitChannelAndOtherActualEvents = function( results, channel, other ){
        var eventTypeIndex = this.audit.GetSelectFieldIndex("EventType");
        var openChannelNodeId = new UaNodeId(Identifier.AuditOpenSecureChannelEventType);
        var closeChannelNodeId = new UaNodeId(Identifier.AuditChannelEventType);

        if ( isDefined(results) && isDefined(results.events) && isDefined(results.events.length) ){
            for ( var index = 0; index < results.events.length; index++ ){
                var record = results.events[index];
                if ( isDefined( record.EventFieldList) &&
                     isDefined( record.EventFieldList.EventFields) &&
                     isDefined( record.EventFieldList.EventFields.length) &&
                     record.EventFieldList.EventFields.length > eventTypeIndex ){
                    var recordEventType = record.EventFieldList.EventFields[eventTypeIndex];
                    var recordNodeId = recordEventType.toNodeId();
                    if ( recordNodeId.equals(openChannelNodeId) || recordNodeId.equals(closeChannelNodeId) ){
                            channel.push(record);
                    }else{
                        other.push(record);
                    }
                }
            }
        }
    }

    this.SplitChannelAndOtherExpectedEvents = function( results, channel, other ){
        var openChannelNodeId = new UaNodeId(Identifier.AuditOpenSecureChannelEventType);
        var closeChannelNodeId = new UaNodeId(Identifier.AuditChannelEventType);

        if ( isDefined(results) && isDefined(results.length) ){
            for ( var index = 0; index < results.length; index++ ){
                var record = results[index];
                if ( record.AuditEventType.equals(openChannelNodeId) ||
                     record.AuditEventType.equals(closeChannelNodeId) ) {
                       channel.push(record);
                }else{
                    other.push(record);
                }
            }
        }
    }

    this.TimeIsWithinRange = function(timeDifference){
        var timeWithinRange = false;
        if ( timeDifference >= 0 && timeDifference < 100 ){
            timeWithinRange = true;
        }
        return timeWithinRange;
    }

    this.ValidateExpectedResult = function(test, result, expectedLength, eventType, eventId ){
        if ( result.status != true ){
            this.error(test + " - GetAuditEventParams failed");
        }

        if ( result.events.length != expectedLength ){
            this.error(test + " - GetAuditEventParams returned and unexpected length [" + result.events.length + "]");
        }

        for ( var index = 0; index < expectedLength; index++){
            if ( !result.events[index].AuditEventType.equals(eventType)){
                this.error(test + " - Event Types were not equal");
            }

            if ( result.events[index].AuditEntryId != eventId ){
                this.error(test + " - Audit Event Id was not equal");
            }
        }
    }

    //#endregion

    //#region Debug Helpers

    this.PrintActualRecord = function(record){
        var helper = this.GetActualRecordHelper();

        var fields = record.EventFieldList.EventFields;
        var eventType = fields[helper.eventTypeFieldIndex].toNodeId();
        var auditEntryId = fields[helper.idIndex].toString();
        var time = fields[helper.timeIndex].toDateTime();
        print("Actual Record " + record.EventHandle);
        print("Event Type = " + GetAuditEventName(eventType));
        print("Audit Id = " + auditEntryId);
        print("Time = " + time.toString());
    }

    this.PrintAllTimestamps = function(actualResults, expectedResults){
        var actualRecords = this.GetRecordArray(actualResults);
        var expectedRecords = this.GetRecordArray(expectedResults);

        // Actuals
        var eventTypeFieldIndex = this.audit.GetSelectFieldIndex("EventType");
        var idIndex = this.audit.GetSelectFieldIndex("ClientAuditEntryId");
        var timeIndex = this.audit.GetSelectFieldIndex("Time");

        for ( var index = 0; index < actualRecords.length; index++ ){
            this.PrintActualRecord(actualRecords[index]);
        }

        //Expecteds

        for ( var expectedIndex = 0; expectedIndex < expectedRecords.length; expectedIndex++ ){
            this.PrintExpectedRecord(expectedRecords[expectedIndex]);
        }
    }

    this.PrintExpectedRecord = function(record){
        print("Expected Record type " + GetAuditEventName(record.AuditEventType));
        print("Expected Record Audit id " + record.AuditEntryId);
        print("Expected Record event id " + record.EventId);

        for ( var fieldIndex = 0; fieldIndex < record.PropertyNames.length; fieldIndex++){
            var propertyName = record.PropertyNames[fieldIndex].Name;
            var propertyValue = record.PropertyValues[fieldIndex];

            if ( propertyName == "Time"){
                var pushTime = propertyValue.toDateTime();
                print("Expected Record Time = " + pushTime.toString());
                break;
            }
        }
    }
    
    this.PrintTestResult = function(testName, result, selectFields){
        var resultString = " Failed";
        if ( result.status === true ){
            resultString = " Passed";
        }
        print( "Test " + testName + resultString );
        if ( result.status === true ){

            var printLines = this.audit.SessionThread.Helpers.FindEntryHelper.ValuesToString(
                result, this.audit.CreateSelect(selectFields));

            print( printLines.join("\n"));
        }
    }

    //#endregion

}

var audit = new AuditTest();
audit.run();
