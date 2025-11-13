include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/AlarmsAndConditions/AlarmUtilities.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

CUVariables.Shelve = new Object();

CUVariables.Shelve.AlarmConditionType = new UaNodeId( Identifier.AlarmConditionType );
CUVariables.Shelve.AlarmConditionTypeString = CUVariables.Shelve.AlarmConditionType.toString();
CUVariables.Shelve.ShelvingState = new UaNodeId( Identifier.AlarmConditionType_ShelvingState );
CUVariables.Shelve.ShelvingStateString = CUVariables.Shelve.ShelvingState.toString();

CUVariables.Shelve.MaxTimeShelved = new UaNodeId( Identifier.AlarmConditionType_MaxTimeShelved );
CUVariables.Shelve.MaxTimeShelvedString = CUVariables.Shelve.MaxTimeShelved.toString();
CUVariables.Shelve.SuppressedOrShelved = new UaNodeId( Identifier.AlarmConditionType_SuppressedOrShelved );
CUVariables.Shelve.SuppressedOrShelvedString = CUVariables.Shelve.SuppressedOrShelved.toString();
CUVariables.Shelve.MaxTimeShelvedSupported = false;
CUVariables.Shelve.ShelvingStateSupported = false;
CUVariables.Shelve.OneShotShelveMethod = new UaNodeId( Identifier.ShelvedStateMachineType_OneShotShelve );
CUVariables.Shelve.TimedShelveMethod = new UaNodeId( Identifier.ShelvedStateMachineType_TimedShelve );
CUVariables.Shelve.UnshelveMethod = new UaNodeId( Identifier.ShelvedStateMachineType_Unshelve );
CUVariables.Shelve.OneShotShelved = new UaNodeId( Identifier.ShelvedStateMachineType_OneShotShelved );
CUVariables.Shelve.TimedShelved = new UaNodeId( Identifier.ShelvedStateMachineType_TimedShelved );
CUVariables.Shelve.Unshelved = new UaNodeId( Identifier.ShelvedStateMachineType_Unshelved );

CUVariables.Shelve.RegularIntervalAlarmMap = new KeyPairCollection();


CUVariables.Shelve.CreateExtraFields = function () {

    var selectFieldsMap = new KeyPairCollection();
    var mandatory = false;
    var startIndexObject = new Object();
    startIndexObject.startIndex = 0;


    var alarmUtilities = new AlarmUtilities();
    alarmUtilities.CreateSelectFieldsMap(
        CUVariables.Shelve.ShelvingStateString, selectFieldsMap, mandatory, startIndexObject );

    // The selectFieldsMap needs modification at this point, 
    // need a ShelvingState on the browsePath, and key
    var modifiedMap = new KeyPairCollection();
    selectFieldsMap.Iterate( function ( key, entry, args ) {
        var browsePaths = entry.BrowsePaths;
        browsePaths.unshift( "ShelvingState" );
        args.ModifiedMap.Set( "ShelvingState." + key, entry );
    }, { ModifiedMap: modifiedMap } );

    CUVariables.Shelve.ShelvingFields = modifiedMap;

    return modifiedMap;
}

CUVariables.Shelve.AlarmSupportsShelving = function ( eventFields, collector ) {
    var supportsShelving = false;
    var currentState = collector.GetSelectField( eventFields, "ShelvingState.CurrentState" );
    if ( currentState.DataType != 0 ) {
        //        print( collector.GetConditionId( eventFields ).toString() + " Supports Shelving" );
        supportsShelving = true;
    }

    return supportsShelving;
}

CUVariables.Shelve.AlarmIsShelved = function ( eventFields, collector ) {
    var isShelved = false;

    var currentState = collector.GetSelectField( eventFields, "ShelvingState.CurrentState" );
    var currentStateId = collector.GetSelectField( eventFields, "ShelvingState.CurrentState.Id" );

    var oneShot = false;
    var timed = false;
    if ( currentStateId.DataType != 0 ) {
        var currentStateNodeId = currentStateId.toNodeId();
        if ( !currentStateNodeId.equals( CUVariables.Shelve.Unshelved ) ) {
            // Overkill, but verifying
            if ( currentStateNodeId.equals( CUVariables.Shelve.OneShotShelved ) ) {
                oneShot = true;
            } else if ( currentStateNodeId.equals( CUVariables.Shelve.TimedShelved ) ) {
                timed = true;
            } else {
                addError( "Unknown Shelving State value" );
                stopCurrentUnit;
            }
        }

        // TODO Can't do this check with my server.
        // Name Verification
        // CUVariables.AlarmTester.GetAlarmUtilities().GetAlarmNameHelper().
        //     GetShelvingStateName( currentState.toLocalizedText(), oneShot, timed );
    }

    if ( oneShot || timed ) {
        isShelved = true;
    }

    return isShelved;
}

