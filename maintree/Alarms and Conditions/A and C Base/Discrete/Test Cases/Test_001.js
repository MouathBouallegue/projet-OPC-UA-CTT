/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Discrete/Test Cases/Test_001.js
        Test is shared by Discrete/OffNormal/SystemOffNormal Conformance Units

    Description:    
        1   Create an Alarm filter that include all fields available (mandatory and optional) for a OffNormalAlarmType
        2   Check the data type of the return fields

    Expectation:
        1   Ensure that the reported events include all mandatory fields. 
        2   Verify that the DataTypes returned for all of the fields are as defined.
*/

function Test_001 () {

    // Test does not need to check if it can run.  It can be run on every event.

    this.TestName = "Test_001";
    this.AlarmTypeString = null;
    this.MandatoryMap = null;
    this.OptionalMap = null;
    this.AlarmTester = null;
    this.AlarmUtilities = null;

    this.Initialize = function ( collector ) {

        if ( !isDefined( CUVariables.AlarmTypeString ) ) {
            throw ( "Invalid Test Setup" );
        }

        this.AlarmTypeString = CUVariables.AlarmTypeString;
        this.MandatoryMap = this.GetMandatoryMap( collector );
        this.OptionalMap = this.GetOptionalMap( collector );
        var alarmUtilities = this.GetAlarmUtilities( collector );

        var alarmTypes = alarmUtilities.GetAlarmTypeAndDerivedTypes( this.AlarmTypeString );

        collector.AddIgnoreSkips( alarmTypes, this.TestName );
    }

    this.TestEvent = function ( eventFields, testCase, collector ) {
        var conditionId = collector.GetConditionId( eventFields );
        if ( !this.ShouldTestEvent( eventFields, collector ) ) {
            testCase.TestSkipped++;
            return;
        }

        var activeState = collector.GetSelectField( eventFields, "ActiveState" ).toString();
        print( this.TestName + ":" + conditionId.toString() + " Should Test, ActiveState " + activeState );

        var selectFieldKeys = collector.AlarmThreadHolder.SelectFields.Keys();
        var alarmUtilities = this.GetAlarmUtilities( collector );
        var success = true;

        for ( var index = 0; index < selectFieldKeys.length; index++ ) {
            var selectFieldKey = selectFieldKeys[ index ];
            if ( selectFieldKey != "ConditionId" ) {
                var errorMessage = alarmUtilities.TestMandatoryProperty( selectFieldKey, eventFields,
                    collector.AlarmThreadHolder.SelectFields, this.MandatoryMap, this.OptionalMap );

                if ( errorMessage.length > 0 ) {
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

    this.GetAlarmUtilities = function ( collector ) {
        if ( !isDefined( this.AlarmUtilities ) ) {
            this.AlarmUtilities = this.GetAlarmTester( collector ).GetAlarmUtilities();
        }

        return this.AlarmUtilities;
    }

    this.GetAlarmTester = function ( collector ) {
        if ( !isDefined( this.AlarmTester ) ) {
            this.AlarmTester = collector.GetAlarmTester();
        }

        return this.AlarmTester;
    }

    this.GetMandatoryMap = function ( collector ) {
        if ( !isDefined( this.MandatoryMap ) ) {
            var mandatory = true;
            this.MandatoryMap = this.GetFieldMap( collector, mandatory );
        }
        return this.MandatoryMap;
    }

    this.GetOptionalMap = function ( collector ) {
        if ( !isDefined( this.OptionalMap ) ) {
            var mandatory = false;
            this.OptionalMap = this.GetFieldMap( collector, mandatory );
        }
        return this.OptionalMap;
    }

    this.GetFieldMap = function ( collector, mandatory ) {
        var alarmTypes = this.GetAlarmTester( collector ).GetSupportedAlarmTypes();
        var alarmUtilities = this.GetAlarmUtilities( collector );
        var map = alarmUtilities.CreateSelectFields( this.AlarmTypeString, alarmTypes, mandatory );
        map.Iterate( function ( key, object ) {
            print( mandatory + ":" + key );
        } );
        return map;
    }


    this.ShouldTestEvent = function ( eventFields, collector ) {

        var shouldTest = false;

        var eventType = eventFields[ collector.EventTypeIndex ].toString();
        if ( eventType == this.AlarmTypeString ) {
            shouldTest = true;
        } else {
            var alarmUtilities = this.GetAlarmUtilities( collector );
            var derived = alarmUtilities.GetDerivedTypes( this.AlarmTypeString );
            for ( var index = 0; index < derived.length; index++ ) {
                var derivedTypeName = derived[ index ];
                if ( derivedTypeName == eventType ) {
                    shouldTest = true;
                    break;
                }
            }
        }

        if ( shouldTest ) {
            // Ignore anything with a branch id
            if ( collector.IsNonNullNodeId( eventFields, "BranchId" ) ) {
                shouldTest = false;
                print( "ShouldTestEvent ignoring due to BranchId" );
            }
        }

        return shouldTest;
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