include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

// Functions common to this conformance unit
CUVariables.Confirm = new Object();
            
CUVariables.Confirm.MethodId = new UaNodeId( Identifier.AcknowledgeableConditionType_Confirm );

CUVariables.Confirm.CanRunTest = function ( testName, eventFields, testCase, collector ) {
    var canRunTest = false;
    var conditionId = collector.GetConditionId( eventFields );

    if ( collector.CanRunTest( conditionId, testName ) ) {
        var includeSubTypes = true;
        if ( collector.IsAcknowledgeable( eventFields, includeSubTypes ) ) {
            var confirmId = collector.GetSelectField( eventFields, "ConfirmedState.Id" );
            if ( confirmId.DataType != 0 ) {
                canRunTest = true;
            }else{
                collector.AddMessage( testCase, collector.Categories.Activity, conditionId.toString() +
                    " CanRunTest: Unable to get ConfirmedState");
                testCase.TestsSkipped++;
                collector.TestCompleted( conditionId, testName);
            }
        } else {
            collector.AddMessage( testCase, collector.Categories.Error, conditionId.toString() +
            " CanRunTest: Skipping per IsAcknowledgeable");
            testCase.TestsSkipped++;
            collector.TestCompleted( conditionId, testName);
        }
    }

    return canRunTest;
}

CUVariables.Confirm.Validate = function ( eventFields, testCase, collector, expectedComment, expectededconfirmedState ) {
    var success = true;

    var conditionId = collector.GetConditionId( eventFields );

    if ( !collector.ValidateComment( eventFields, expectedComment, testCase ) ) {
        success = false;
    }

    if ( !collector.ValidateTwoState( eventFields, "ConfirmedState", expectededconfirmedState ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionId.toString() +
            " Unexpected ConfirmedState Expected: " + expectededconfirmedState );
        success = false;
    }

    if ( !CUVariables.Confirm.ReadInstance( eventFields, testCase, collector,
        expectedComment, expectededconfirmedState ) ) {
        success = false;
    }

    return success;
}