CUVariables.Shelve.CallShelve = function ( eventFields, collector, shelveMethod, shelveMethodName, shelveTime ) {

    var conditionId = collector.GetConditionId( eventFields );

    var methodData = CUVariables.Shelve.GetShelveMethod(
        conditionId, shelveMethod, shelveMethodName, shelveTime );

    var result = collector.Call( {
        MethodsToCall: [ methodData ],
        SuppressMessaging: false
    } );

    print( conditionId.toString() + ":" + shelveMethodName + " returned " + result.toString() );
    return result;
}

CUVariables.Shelve.ServerSupportsAuditing = function ( CUVariables ) {
    var alarmUtilities = CUVariables.AlarmCollector.AlarmTester.GetAlarmUtilities();
    return alarmUtilities.ServerSupportsAuditing();
}

CUVariables.Shelve.ValidateShelveStates = function (
    eventFields, collector, localTestCase, expectedState, expectedShelved ) {

    var success = true;

    var currentState = collector.GetSelectField( eventFields, "ShelvingState.CurrentState" );
    var currentStateId = collector.GetSelectField( eventFields, "ShelvingState.CurrentState.Id" );

    CUVariables.Shelve.AlarmIsShelved( eventFields, collector );

    if ( currentStateId.DataType != 0 ) {
        if ( !currentStateId.toNodeId().equals( expectedState ) ) {
            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                localTestCase.ConditionId.toString() + " Has Current State of " + currentState.toString() +
                " (" + currentStateId.toString() + ") " +
                "Expected " + expectedState.toString() );
            success = false;
        }

        if ( !collector.ValidateSuppressedOrShelved( eventFields, expectedShelved ) ) {
            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                localTestCase.ConditionId.toString() +
                " Has Invalid data for ShelvedOrSuppressed, expected " + expectedShelved );
            success = false;
        }
    }

    return success;
}

CUVariables.Shelve.ValidateShelveTransition = function (
    eventFields, collector, localTestCase, expectedTransition ) {

    var success = true;

    var lastTransition = collector.GetSelectField( eventFields, "ShelvingState.LastTransition" );
    var lastTransitionId = collector.GetSelectField( eventFields, "ShelvingState.LastTransition.Id" );

    // Last Transition is optional!
    if ( lastTransitionId.DataType != 0 ) {
        if ( !lastTransitionId.toNodeId().equals( expectedTransition ) ) {
            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                localTestCase.ConditionId.toString() + " Has Last Transition of " + lastTransition.toString() +
                " (" + lastTransitionId.toString() + ") " +
                "Expected " + expectedTransition.toString() );
            success = false;
        }
    } else {
        addWarning( "ValidateShelveTransition for " + localTestCase.ConditionId.toString() +
            " does not have optional component LastTransition" );
    }

    return success;
}

CUVariables.Shelve.GetMaximumShelveTime = function (
    eventFields, collector, localTestCase ) {

    var maxTime = Number.MAX_VALUE;
    var maxTimeShelved = collector.GetSelectField( eventFields, "MaxTimeShelved" );

    if ( collector.ValidateDataType( maxTimeShelved, BuiltInType.Double ) ) {
        maxTime = maxTimeShelved.toDouble();
    } else if ( maxTimeShelved.DataType != 0 ) {
        collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
            collector.GetConditionId( eventFields ) + " Invalid datatype for MaxTimeShelved, Expecting " +
            Identifier.Duration + " Actual " + maxTimeShelved.DataType );
    }

    if ( isDefined( localTestCase.TimedShelveTime ) && localTestCase.TimedShelveTime > 0 ) {
        if ( localTestCase.TimedShelveTime < maxTime ) {
            maxTime = localTestCase.TimedShelveTime;
        }
    }

    return maxTime;
}


