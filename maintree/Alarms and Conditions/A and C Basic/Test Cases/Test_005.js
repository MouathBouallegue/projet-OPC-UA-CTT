/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description: 
        Validate condition notifications
    
    Expectation:
        Server produces condition notifications.  
        Validate condition notification components as described below 
        Only non-abstract alarms/conditions are generated
            - Verify the ConditionClassId (the nodeId of a ConditionClassType) exists in the type system 
            (note - may be BaseConditionClasstype if no specific condition class is assigned).
            - Verify ConditionClassName matches the display name of the ConditionClassType
            - Verify the presence of ConditionName (note - may be the ConditionType browse name)
            - Verify a NULL BranchId field for notifications which relate to the current state of the condition instance.  
            BranchId field may be non-NULL when the server supports "Previous Instances" Facet
            - Verify that Retain is set to FALSE.  Retain may be set to TRUE where the server supports Acknowledgeable conditions or Alarms
            - EnabledState is set TRUE or FALSE.  
            - Verify LastSeverity holds a non-negative value <=1000
            - Comment may be NULL.  Verify the  comment value is applied.
            - Verify the ClientUserId (based on the UserIdentityToken) is applied.  
            ClientUserId may be NULL in the case of an anonymous UserIdentityToken.


    How this test works:
        Every event received by the internal thread is compared against the conditions specified above
*/

