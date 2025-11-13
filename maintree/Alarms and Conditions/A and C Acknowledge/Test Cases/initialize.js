include( "./library/Base/safeInvoke.js" );
include( "./library/AlarmsAndConditions/AlarmCollector.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );

var CUVariables = new Object();
CUVariables.Debug = gServerCapabilities.Debug;

// Functions common to this conformance unit
CUVariables.Acknowledge = new Object();

CUVariables.Acknowledge.MethodId = new UaNodeId( Identifier.AcknowledgeableConditionType_Acknowledge );
CUVariables.Acknowledge.AcknowledgeableConditionTypeNodeId = new UaNodeId( Identifier.AcknowledgeableConditionType );

CUVariables.Acknowledge.CanRunTest = function ( testName, eventFields, testCase, collector ) {
    var canRunTest = false;
    var conditionId = collector.GetConditionId( eventFields );

    if ( collector.CanRunTest( conditionId, testName ) ) {
        var includeSubTypes = true;
        if ( collector.IsAcknowledgeable( eventFields, includeSubTypes ) ) {
            canRunTest = true;
        } else {
            testCase.TestsSkipped++;
            collector.TestCompleted( conditionId, testName);
        }
    }

    return canRunTest;
}

CUVariables.Acknowledge.Validate = function ( eventFields, testCase, collector, expectedComment, expectededAckedState ) {
    var success = true;

    var conditionId = collector.GetConditionId( eventFields );

    if ( !collector.ValidateComment( eventFields, expectedComment, testCase ) ) {
        success = false;
    }

    if ( !collector.ValidateTwoState( eventFields, "AckedState", expectededAckedState ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionId.toString() +
            " Unexpected AckedState Expected: " + expectededAckedState );
        success = false;
    }

    if ( !CUVariables.Acknowledge.ReadInstance( eventFields, testCase, collector,
        expectedComment, expectededAckedState ) ) {
        success = false;
    }

    return success;
}

CUVariables.Acknowledge.ReadInstance = function ( eventFields, testCase, collector,
    expectedComment, expectedAckedState ) {

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

    var searchDefinitions = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "AckedState" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Comment" } )
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

    var ackedStateIndex = 0;
    var commentIndex = 1;
    var messageIndex = 2;
    var eventIdIndex = 3;

    modelHelper.FindReferences( conditionInstance.ReferenceDescriptions, searchDefinitions );

    var ackedStateNodeId = CUVariables.Acknowledge.GetReferenceNodeId( conditionInstance, searchDefinitions[ ackedStateIndex ] );
    var commentNodeId = CUVariables.Acknowledge.GetReferenceNodeId( conditionInstance, searchDefinitions[ commentIndex ] );
    var messageNodeId = CUVariables.Acknowledge.GetReferenceNodeId( conditionInstance, searchDefinitions[ messageIndex ] );
    var eventIdNodeId = CUVariables.Acknowledge.GetReferenceNodeId( conditionInstance, searchDefinitions[ eventIdIndex ] );

    if ( !isDefined( commentNodeId ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to find Comment NodeId" );
        testCase.TestsFailed++;
        return false;
    }
    if ( !isDefined( ackedStateNodeId ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to find AckedState NodeId" );
        testCase.TestsFailed++;
        return false;
    }

    var ackedInstance = modelMap.Get( ackedStateNodeId.toString() );
    if ( !isDefined( ackedInstance ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to find AckedState in model map" );
        testCase.TestsFailed++;
        return false;
    }

    var ackedStateIdSearch = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
            IsForward: true,
            DisplayName: UaLocalizedText.New( { Text: "Id", Locale: "" } )
        }
    ];
    modelHelper.FindReferences( ackedInstance.ReferenceDescriptions, ackedStateIdSearch );
    var ackedStateIdNodeId = CUVariables.Acknowledge.GetReferenceNodeId( ackedInstance, ackedStateIdSearch[ 0 ] );
    if ( !isDefined( ackedStateIdNodeId ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to find AckedState.Id NodeId" );
        testCase.TestsFailed++;
        return false;
    }

    var items = MonitoredItem.fromNodeIds( [ 
        new UaNodeId( ackedStateIdNodeId ), 
        new UaNodeId( commentNodeId ),  
        new UaNodeId( messageNodeId ), 
        new UaNodeId( eventIdNodeId ) ] );

    if ( !ReadHelper.Execute( { NodesToRead: items } ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to Read Comment and AckedState" );
        testCase.TestsFailed++;
        return false;
    }

    if ( isDefined( items[ eventIdIndex ].Value ) && isDefined( items[ eventIdIndex ].Value.Value ) ){
        var readEventId = items[ eventIdIndex ].Value.Value.toByteString();
        if ( !readEventId.equals( eventId ) ){
            collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
                " Has changed.  Unable to do test" );
            testCase.TestsSkipped++;
            return true;
        }
    }else{
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to get event id value! Unable to do test" );
        testCase.TestsFailed++;
        return false;
    } 

    var readComment = null;
    var readAckedStateId = null;
    if ( isDefined( items[ ackedStateIndex ].Value.Value ) ) {
        readAckedStateId = items[ ackedStateIndex ].Value.Value.toBoolean();
    }

    if ( isDefined( items[ commentIndex ].Value.Value ) ) {
        readComment = items[ commentIndex ].Value.Value.toLocalizedText();
    }

    if ( !isDefined( readComment ) || !isDefined( readAckedStateId ) ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unable to Retrieve values for Comment and AckedState" );
        testCase.TestsFailed++;
        return false;
    }

    if ( readComment.Text != expectedComment ) {
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unexpected read value Comment Expected: " + expectedComment + " Actual: " + readComment.Text );
        testCase.TestsFailed++;
        return false;
    }

    var message = "";
    if ( isDefined( items[ messageIndex ].Value.Value ) ) {
        message = " Message = " + items[ messageIndex ].Value.Value.toString();
    }

    collector.AddMessage( testCase, collector.Categories.Activity, conditionIdString +
        " Validate: ackedstate = " + readAckedStateId + 
        " comment = " + readComment.Text + 
        message );

    if ( readAckedStateId != expectedAckedState ) {
        var message = "";
        if ( isDefined( items[ messageIndex ].Value.Value ) ) {
            message = " Message = " + items[ messageIndex ].Value.Value.toString();
        }
    
        collector.AddMessage( testCase, collector.Categories.Error, conditionIdString +
            " Unexpected read value AckedState Expected: " + expectedAckedState + 
            " Actual: " + readAckedStateId + 
            message );
        testCase.TestsFailed++;
        return false;
    }

    collector.AddMessage( testCase, collector.Categories.Activity,
        "Time to read alarm Instance = " + timer.TakeReading() );

    return true;
}

CUVariables.Acknowledge.GetReferenceNodeId = function ( instance, searchDefinition ) {
    if ( isDefined( searchDefinition.ReferenceIndex ) ) {
        return instance.ReferenceDescriptions[ searchDefinition.ReferenceIndex ].NodeId.NodeId;
    }
}

CUVariables.Acknowledge.IgnoreAcknowledgeByTime = function ( eventFields, collector, acknowledgeTime ) {
    var ignoreAcknowledge = false;
    var ackedTime = collector.GetSelectField( eventFields, "Time" );
    var time = ackedTime.toDateTime();
    if ( isDefined( time ) ) {
        if ( time < acknowledgeTime ) {
            ignoreAcknowledge = true;
        }
    }

    return ignoreAcknowledge;
}

CUVariables.Acknowledge.GetRunMultipleTestTime = function ( collector ) {
    // Set up a timer for a chance to call acknowledge on multiple events
    var MultipleTestTime = UaDateTime.utcNow();
    var maxTestTime = collector.GetMaximumTestTime() * 0.8;
    MultipleTestTime.addMilliSeconds( parseInt( maxTestTime.toString() ) );
    return MultipleTestTime;
}

CUVariables.Acknowledge.MultipleTest = function ( collector, test ) {
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

                print( test.TestName + " performing multi acknowledgement call for " + methods.length + " events" );


                if ( isDefined( callHelper.Response ) && isDefined( callHelper.Response.Results ) ) {
                    var checkKeys = checkMap.Keys();
                    var results = callHelper.Response.Results;
                    for ( index = 0; index < results.length; index++ ) {
                        var result = results[ index ];
                        if ( !test.CheckBadStatusCode( result.StatusCode ) ) {
                            var key = checkKeys[ index ];
                            var testCase = checkMap.Get( key );
                            collector.AddMessage( testCase, collector.Categories.Error, testCase.ConditionId.toString() +
                                " Unexpected error doing multiple acknowledge: " + result.toString() );
                            testCase.TestsFailed++;
                        }
                    }
                } else {
                    addError( test.TestName + " Call for multiple Acknowledgements failed " );
                    stopCurrentUnit();
                }
            } else {
                print( test.TestName + " Received no events to acknowledge" );
            }

            test.MultipleTestComplete = true;
        }
    }
}


// Autorun test cases
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Test_001.js" );
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Test_002.js" );
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Test_003.js" );
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Err_004.js" );
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Err_005.js" );
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Err_006.js" );
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Err_007.js" );
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Err_008.js" );
include( "./maintree/Alarms and Conditions/A and C Acknowledge/Test Cases/Err_009.js" );

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
}






