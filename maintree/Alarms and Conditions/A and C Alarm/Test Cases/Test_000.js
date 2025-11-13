/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description: 
        Browse the address-space type definitions starting at the ConditionType node. 
        Verify the "AcknowledgeableConditionType" is nested and then follow its references. 
        Verify the "AlarmConditionType" is nested and follow all of its references to 
        identify all Alarm Condition types. Cache all NodeIds of interest. 
        Verify each AlarmCondition complies to the specifications.
   
    Expectation:
        The references exist as specified. 
        Each reference complies to the specification as described in UA Part 9 Table 30 AlarmConditionType model.
    
*/

function Test_000 () {

    var alarmTypes = CUVariables.AlarmCollector.AlarmTester.GetSupportedAlarmTypes();
    
    var alarmConditionTypeNodeIdString = new UaNodeId( Identifier.AlarmConditionType).toString();
    var alarmConditionType = alarmTypes.Get( alarmConditionTypeNodeIdString );
    
    if ( !isDefined( alarmConditionType ) ){
        addError("AlarmConditionType not found in object model" );
    }
    
    if ( alarmConditionType.ParentNodeId != new UaNodeId( Identifier.AcknowledgeableConditionType ) ){
        addError( "AlarmConditionType not derived from AcknowledgeableConditionType" );
    }

    var compareSubTypes = false;

    CUVariables.AlarmTester.CompareTypeTest( alarmConditionTypeNodeIdString, compareSubTypes );

    return true;
}

Test.Execute( { Procedure: Test_000 } );