function Test_005 () {

    this.TestName = "Test_005";

    this.TestEvent = function ( eventFields, testCase, collector ) {
        var success = true;

        // Verify that this event is actually an alarm type
        // Check the Model to ensure it is a child of ConditionType
        // The event type should exist in the GetSupportedAlarmTypes
        var eventType = eventFields[ collector.EventTypeIndex ];
        var alarmEventType = CUVariables.AlarmTester.GetSupportedAlarmTypes().Get( eventType );
        if ( isDefined( alarmEventType ) ) {
            var selectFields = collector.GetSelectFields();
            var alarmUtilities = CUVariables.AlarmTester.GetAlarmUtilities();
            var alarmEventTypeName = alarmUtilities.GetAlarmEntityName( [ alarmEventType ] );
            var sourceNodeId = eventFields[ selectFields.Get( "SourceNode" ).Index ];
            // Mantis 8315 - SourceNode could be null
            var sourceNodeString = "";
            if ( isDefined(sourceNodeId)){
                sourceNodeString = sourceNodeId.toString();
            }
            var eventObjectTypeName = alarmEventTypeName + ":" + sourceNodeString;
            var modelMap = alarmUtilities.GetModelMap();

            // 005-02 ConditionClassId
            // This is a Variant.  Should have the correct datatype and a value

            var conditionClassId = collector.GetSelectField( eventFields, "ConditionClassId" );

            // These variable are used later on
            var conditionClassIdNodeId = conditionClassId.toNodeId();
            var modelMapType = null;
            if ( isDefined( conditionClassIdNodeId ) ) {

                modelMapType = modelMap.Get( conditionClassIdNodeId.toString() );

                if ( !isDefined( modelMapType ) ) {
                    collector.AddMessage( testCase, collector.Categories.Error,
                        "Unable to find ConditionClassId " +
                        conditionClassIdNodeId.toString() + " in the Model for " + eventObjectTypeName );
                }
            } else {
                collector.AddMessage( testCase, collector.Categories.Error,
                    "Unable to find ConditionClassId in the event fields for event "
                    + eventObjectTypeName );
            }

            // 005-03 ConditionClassName
            if ( isDefined( modelMapType ) ) {
                var conditionClassName = collector.GetSelectField( eventFields, "ConditionClassName" );
                var conditionClassNameValue = conditionClassName.toLocalizedText();
                if ( isDefined( conditionClassNameValue ) ) {

                    var desiredName = alarmUtilities.GetConditionClassName( conditionClassIdNodeId );

                    if ( isDefined( desiredName ) ) {
                        if ( !desiredName.equals( conditionClassNameValue ) ) {
                            collector.AddMessage( testCase, collector.Categories.Error,
                                "ConditionClassName " + conditionClassNameValue.toString() +
                                " does not match ConditionClassId Value " + desiredName.toString() );
                            success = false;
                        }
                    } else {
                        collector.AddMessage( testCase, collector.Categories.Error,
                            "Unable to determine the name of the ConditionClassId " +
                            conditionClassIdNodeId.toString() );
                        success = false;
                    }
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error,
                        "Unable to find ConditionClassName in the event fields for event "
                        + eventObjectTypeName );
                    success = false;
                }
            } else {
                collector.AddMessage( testCase, collector.Categories.Error,
                    "Unable to test ConditionClassName as ConditionClassId is invalid for " + eventObjectTypeName );
                success = false;
            }

            // 005-04 ConditionName
            var conditionName = collector.GetSelectField( eventFields, "ConditionName" );
            if ( !collector.ValidateDataType( conditionName, BuiltInType.String ) ) {
                collector.AddMessage( testCase, collector.Categories.Error,
                    "ConditionName datatype must be a string value for event " + eventObjectTypeName );
                success = false;
            }

            // 005-05 BranchId
            // Mantis 8315 - Can Be Null
            var branchId = collector.GetSelectField( eventFields, "BranchId" );
            if ( branchId.DataType > 0 ) {
                if ( collector.ValidateDataType( branchId, BuiltInType.NodeId ) ) {
                    var branchIdNodeId = branchId.toNodeId();
                    if ( !isDefined( branchIdNodeId ) ) {
                        collector.AddMessage( testCase, collector.Categories.Error,
                            "BranchId Should be a node id: "
                            + eventObjectTypeName );
                        success = false;
                    }

                    if ( !UaNodeId.IsEmpty( branchIdNodeId ) ) {
                        if ( !isDefined( Test.Alarm.TestPreviousInstances ) ) {
                            Test.Alarm.TestPreviousInstances = true;
                        }
                    }

                } else {
                    collector.AddMessage( testCase, collector.Categories.Error,
                        "BranchId datatype must be a NodeId value for event " + eventObjectTypeName );
                    success = false;
                }
            } else {
                collector.AddMessage( testCase, collector.Categories.Activity,
                    "BranchId is Null for  " + eventObjectTypeName );
            }


            // 005-06 Retain
            var retain = collector.GetSelectField( eventFields, "Retain" );
            if ( collector.ValidateDataType( retain, BuiltInType.Boolean ) ) {
                var retainValue = retain.toBoolean();

                // The only thing to  check for is that retain is true if the alarm is active.
                // ActiveState is on the AlarmConditionType
                var activeState = eventFields[ selectFields.Get( "ActiveState.Id" ).Index ];
                if ( collector.ValidateDataType( activeState, BuiltInType.Boolean ) ) {
                    var activeStateValue = activeState.toBoolean();
                    if ( activeStateValue ) {
                        if ( retainValue != true ) {
                            collector.AddMessage( testCase, collector.Categories.Error,
                                "Retain should be set as alarm is active - event " + eventObjectTypeName );
                        }
                    }
                }
            } else {
                collector.AddMessage( testCase, collector.Categories.Error,
                    "Retain datatype must be a Boolean value for event " + eventObjectTypeName );
                success = false;
            }

            // 005-07 EnabledState
            var enabledState = collector.GetSelectField( eventFields, "EnabledState" );
            if ( collector.ValidateDataType( enabledState, BuiltInType.LocalizedText ) ) {
                // Tough to validate the values of Enabled state.  The spec has "Recommended names", not purely defined names
            } else {
                collector.AddMessage( testCase, collector.Categories.Error,
                    "EnabledState datatype must be a LocalizedText value for event " + eventObjectTypeName );
                success = false;
            }

            // 005-08 LastSeverity
            // Mantis 8315 - Can Be Null
            var lastSeverity = collector.GetSelectField( eventFields, "LastSeverity" );
            if ( lastSeverity.DataType > 0 ){
                if ( collector.ValidateDataType( lastSeverity, BuiltInType.UInt16 ) ) {
                    var lastSeverityValue = lastSeverity.toUInt16();
                    if ( lastSeverityValue < 0 || lastSeverityValue > 1000 ) {
                        collector.AddMessage( testCase, collector.Categories.Error,
                            "LastSeverity value must be a positive value <= 1000 " + eventObjectTypeName );
                        success = false;
                    }
                } else {
                    collector.AddMessage( testCase, collector.Categories.Error,
                        "LastSeverity datatype must be a UInt16 value for event " + eventObjectTypeName );
                    success = false;
                }
            } else {
                collector.AddMessage( testCase, collector.Categories.Activity,
                    "LastSeverity is Null for  " + eventObjectTypeName );
            }

            // 005-09 Comment
            // Mantis 8315 - Can Be Null
            var commentExists = false;
            var comment = collector.GetSelectField( eventFields, "Comment" );
            if ( comment.DataType > 0 ) {
                if ( !collector.ValidateDataType( comment, BuiltInType.LocalizedText ) ) {
                    collector.AddMessage( testCase, collector.Categories.Error,
                        "Comment datatype must be a LocalizedText value for event " + eventObjectTypeName );
                    success = false;
                }else{
                    var localizedText = comment.toLocalizedText();
                    if ( isDefined( localizedText ) ){
                        if ( localizedText.Text.length > 0 ){
                            commentExists = true;
                        }
                    }else{
                        collector.AddMessage( testCase, collector.Categories.Error,
                            "Unexpected error converting Comment LocalizedText for event " + eventObjectTypeName );
                        success = false;
                    }
                }
            } else {
                collector.AddMessage( testCase, collector.Categories.Activity,
                    "Comment is Null for  " + eventObjectTypeName );
            }

            // 005-10 ClientUserId
            var clientUserId = collector.GetSelectField( eventFields, "ClientUserId" );
            if ( commentExists || clientUserId.DataType > 0 ){
                if ( !collector.ValidateDataType( clientUserId, BuiltInType.String ) ) {
                    collector.AddMessage( testCase, collector.Categories.Error,
                        "ClientUserId datatype must be a string value for event " + eventObjectTypeName );
                    success = false;
                }
            }else{
                collector.AddMessage( testCase, collector.Categories.Activity,
                    "clientUserId is Null for  " + eventObjectTypeName );
            }
        } else {
            collector.AddMessage( testCase, collector.Categories.NonEssentialActivity,
                "Unable to find event type " + eventType );
        }

        if ( success ) {
            testCase.TestsPassed++;
        } else {
            testCase.TestsFailed++;
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
        Test.Execute( { Procedure: Test_005 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_005 } );
    }
}