CUVariables.Shelve.ValidateImmediateUnshelveTime = function (
    eventFields, collector, localTestCase ) {

    // This only tests the immediate update time, so the expected time is the max time.

    var maxTime = CUVariables.Shelve.GetMaximumShelveTime( eventFields, collector, localTestCase );
    return CUVariables.Shelve.ValidateUnshelveTime(
        eventFields, collector, localTestCase, maxTime );
}

CUVariables.Shelve.ValidateUnshelveTime = function (
    eventFields, collector, localTestCase, expectedUnshelveTime ) {

    var success = false;
    var conditionIdString = collector.GetConditionId( eventFields );
    var unshelveTime = collector.GetSelectField( eventFields, "ShelvingState.UnshelveTime" );

    if ( collector.ValidateDataType( unshelveTime, BuiltInType.Double ) ) {
        var unshelveTimeValue = unshelveTime.toDouble();

        var difference = Math.abs( unshelveTimeValue - expectedUnshelveTime );
        var tolerance = 100;
        print( conditionIdString + " Checking UnshelveTime, Expecting within " +
            tolerance + " ms of expected " + expectedUnshelveTime + " Actual " + unshelveTimeValue );

        if ( difference < tolerance ) {
            success = true;
        } else {
            collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
                conditionIdString + " Has Invalid UnshelveTime, Expecting within " +
                tolerance + " ms of expected " + expectedUnshelveTime + " Actual " + unshelveTimeValue );
        }
    } else {
        collector.AddMessage( localTestCase.TestCase, collector.Categories.Error,
            conditionIdString + " Has Invalid datatype for UnshelveTime, Expecting " +
            Identifier.Duration + " Actual " + unshelveTime.DataType );
    }

    return success;
}

CUVariables.Shelve.InitializeTestCase = function ( conditionId, eventType, testCase ) {
    return {
        ConditionId: conditionId,
        EventType: eventType,
        State: "Initial",
        TestCase: testCase,
        TimeShelved: null,
        ExpectedShelvingState: null,
        ShelveTime: null,
        MaxTimeShelved: null,
        TimedShelveTime: null,
        RequiresUnshelve: false
    };
}

CUVariables.Shelve.ShouldBeShelved = function ( eventFields, collector, localTestCase ) {
    // Method should only be called  when Shelved is expected to be true
    // Method looks for normal exceptions

    var shouldBeShelved = true;

    var timedShelveTime = localTestCase.MaxTimeShelved;
    if ( isDefined( localTestCase.TimedShelveTime ) &&
        localTestCase.TimedShelveTime < localTestCase.MaxTimeShelved ) {
        timedShelveTime = localTestCase.TimedShelveTime;
    }

    var expiryTime = new UaDateTime( localTestCase.ShelveTime );
    expiryTime.addMilliSeconds( timedShelveTime );

    if ( UaDateTime.utcNow() > expiryTime ) {
        shouldBeShelved = false;
    } else if ( localTestCase.ExpectedShelvingState.equals( CUVariables.Shelve.OneShotShelved ) ) {
        if ( !collector.IsActive( eventFields ) ) {
            shouldBeShelved = false;
        }
    }

    return shouldBeShelved;
}

CUVariables.Shelve.UnshelveAll = function ( testCases ) {

    var methods = [];
    var keys = testCases.Keys();
    for ( var index = 0; index < keys.length; index++ ) {
        var key = keys[ index ];
        var testCase = testCases.Get( key );
        if ( testCase.RequiresUnshelve ) {
            print( "UnshelveAll needs to unshelve " + testCase.ConditionId.toString() );
            methods.push( CUVariables.Shelve.GetShelveMethod( testCase.ConditionId,
                CUVariables.Shelve.UnshelveMethod, "Unshelve" ) );
            testCase.RequiresUnshelve = false;
        }
    }

    if ( methods.length > 0 ) {
        CUVariables.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper.Execute( {
            MethodsToCall: methods,
            SuppressMessaging: true
        } );
    }
}

