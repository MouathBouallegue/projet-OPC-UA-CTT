/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Level/Test Cases/Test_001.js
        Test is shared by Exclusive/NonExclusive Limit/Level Conformance Units

    Description:    
    Create an Alarm filter that include all fields available (mandatory and optional) for a ExclusiveLevelAlarmType
    Check the data type of the return fields

    Test Requirements:
    Ensure that a subscription is established for the alarms (all fields) and also for all of the configured datatypes that have alarming assigned to them.

    Expectation:
    Ensure that the reported events include all mandatory fields and at least one optional limit field.
    Verify that the DataTypes returned for all of the fields are as defined.
       
*/

function Test_001 () {

    // Test does not need to check if it can run.  It can be run on every event.

    this.TestName = "Test_001";
    this.LimitHelper = null;
    this.MandatoryMap = null;
    this.OptionalMap = null;
    this.NodeSetUtility = null;

    this.Initialize = function ( collector ) {

        this.LimitHelper = CUVariables.LimitHelper;
        this.MandatoryMap = this.LimitHelper.GetMandatoryMap();
        this.OptionalMap = this.LimitHelper.GetOptionalMap();
        this.NodeSetUtility = this.LimitHelper.GetNodeSetUtility();

        collector.AddIgnoreSkips( this.LimitHelper.GetAlarmTypeAndDerivedTypes(), this.TestName );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        var conditionId = collector.GetConditionId( eventFields );
        if ( !this.LimitHelper.ShouldTestEvent( eventFields, collector ) ) {
            testCase.TestSkipped++;
            return;
        }
        var activeState = collector.GetSelectField( eventFields, "ActiveState" ).toString();
        print( this.TestName + ":" + conditionId.toString() + " Should Test" + " ActiveState " + activeState );

        var selectFieldKeys = collector.AlarmThreadHolder.SelectFields.Keys();
        var alarmUtilities = collector.AlarmTester.GetAlarmUtilities();
        var success = true;

        for ( var index = 0; index < selectFieldKeys.length; index++ ) {
            var selectFieldKey = selectFieldKeys[ index ];
            if ( selectFieldKey != "ConditionId" ) {
                var errorMessage = alarmUtilities.TestMandatoryProperty( selectFieldKey, eventFields, 
                    collector.AlarmThreadHolder.SelectFields, this.MandatoryMap, this.OptionalMap );

                if ( errorMessage.length > 0 ){
                    collector.AddMessage( testCase, collector.Categories.Error, conditionId.toString() + errorMessage );
                    testCase.TestsFailed++;
                    success = false;
                }
            }
        }

        if ( success ) {
            testCase.TestsPassed++;
            var eventType = eventFields[ collector.EventTypeIndex ].toString();
            collector.AddMessage( testCase, collector.Categories.Activity, conditionId.toString() +
                ":" + eventType + " Total Passes " + testCase.TestsPassed );
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
        Test.Execute( { Procedure: Test_001 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_001 } );
    }
}