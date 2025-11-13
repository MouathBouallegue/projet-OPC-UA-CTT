/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Instances/Level/Test Cases/Test_002.js

    Description:    
        for an active alarm, verify that all properties have the same value as received in the event 

    Expectation:
        All two state variable have the correct state and any statemachines also have the correct state.
    
*/

function Test_002 () {

    this.TestName = "Test_002";

    this.States = {
        Initial: "Initial",
        DeviceRead: "DeviceRead",
        Complete: "Complete",
        Failed: "Failed"
    }

    this.TestCaseMap = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {
        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = collector.GetConditionId( eventFields ).toString();

        if ( !collector.CanRunTest( conditionId, this.TestName ) ){
            return;
        }

        var instance = this.GetInstance( eventFields, testCase, collector );

        if ( isDefined( instance ) ) {

            if ( !this.TestCaseMap.Contains( conditionIdString ) ){
                this.TestCaseMap.Set( conditionIdString, {
                    ConditionIdString: conditionIdString,
                    State: this.States.Initial,
                    TestCase: testCase,
                    ReadEventId: null,
                    ReadEventFields: null
                } )
            }

            var localTestCase = this.TestCaseMap.Get( conditionIdString );

            if ( localTestCase.State == this.States.Initial ){
                var alarmUtilities = collector.GetAlarmTester().GetAlarmUtilities();
                var deviceReadEventFields = alarmUtilities.ReadEventFields( instance, 
                    collector.AlarmThreadHolder.SelectFields );
                if ( isDefined( deviceReadEventFields ) ){
                    localTestCase.ReadEventFields = deviceReadEventFields;
                    localTestCase.EventId = collector.GetSelectField( localTestCase.ReadEventFields, "EventId" );
                    localTestCase.State = this.States.DeviceRead;
                }else{
                    collector.Error( this.TestName, conditionIdString, localTestCase, this.States.Failed,
                        "Unable to read device instance fields" );
                }
            }

            if ( localTestCase.State == this.States.DeviceRead ){
                var eventId = collector.GetSelectField( eventFields, "EventId" );
                if (  eventId.equals( localTestCase.EventId ) ){
                    var eventType = collector.GetSelectField( eventFields, "EventType" );
                    var alarmTester = collector.GetAlarmTester(); 
                    var alarmTypes = alarmTester.GetSupportedAlarmTypes();
                    var alarmType = alarmTypes.Get( eventType.toString() );
                    var maps = CUVariables.Instances.GetTypeMaps( alarmTester, alarmType );

                    this.TestFields( "Condition", eventFields, localTestCase, collector, maps );
                    this.TestFields( "Instance", localTestCase.ReadEventFields, 
                        localTestCase, collector, maps );

                    // Now compare all values
                    var lengthMinusConditionId = eventFields.length - 1;
                    // no need to compare array lengths, they are created to the same size
                    for( var index = 0; index < lengthMinusConditionId; index++ ){
                        var eventVariant = eventFields[ index ];
                        var readVariant = localTestCase.ReadEventFields[ index ];

                        if ( eventVariant.DataType != readVariant.DataType ){
                            collector.Error( this.TestName, conditionIdString, localTestCase, this.States.Failed,
                                "Read variant has different datatypes Event [" + eventVariant.DataType + 
                                "] Read [" + readVariant.DataType + "]" );
                        }else if ( eventVariant.DataType > 0 ){
                            if ( !eventVariant.equals( readVariant ) ){
                                collector.Error( this.TestName, conditionIdString, localTestCase, this.States.Failed,
                                    "Read variant has different Value Event [" + 
                                    eventVariant.toString() + "] Read [" + readVariant.toString() + "]" );
                            }
                        }
                    }

                    if ( localTestCase.State == this.States.DeviceRead ){
                        localTestCase.State = this.States.Complete;
                        localTestCase.TestCase.TestsPassed++;
                        collector.TestCompleted( conditionId, this.TestName );
                    }
                }else{
                    collector.AddMessage( localTestCase.TestCase, collector.Categories.Activity,
                        conditionIdString + " Device Read complete, waiting to process incoming event" );
                }
            }
        }else{
            collector.AddMessage( testCase, collector.Categories.Activity, conditionId + " Does not have an instance" );
            testCase.TestsSkipped++;
            collector.TestCompleted( conditionId, this.TestName );
        }
    }

    this.TestFields = function( prefix, eventFields, localTestCase, collector, maps ){
        var alarmUtilities = collector.GetAlarmTester().GetAlarmUtilities();

        maps.Optional.Iterate( function( fieldName, selectField, args ) {
            var errorMessage = alarmUtilities.TestMandatoryProperty( fieldName, 
                eventFields, collector.AlarmThreadHolder.SelectFields, 
                maps.Mandatory, maps.Optional );
            if ( errorMessage.length > 0 ){
                collector.Error( args.ThisTest.TestName, localTestCase.ConditionIdString, 
                    localTestCase, args.ThisTest.States.Failed, prefix + " " + errorMessage );
            }
        }, { ThisTest: this } );

    }

    this.GetInstance = function ( eventFields, testCase, collector ) {

        var instance = null;

        var alarmTypes = collector.GetAlarmTester().GetSupportedAlarmTypes();

        var eventType = eventFields[ collector.EventTypeIndex ];

        var alarmType = alarmTypes.Get( eventType.toString() );
        var conditionIdString = collector.GetConditionId( eventFields ).toString();

        if ( isDefined( alarmType ) ) {
            if ( isDefined( alarmType.Instances ) ) {
                instance = alarmType.Instances.Get( conditionIdString );
            }
        } else {
            collector.AddMessage( testCase, collector.Categories.Error, conditionIdString + " Unable to find alarmType " + eventType );
            testCase.TestsFailed++;
        }

        return instance;
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
        Test.Execute( { Procedure: Test_002 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_002 } );
    }
}

