/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Instances/Level/Test Cases/Test_006.js

    Description:    
        Verify the Limits and other settings

    Test Requirements:
        requires limit alarm, skip if not provided

    Expectation:
       The extra properties all expose the same value as the alarm

       This is so similar to Test 2.

    
*/

function Test_006 () {

    this.TestName = "Test_006";
    this.TypesToTest = null;
    this.ExclusiveTypes = null;
    this.NonExclusiveTypes = null;

    this.Initialize = function ( collector ) {
        var alarmTester = collector.GetAlarmTester();

        var alarmTypes = alarmTester.GetSupportedAlarmTypes();

        var exclusiveAlarms = [];
        var nonExclusiveAlarms = [];

        exclusiveAlarms.push( new UaNodeId( Identifier.ExclusiveLimitAlarmType ).toString() );
        exclusiveAlarms.push( new UaNodeId( Identifier.ExclusiveLevelAlarmType ).toString() );
        exclusiveAlarms.push( new UaNodeId( Identifier.ExclusiveDeviationAlarmType ).toString() );
        exclusiveAlarms.push( new UaNodeId( Identifier.ExclusiveRateOfChangeAlarmType ).toString() );
        nonExclusiveAlarms.push( new UaNodeId( Identifier.NonExclusiveLimitAlarmType ).toString() );
        nonExclusiveAlarms.push( new UaNodeId( Identifier.NonExclusiveLevelAlarmType ).toString() );
        nonExclusiveAlarms.push( new UaNodeId( Identifier.NonExclusiveDeviationAlarmType ).toString() );
        nonExclusiveAlarms.push( new UaNodeId( Identifier.NonExclusiveRateOfChangeAlarmType ).toString() );

        var typesToNotIgnore = new KeyPairCollection();
        var exclusiveAlarmMap = new KeyPairCollection();
        var nonExclusiveAlarmMap = new KeyPairCollection();

        alarmTypes.Iterate( function ( alarmTypeString, alarmType ) {

            var found = false;
            for ( var index = 0; index < exclusiveAlarms.length; index++ ) {
                if ( alarmType.SpecAlarmTypeId == exclusiveAlarms[ index ] ) {
                    typesToNotIgnore.Set( alarmTypeString, alarmType );
                    exclusiveAlarmMap.Set( alarmTypeString, alarmTypeString );
                    found = true;
                    break;
                }
            }

            if ( !found ) {
                for ( var index = 0; index < nonExclusiveAlarms.length; index++ ) {
                    if ( alarmType.SpecAlarmTypeId == nonExclusiveAlarms[ index ] ) {
                        typesToNotIgnore.Set( alarmTypeString, alarmType );
                        nonExclusiveAlarmMap.Set( alarmTypeString, alarmTypeString );
                        found = true;
                        break;
                    }
                }
            }
        } );

        this.TypesToTest = typesToNotIgnore;
        this.ExclusiveTypes = exclusiveAlarmMap;
        this.NonExclusiveTypes = nonExclusiveAlarmMap;

        collector.AddIgnoreSkips( this.TypesToTest.Keys(), this.TestName );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        var eventType = eventFields[ collector.EventTypeIndex ].toString();

        print( this.TestName + " eventType " + eventType );

        var alarmType = this.TypesToTest.Get( eventType );

        if ( !isDefined( alarmType ) ) {
            print( this.TestName + " eventType " + eventType + " not supported" );
            // Not a limit type
            return;
        }

        var activeState = collector.GetBooleanValue( eventFields, "ActiveState.Id" );
        if ( !activeState ){
            return;
        }

        print( this.TestName + " eventType " + eventType + " supported, spec type " + alarmType.SpecAlarmTypeId );

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( isDefined( alarmType.Instances ) ) {
            var instance = alarmType.Instances.Get( conditionIdString );
            if ( isDefined( instance ) ) {
                var conditionIdString = collector.GetConditionId( eventFields ).toString();

                var alarmUtilities = collector.GetAlarmTester().GetAlarmUtilities();
                var modelMapHelper = alarmUtilities.GetModelMapHelper();
                var nodeSetUtility = alarmUtilities.GetNodeSetUtility();
                var instanceMap = modelMapHelper.BuildAlarmReferenceDescriptionMap( instance );

                var selectFields = collector.AlarmThreadHolder.SelectFields;

                var readItems = new KeyPairCollection();
                var readArray = [];

                var success = true;
                var foundLimit = false;
                var foundState = false;
                // needs to be a limit
                // Exclusive needs currentstate
                // NOn exclusive needs states that are comparable

                selectFields.Iterate( function ( propertyName, selectField ) {
                    var eventField = eventFields[ selectField.Index ];
                    if ( eventField.DataType != 0 ) {
                        var instanceReference = instanceMap.Get( propertyName );
                        if ( isDefined( instanceReference ) ) {
                            var item = MonitoredItem.fromNodeIds( instanceReference.NodeId.NodeId )[ 0 ];
                            readArray.push( item );
                            readItems.Set( propertyName, { Item: item, SelectField: selectField, InstanceReference: instanceReference } );
                        } else {
                            collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                                " Unable to find property " + propertyName + " in the alarm instance map" );
                            testCase.TestsFailed++;
                            success = false;
                        }
                    }
                } );



                if ( ReadHelper.Execute( { NodesToRead: readArray } ) ) {

                    var eventIdEvent = eventFields[ collector.EventIdIndex ];
                    var timeEvent = collector.GetSelectField( eventFields, "Time" );
                    var eventIdInstance = readItems.Get( "EventId" );
                    var timeInstance = readItems.Get( "Time" );

                    if ( eventIdEvent.equals( eventIdInstance.Item.Value.Value ) &&
                        timeEvent.equals( timeInstance.Item.Value.Value ) ) {
                        readItems.Iterate( function ( property, readItem, args ) {
                            // Validate that the event and the instance values are the same
                            var eventFieldVariant = collector.GetSelectField( eventFields, property );
                            var instanceValue = readItem.Item.Value.Value;
                            if ( eventFieldVariant.DataType == instanceValue.DataType ) {
                                if ( instanceValue.DataType != 0 ) {
                                    var expectedDataType = nodeSetUtility.GetExpectedDataTypeIdentifier(
                                        readItem.SelectField.Reference );
                                    if ( instanceValue.DataType == expectedDataType ) {
                                        if ( !eventFieldVariant.equals( instanceValue ) ) {
                                            collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                                                ":" + property + " event value [" + eventFieldVariant.toString() +
                                                "] and instance value [" + instanceValue.toString() + "] do not match" );
                                            testCase.TestsFailed++;
                                            success = false;
                                        } else {
                                            if ( args.This.FoundLimit( property ) ) {
                                                foundLimit = true;
                                            }
                                            if ( args.This.FoundState( property, eventType ) ) {
                                                foundState = true;
                                            }
                                        }
                                    } else {
                                        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                                            ":" + property + " event value datatype [" + instanceValue.DataType +
                                            "] and spec datatype [" + expectedDataType + "] do not match" );
                                        testCase.TestsFailed++;
                                        success = false;
                                    }
                                }
                            } else {
                                collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                                    ":" + property + " event value datatype [" + eventFieldVariant.DataType +
                                    "] and instance value datatype [" + instanceValue.DataType + "] do not match" );
                                testCase.TestsFailed++;
                                success = false;
                            }
                        }, { This: this } );

                        if ( !foundLimit ) {
                            collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                                " does not have a limit, should have at least one" );
                            testCase.TestsFailed++;
                            success = false;
                        }

                        if ( !foundState ) {
                            var specific = " at least one limit state";
                            if ( this.IsExclusive( eventType ) ) {
                                specific = " a LimitState.CurrentState";
                            }
                            collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
                                " does not have a State, should have " + specific );
                            testCase.TestsFailed++;
                            success = false;
                        }

                        if ( success ) {
                            collector.AddMessage( testCase, collector.Categories.Activity,
                                conditionIdString + " Test Passed" );
                            testCase.TestsPassed++;
                        }
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Activity,
                            "Ignoring " + conditionIdString + " event time " + timeEvent.toString() +
                            " instance has time of " + timeInstance.Item.Value.Value.toString() );
                        testCase.TestsSkipped++;
                    }
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error, conditionId + " Unable to read alarm instance" );
                    testCase.TestsFailed++;
                }
            } else {
                testCase.TestsSkipped++;
                collector.AddMessage( testCase, collector.Categories.Activity,
                    conditionIdString + " alarm type " + alarmType.Name + " does not have an instance, skipping" );
            }
        } else {
            testCase.TestsSkipped++;
            collector.AddMessage( testCase, collector.Categories.Activity,
                conditionIdString + " alarm type " + alarmType.Name + " does not have any instances, skipping" );
        }
    }

    this.IsExclusive = function ( eventType ) {
        var isExclusive = false;

        var potential = this.ExclusiveTypes.Get( eventType );
        if ( isDefined( potential ) ) {
            isExclusive = true;
        }

        return isExclusive;
    }

    this.FoundLimit = function ( propertyName ) {

        var found = false;

        if ( propertyName == "HighHighLimit" ||
            propertyName == "HighLimit" ||
            propertyName == "LowLimit" ||
            propertyName == "LowLowLimit" ) {
            found = true;
        }

        return found;
    }

    this.FoundState = function ( propertyName, eventType ) {
        var found = false;

        if ( this.IsExclusive( eventType ) ) {
            if ( propertyName == "LimitState.CurrentState" ) {
                found = true;
            }
        } else {
            if ( propertyName == "HighHighState" ||
                propertyName == "HighState" ||
                propertyName == "LowState" ||
                propertyName == "LowLowState" ) {
                found = true;
            }
        }

        return found;
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
        Test.Execute( { Procedure: Test_006 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_006 } );
    }
}