CUVariables.Shelve.GetShelveMethod = function ( conditionId, shelveMethod, shelveMethodName, shelveTime ) {

    var inputArguments = [];
    var timedShelve = false;
    if ( shelveMethod.equals( CUVariables.Shelve.TimedShelveMethod ) ) {
        timedShelve = true;
        var shelveTimeVariant = new UaVariant();
        shelveTimeVariant.setDouble( shelveTime );
        inputArguments.push( shelveTimeVariant );
    }

    var debug = false;
    if ( debug ) {

        var ns = conditionId.NamespaceIndex;
        var nodeString = conditionId.getIdentifierString();
        var newNodeString = nodeString + ".ShelvingState";

        var objectId = new UaNodeId( newNodeString, ns );
        var methodId = new UaNodeId( newNodeString + "." + shelveMethodName, ns );

        print( conditionId.toString() + " calling shelve method " + shelveMethodName + ":" + shelveMethod.toString() +
            " object id " + objectId.toString() + " methodId " + methodId.toString() );

        return {
            ObjectId: objectId,
            MethodId: methodId,
            InputArguments: inputArguments
        };
    } else {

        print( conditionId.toString() + " calling shelve method " + shelveMethodName + ":" + shelveMethod.toString() );

        return {
            ObjectId: conditionId,
            MethodId: shelveMethod,
            InputArguments: inputArguments
        };
    }
}

CUVariables.Shelve.GetMaxTimeShelved = function ( eventFields, collector ) {
    var maxTimeShelved = collector.GetSelectField( eventFields, "MaxTimeShelved" );

    var maxTime = Number.MAX_VALUE;
    if ( collector.ValidateDataType( maxTimeShelved, BuiltInType.Double ) ) {
        maxTime = maxTimeShelved.toDouble();
    }

    return maxTime;
}

CUVariables.Shelve.CanRunAfterMaxTimeShelved = function ( eventFields, collector ) {
    var canRun = false;

    var maxTime = CUVariables.Shelve.GetMaxTimeShelved( eventFields, collector );
    var processingTime = collector.GetMaximumTestTime();

    if ( maxTime < processingTime ) {
        canRun = true;
    }

    return canRun;
}

CUVariables.Shelve.CanRunTimeShelved = function ( eventFields, collector, desiredTime ) {
    var canRun = false;

    var maxTime = CUVariables.Shelve.GetMaxTimeShelved( eventFields, collector );

    if ( desiredTime < maxTime ) {
        canRun = true;
    }

    return canRun;
}

CUVariables.Shelve.GetAverageInterval = function ( testName, eventFields, collector, localTestCase ) {
    var conditionId = collector.GetConditionId( eventFields );
    var conditionIdString = conditionId.toString();
    var isActive = collector.IsActive( eventFields );

    if ( !CUVariables.Shelve.RegularIntervalAlarmMap.Contains( conditionIdString ) ) {
        var details = {
            ActiveStateChangeTimes: [],
            LastActiveState: null,
            LastEventId: null,
            AverageInterval: -1
        };
        CUVariables.Shelve.RegularIntervalAlarmMap.Set( conditionIdString, details );
    }

    var details = CUVariables.Shelve.RegularIntervalAlarmMap.Get( conditionIdString );

    if ( details.AverageInterval < 0 ) {
        var eventId = eventFields[ collector.EventIdIndex ].toByteString();
        var processEvent = true;
        if ( isDefined( details.LastEventId ) && details.LastEventId.equals( eventId ) ) {
            processEvent = false;
        }

        if ( processEvent ) {
            if ( !isDefined( details.LastActiveState ) ) {
                details.LastActiveState = isActive;
            } else {
                if ( isActive != details.LastActiveState ) {
                    details.LastActiveState = isActive;
                } else {
                    processEvent = false;
                }
            }
        }

        if ( processEvent ) {
            details.ActiveStateChangeTimes.push( collector.GetSelectField( eventFields, "Time" ) );
            details.LastEventId = eventId;

            var minimumCountForAnalyze = 5;
            if ( isActive && details.ActiveStateChangeTimes.length >= minimumCountForAnalyze ) {
                // Is RegularInterval
                var intervals = [];
                var total = 0;
                var lastIndex = details.ActiveStateChangeTimes.length - 1;
                for ( var index = 0; index < lastIndex; index++ ) {
                    var interval = details.ActiveStateChangeTimes[ index ].toDateTime().msecsTo(
                        details.ActiveStateChangeTimes[ index + 1 ].toDateTime() );
                    intervals.push( interval );
                    total += interval;
                }
                var average = total / intervals.length;
                var regular = true;
                var differenceTolerance = 100;

                for ( var index = 0; index < intervals.length; index++ ) {
                    var diff = Math.abs( average - intervals[ index ] );
                    print( conditionIdString + " Interval " + index + " of " + intervals[ index ] + " has a difference of " + diff + " from the average of " + average );
                    if ( diff > differenceTolerance ) {
                        print( conditionIdString + " does not have a regular interval" );
                        localTestCase.State = "Skipped";
                        collector.TestCompleted( conditionId, testName );
                        localTestCase.TestCase.TestsSkipped++;
                        regular = false;
                        break;
                    }
                }

                if ( regular ) {
                    details.AverageInterval = average;
                } else {
                    // Not a regular Interval
                    details.AverageInterval = 0;
                }
            }
        }
    }

    return details.AverageInterval;
}