CUVariables.Confirm.ReadInstance = function ( eventFields, testCase, collector,
    expectedComment, expectedconfirmedState ) {

    var conditionIdString = collector.GetConditionId( eventFields );
    var eventId = eventFields[ collector.EventIdIndex ].toByteString();
    
    var timer = new PerformanceTimer();

    var modelHelper = CUVariables.AlarmTester.GetAlarmUtilities().GetModelMapHelper();
    var modelMap = modelHelper.GetModelMap();
    var conditionInstance = modelMap.Get( conditionIdString );

    if ( !isDefined( conditionInstance ) ) {
        // Normal
        return true;
    }

    var ackedStateIndex = 0;
    var confirmedStateIndex = 1;
    var commentIndex = 2;
    var messageIndex = 3;
    var eventIdIndex = 4;

    var searchDefinitions = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
            IsForward: true,
            DisplayName: UaLocalizedText.New( { Text: "AckedState", Locale: "" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
            IsForward: true,
            DisplayName: UaLocalizedText.New( { Text: "ConfirmedState", Locale: "" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
            IsForward: true,
            DisplayName: UaLocalizedText.New( { Text: "Comment", Locale: "" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Message" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "EventId" } )
        }
    ];

    modelHelper.FindReferences( conditionInstance.ReferenceDescriptions, searchDefinitions );

    var ackedStateNodeId = CUVariables.Confirm.GetReferenceNodeId( conditionInstance, searchDefinitions[ 0 ] );
    var confirmedStateNodeId = CUVariables.Confirm.GetReferenceNodeId( conditionInstance, searchDefinitions[ 1 ] );
    var commentNodeId = CUVariables.Confirm.GetReferenceNodeId( conditionInstance, searchDefinitions[ 2 ] );
    var messageNodeId = CUVariables.Confirm.GetReferenceNodeId( conditionInstance, searchDefinitions[ 3 ] );
    var eventIdNodeId = CUVariables.Confirm.GetReferenceNodeId( conditionInstance, searchDefinitions[ 4 ] );

    var ackedStateIdNodeId = CUVariables.Confirm.GetIdNodeId( ackedStateNodeId );
    if ( !isDefined( ackedStateIdNodeId ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to find AckedState.Id NodeId" );
        testCase.TestsFailed++;
        return false;
    }

    var confirmedStateIdNodeId = CUVariables.Confirm.GetIdNodeId( confirmedStateNodeId );
    if ( !isDefined( confirmedStateIdNodeId ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to find ConfirmedState.Id NodeId" );
        testCase.TestsFailed++;
        return false;
    }

    if ( !isDefined( commentNodeId ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to find Comment NodeId" );
        testCase.TestsFailed++;
        return false;
    }

    var items = MonitoredItem.fromNodeIds( [ 
        new UaNodeId( ackedStateIdNodeId ), 
        new UaNodeId( confirmedStateIdNodeId ), 
        new UaNodeId( commentNodeId ), 
        new UaNodeId( messageNodeId ), 
        new UaNodeId( eventIdNodeId ) ] );

    if ( !ReadHelper.Execute( { NodesToRead: items } ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to Read Comment and confirmedState" );
        testCase.TestsFailed++;
        return false;
    }

    var readEventId = null;
    if ( isDefined( items[ eventIdIndex ].Value ) && isDefined( items[ eventIdIndex ].Value.Value ) ){
        readEventId = items[ eventIdIndex ].Value.Value.toByteString();
        if ( !readEventId.equals( eventId ) ){
            collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                " Has changed.  Unable to do test Field eventId = " + eventId.toString() + " readEventId " + readEventId.toString() );
            testCase.TestsSkipped++;
            return true;
        }
    } 

    print( conditionIdString + " Message " + items[2].Value.Value.toString() );

    var readComment = null;
    var readAckedStateId = null;
    var readConfirmedStateId = null;

    if ( isDefined( items[ ackedStateIndex ].Value.Value ) ) {
        readAckedStateId = items[ ackedStateIndex ].Value.Value.toBoolean();
    }

    if ( isDefined( items[ confirmedStateIndex ].Value.Value ) ) {
        readConfirmedStateId = items[ confirmedStateIndex ].Value.Value.toBoolean();
    }

    if ( isDefined( items[ commentIndex ].Value.Value ) ) {
        readComment = items[ commentIndex ].Value.Value.toLocalizedText();
    }

    if ( !isDefined( readComment ) || !isDefined( readConfirmedStateId ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to Retrieve values for Comment and confirmedState" );
        testCase.TestsFailed++;
        return false;
    }

    var message = "";
    if ( isDefined( items[ messageIndex ].Value.Value ) ) {
        message = " Message = " + items[ messageIndex ].Value.Value.toString();
    }

    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
        " Validate: EventId = " + readEventId.toString() + 
        " ackedstate = " + readAckedStateId + 
        " confirmedState = " + readConfirmedStateId + 
        " comment = " + readComment.Text + 
        message );



    if ( readComment.Text != expectedComment ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unexpected read value Comment Expected: " + expectedComment + " Actual: " + readComment.Text );
        testCase.TestsFailed++;
        return false;
    }

    if ( readConfirmedStateId != expectedconfirmedState ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unexpected read value confirmedState Expected: " + expectedconfirmedState + " Actual: " + readConfirmedStateId );
        testCase.TestsFailed++;
        return false;
    }

    collector.AddMessage( testCase, collector.Categories.Activity,
        "Time to read alarm Instance = " + timer.TakeReading() );

    return true;
}

CUVariables.Confirm.GetIdNodeId = function( twoStateNodeId ){
    var idNodeId = null;

    var modelHelper = CUVariables.AlarmTester.GetAlarmUtilities().GetModelMapHelper();
    var modelMap = modelHelper.GetModelMap();

    if ( isDefined( twoStateNodeId ) ) {
        var instance = modelMap.Get( twoStateNodeId.toString() );
        if ( isDefined( instance ) ) {

            var idSearch = [
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    IsForward: true,
                    DisplayName: UaLocalizedText.New( { Text: "Id", Locale: "" } )
                }
            ];
            modelHelper.FindReferences( instance.ReferenceDescriptions, idSearch );
            var stateIdNodeId = CUVariables.Confirm.GetReferenceNodeId( instance, idSearch[ 0 ] );
            if ( isDefined( stateIdNodeId ) ) {
                idNodeId = stateIdNodeId;
            }
        }
    }

    return idNodeId; 
}


CUVariables.Confirm.GetReferenceNodeId = function ( instance, searchDefinition ) {
    if ( isDefined( searchDefinition.ReferenceIndex ) ) {
        return instance.ReferenceDescriptions[ searchDefinition.ReferenceIndex ].NodeId.NodeId;
    }
}

CUVariables.Confirm.IgnoreConfirmByTime = function ( eventFields, collector, operationName, operationTime ) {
    var ignore = false;
    var eventTime = collector.GetSelectField( eventFields, "Time" );
    var time = eventTime.toDateTime();
    if ( isDefined( time ) ) {
        if ( time < operationTime ) {
            print( collector.GetConditionId( eventFields ).toString() + 
                " IgnoreConfirmByTime event time " + time.toString() + 
                " " +  operationName + " time " + operationTime.toString() );
                ignore = true;
        }
    }

    return ignore;
}

CUVariables.Confirm.GetRunMultipleTestTime = function( collector ){
    // Set up a timer for a chance to call acknowledge on multiple events
    var MultipleTestTime = UaDateTime.utcNow();
    var maxTestTime = collector.GetMaximumTestTime() * 0.8;
    MultipleTestTime.addMilliSeconds( parseInt( maxTestTime.toString() ) );
    return MultipleTestTime;
}

CUVariables.Confirm.MultipleTest = function ( collector, test ) {
    if ( !test.MultipleTestComplete ) {
        if ( UaDateTime.utcNow() > test.MultipleTestTime ) {

            var keys = test.TestCaseMap.Keys();
            var checkMap = new KeyPairCollection();
            var methods = [];
            for ( var index = 0; index < keys.length; index++ ) {
                var key = keys[ index ];
                var testCase = test.TestCaseMap.Get( key );
                if ( testCase.State == test.States.Completed ) {
                    methods.push( test.CreateMethod( key, testCase, collector ) );
                    checkMap.Set( key, testCase );
                }
            }

            if ( methods.length > 0 ) {
                var callHelper = collector.AlarmThreadHolder.AlarmThread.SessionThread.Helpers.CallHelper;
                callHelper.Execute( {
                    MethodsToCall: methods,
                    SuppressMessaging: true
                } );

                print( test.TestName + " performing multi confirm call for " + methods.length + " events" );


                if ( isDefined( callHelper.Response ) && isDefined( callHelper.Response.Results ) ) {
                    var checkKeys = checkMap.Keys();
                    var results = callHelper.Response.Results;
                    for ( index = 0; index < results.length; index++ ) {
                        var result = results[ index ];
                        if ( !test.CheckBadStatusCode( result.StatusCode ) ) {
                            var key = checkKeys[ index ];
                            var testCase = checkMap.Get( key );
                            collector.AddMessage( testCase, collector.Categories.Error, testCase.ConditionId.toString() +
                                " Unexpected error doing multiple confirm: " + result.toString() );
                            testCase.TestsFailed++;
                        }
                    }
                } else {
                    addError( test.TestName + " Call for multiple Confirmments failed " );
                    stopCurrentUnit();
                }
            } else {
                print( test.TestName + " Received no events to confirm" );
            }

            test.MultipleTestComplete = true;
        }
    }
}

CUVariables.Confirm.ShouldRunConformanceUnit = function(){

    var acknowledgeableConditionType = CUVariables.AlarmCollector.AlarmTester.GetAlarmUtilities().GetModelMap().Get( 
        new UaNodeId( Identifier.AcknowledgeableConditionType ).toString() );

    var confirmMethodObject = acknowledgeableConditionType.ReferenceDetails.Method.Get( 
        CUVariables.Confirm.MethodId.toString() );

    if ( isDefined( confirmMethodObject ) ){
        var confirmedStateObject = acknowledgeableConditionType.ReferenceDetails.Variable.Get( 
            new UaNodeId( Identifier.AcknowledgeableConditionType_ConfirmedState ).toString() );
        
        if( !isDefined( confirmedStateObject ) ){
            addError( "Confirm Method is supported but ConfirmedState not found - Skipping A and C Confirm Conformance Unit");
            stopCurrentUnit();
        }
    }else{
        addWarning( "Confirm Method is not supported - Skipping A and C Confirm Conformance Unit");
        stopCurrentUnit();
    } 
}

CUVariables.Confirm.EventSupportsConfirm = function(collector, eventFields){
    var supportsConfirm = false;
    var confirmedState = collector.GetSelectField(eventFields, "ConfirmedState.Id");
    if ( collector.ValidateDataType(confirmedState, BuiltInType.Boolean)){
        supportsConfirm = true
    }
    return supportsConfirm;
}


// Autorun test cases
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Err_004.js" );
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Err_005.js" );
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Err_006.js" );
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Err_007.js" );
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Err_008.js" );
include( "./maintree/Alarms and Conditions/A and C Confirm/Test Cases/Err_009.js" );

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
    CUVariables.AutoTestMap.Set( "Err_004", new Err_004() );
    CUVariables.AutoTestMap.Set( "Err_005", new Err_005() );
    CUVariables.AutoTestMap.Set( "Err_006", new Err_006() );
    CUVariables.AutoTestMap.Set( "Err_007", new Err_007() );
    CUVariables.AutoTestMap.Set( "Err_008", new Err_008() );
    CUVariables.AutoTestMap.Set( "Err_009", new Err_009() );
    CUVariables.AlarmCollector = new AlarmCollector( CUVariables );
    CUVariables.PrintResults = [
        CUVariables.AlarmCollector.Categories.Error,
        CUVariables.AlarmCollector.Categories.Activity
    ];

    CUVariables.Confirm.ShouldRunConformanceUnit();
}






