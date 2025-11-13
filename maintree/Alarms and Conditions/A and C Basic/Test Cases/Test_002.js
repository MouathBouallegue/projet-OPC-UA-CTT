/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Check any derived types, ensure that generates Alarm/Conditions comply 
        with the expected structure of the parent type.

    Expectation:
        ALL mandatory items exist and are correct, and any optional items that exist do comply.

    How this test works:
        Every event received by the internal thread is compared against the spec, 
        including all parent types up to BasicEventType
*/

function Test_002 () {

    this.TestName = "Test_002";
    this.TypeMaps = new KeyPairCollection();

    this.TestEvent = function ( eventFields, testCase, collector ) {

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();
        var eventType = eventFields[ collector.EventTypeIndex ];
        var maps = this.GetMaps( eventType, collector );
        
        if  ( isDefined( maps ) && isDefined( maps.Mandatory ) && isDefined( maps.Optional ) ){

            var selectFieldKeys = collector.AlarmThreadHolder.SelectFields.Keys();
            var alarmTester = collector.GetAlarmTester();
            var alarmUtilities = alarmTester.GetAlarmUtilities();
            var success = true;
    
            for ( var index = 0; index < selectFieldKeys.length; index++ ) {
                var selectFieldKey = selectFieldKeys[ index ];
                if ( selectFieldKey != "ConditionId" ) {
    
                    var errorMessage = alarmUtilities.TestMandatoryProperty( selectFieldKey, eventFields, 
                        collector.AlarmThreadHolder.SelectFields, maps.Mandatory, maps.Optional );
    
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
        }else{
            collector.AddMessage( testCase, collector.Categories.Error, conditionIdString + 
                " Unable to error retrieve fields for alarm type " + eventType );
                testCase.TestsFailed++;
        }
    }

    this.GetMaps = function( alarmType, collector ){
        if ( !this.TypeMaps.Contains( alarmType ) ){
            var alarmTester = collector.GetAlarmTester();

            var maps = { 
                Mandatory: alarmTester.GetMandatoryMap( alarmType ),
                Optional: alarmTester.GetOptionalMap( alarmType )
            }
            this.TypeMaps.Set( alarmType, maps );
        }
        return this.TypeMaps.Get( alarmType );
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