// Autorun test cases
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_004.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_005.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_006.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_007.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_008.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_009.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Test_010.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Err_001.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Err_002.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Err_003.js" );
include( "./maintree/Alarms and Conditions/A and C Shelve/Test Cases/Err_004.js" );

var builder = new BuildCacheMapService();
builder.Execute();

if ( !Test.Connect() ) {
    addError( "Unable to connect to Server. Aborting tests." );
    stopCurrentUnit();
} else {

    CUVariables.AutoTestMap = new KeyPairCollection();
    CUVariables.AutoTestMap.Set( "Test_001", new Test_001() );
    CUVariables.AutoTestMap.Set( "Test_002", new Test_002() );
    CUVariables.AutoTestMap.Set( "Test_003", new Test_003() );
    CUVariables.AutoTestMap.Set( "Test_004", new Test_004() );
    CUVariables.AutoTestMap.Set( "Test_005", new Test_005() );
    CUVariables.AutoTestMap.Set( "Test_006", new Test_006() );
    CUVariables.AutoTestMap.Set( "Test_007", new Test_007() );
    CUVariables.AutoTestMap.Set( "Test_008", new Test_008() );
    CUVariables.AutoTestMap.Set( "Test_009", new Test_009() );
    CUVariables.AutoTestMap.Set( "Test_010", new Test_010() );
    CUVariables.AutoTestMap.Set( "Err_001", new Err_001() );
    CUVariables.AutoTestMap.Set( "Err_002", new Err_002() );
    CUVariables.AutoTestMap.Set( "Err_003", new Err_003() );
    CUVariables.AutoTestMap.Set( "Err_004", new Err_004() );

    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );

    CUVariables.PrintResults = [
        CUVariables.AlarmCollector.Categories.Error,
        CUVariables.AlarmCollector.Categories.Activity,
    ];

    var alarmConditionType = CUVariables.AlarmTypes.Get( CUVariables.Shelve.AlarmConditionTypeString );
    if ( isDefined( alarmConditionType ) ) {
        if ( isDefined( alarmConditionType.ReferenceDetails.Variable ) ) {
            var maxTimeShelved = alarmConditionType.ReferenceDetails.Variable.Get(
                CUVariables.Shelve.MaxTimeShelvedString );
            if ( isDefined( maxTimeShelved ) ) {
                CUVariables.Shelve.MaxTimeShelvedSupported = true;
            }
        }
        if ( isDefined( alarmConditionType.ReferenceDetails.Object ) ) {
            var shelvingState = alarmConditionType.ReferenceDetails.Object.Get(
                CUVariables.Shelve.ShelvingStateString );
            if ( isDefined( shelvingState ) ) {
                CUVariables.Shelve.ShelvingStateSupported = true;
            }
        }
    }

    if ( !CUVariables.Shelve.ShelvingStateSupported ) {
        addWarning( "Shelving State not supported" );
        stopCurrentUnit();
    }
}
