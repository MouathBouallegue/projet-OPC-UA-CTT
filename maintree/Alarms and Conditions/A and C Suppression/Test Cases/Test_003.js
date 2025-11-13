/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Create  an event subscription that has a filter that restrict the events that have SuppressedOrShelved = TRUE

    Expectation:
        Only the suppressed event appear in the list

    How this test works:
*/

function Test_003() {

    this.TestName = "Test_003";

    this.SuppressedEventMap = null;
    this.IdsToDelete = null;

    this.CheckAgain = null;
    this.CanRun = null;
    this.AlarmDetails = null;


    this.Initialize = function ( collector ) {
        this.AlarmDetails = CUVariables.Suppress.CreateSuppressEventMonitor( true );
        this.CanRun = this.AlarmDetails.ItemCreated;
        if ( this.AlarmDetails.ItemCreated ) {
            CUVariables.Suppress.TrueEventMonitor = this.AlarmDetails;
        }
    }

    this.PreLoopAction = function ( collector ) {

        if ( this.CanRun ) {

            var events = collector.AlarmThreadHolder.AlarmThread.GetBuffer(
                this.AlarmDetails.Subscription.SubscriptionId,
                this.AlarmDetails.EventMonitoredItem.ClientHandle );

            this.ProcessList( collector, events );
        }

        if ( isDefined( this.CheckAgain ) ) {
            // Test for events that came in TestEvent last time.
            this.CheckAgain.Iterate( function ( eventIdString, data, args ) {
                if ( args.This.SuppressedEventMap.Contains( eventIdString ) ) {
                    data.TestCase.TestsPassed++;
                } else {
                    collector.AddMessage( data.TestCase, collector.Categories.Error,
                        data.ConditionId.toString() +
                        " Event monitor for SuppressedOrShelved Events does not have entry for eventId " +
                        eventIdString );
                    data.TestCase.TestsFailed++;
                }
                collector.TestCompleted( data.ConditionId, args.This.TestName );

            }, { This: this } );
        }

        this.CheckAgain = new KeyPairCollection();
    }

    this.ProcessList = function ( collector, events ) {

        this.SuppressedEventMap = new KeyPairCollection();
        this.IdsToDelete = [];

        if ( isDefined( events ) &&
            isDefined( events.status ) &&
            events.status == true &&
            isDefined( events.events ) &&
            isDefined( events.events.length ) ) {
            for ( var index = 0; index < events.events.length; index++ ) {
                this.IdsToDelete.push( events.events[ index ].EventHandle );
                var eventFields = events.events[ index ].EventFieldList.EventFields;
                var conditionId = collector.GetConditionId( eventFields );
                var eventId = collector.GetSelectFieldFromMap(
                    eventFields, "EventId", CUVariables.Suppress.SelectFields );
                var suppressedOrShelved = collector.GetSelectFieldFromMap(
                    eventFields, "SuppressedOrShelved", CUVariables.Suppress.SelectFields );
                var suppressedState = collector.GetSelectFieldFromMap(
                    eventFields, "SuppressedState", CUVariables.Suppress.SelectFields );
                var outOfServiceState = collector.GetSelectFieldFromMap(
                    eventFields, "OutOfServiceState", CUVariables.Suppress.SelectFields );
                var shelvingState = collector.GetSelectFieldFromMap(
                    eventFields, "ShelvingState.CurrentState", CUVariables.Suppress.SelectFields );
                print( eventId.toString() +
                    " SuppressedState " + suppressedOrShelved +
                    " SuppressedOrShelved " + suppressedState +
                    " OutOfServiceState " + outOfServiceState +
                    " ShelvingState.CurrentState " + shelvingState +
                    " " + conditionId.toString() );

                this.SuppressedEventMap.Set( eventId.toString(), eventFields );
            }
        }
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {

        if ( !this.CanRunTest( eventFields, testCase, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        var eventIdString = collector.GetSelectField( eventFields, "EventId" ).toString();

        var suppressedOrShelved = collector.GetSelectField( eventFields, "SuppressedOrShelved" );
        if ( collector.ValidateDataType( suppressedOrShelved, BuiltInType.Boolean ) ) {
            var suppressedOrShelvedValue = suppressedOrShelved.toBoolean();
            print( conditionIdString + " Suppressed Or Shelved = " + suppressedOrShelvedValue );
            if ( suppressedOrShelvedValue ) {
                if ( this.SuppressedEventMap.Contains( eventIdString ) ) {
                    testCase.TestsPassed++;
                    collector.TestCompleted( conditionId, this.TestName );
                } else {
                    // Save until next loop
                    this.CheckAgain.Set( eventIdString,
                        {
                            ConditionId: conditionId,
                            TestCase: testCase
                        } );
                }
            }
        } else {
            collector.AddMessage( testCase, collector.Categories.Error,
                conditionIdString + " Unable to get mandatory SuppressedOrShelved event field " );
            testCase.TestsFailed++;
            collector.TestCompleted( conditionId, this.TestName );
        }
    }

    this.CanRunTest = function ( eventFields, testCase, collector ) {
        var canRun = false;

        var conditionId = collector.GetConditionId( eventFields );

        if ( collector.CanRunTest( conditionId, this.TestName ) ) {
            if ( CUVariables.Suppress.IsAlarmCondition( eventFields, collector ) && this.CanRun ) {
                canRun = this.CanRun;
            } else {
                testCase.TestsSkipped++;
                collector.TestCompleted( conditionId, this.TestName );
            }
        }

        return canRun;
    }

    this.PostLoopAction = function ( collector ) {

        if ( this.CanRun &&
            isDefined( this.IdsToDelete ) &&
            isDefined( this.IdsToDelete.length ) &&
            this.IdsToDelete.length > 0 ) {

            collector.AlarmThreadHolder.AlarmThread.RemoveEntry(
                this.IdsToDelete,
                this.AlarmDetails.Subscription.SubscriptionId,
                this.AlarmDetails.EventMonitoredItem.ClientHandle
            );
        }
    }

    this.CheckResults = function () {

        return CUVariables.AlarmCollector.CheckResults( this.TestName, CUVariables.PrintResults );
    }

    if ( isDefined( CUVariables.AutoRun ) ) {
        if ( !CUVariables.AutoRun ) {
            CUVariables.AlarmCollector.RunSingleTest( CUVariables, this.TestName, this );
            return this.CheckResults();
        } else if ( CUVariables.CheckResults ) {
            return this.CheckResults();
        }
    }
}

if ( isDefined( CUVariables.AutoRun ) ) {
    if ( !CUVariables.AutoRun ) {
        Test.Execute( { Procedure: Test_003 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_003 } );
    }
}