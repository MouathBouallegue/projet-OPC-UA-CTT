/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Instances/Level/Test Cases/Test_001.js

    Description:    
        Walk through the address space looking for Condition instances. For each instance, check the type definition complaince.

    Expectation:
        Each condition instance contains a reference to the ConditionType. All nested properties and methods are in the instance.
    
*/

function Test_001 () {

    this.AlarmTester = CUVariables.AlarmCollector.GetAlarmTester();
    this.AlarmUtilities = this.AlarmTester.GetAlarmUtilities();
    this.NodeSetUtility = this.AlarmUtilities.GetNodeSetUtility();

    this.ModelMap = this.AlarmUtilities.GetModelMap();
    this.ModelMapHelper = this.AlarmUtilities.GetModelMapHelper();
    this.TypeMaps = new KeyPairCollection();

    this.HasProperty = new UaNodeId( Identifier.HasProperty );
    this.HasComponent = new UaNodeId( Identifier.HasComponent );
    this.HasTypeDefinition = new UaNodeId( Identifier.HasTypeDefinition );

    this.Run = function () {

        var success = true;

        var alarmTypes = this.AlarmTester.GetSupportedAlarmTypes();

        alarmTypes.Iterate( function ( alarmTypeName, alarmType, args ) {
            if ( isDefined( alarmType.Instances ) && alarmType.Instances.Length() > 0 ) {
                if ( !args.This.TestAlarmType( alarmType ) ) {
                    success = false;
                }
            } else {
                print( "Alarm Type " + alarmType.Name + " Does not have any instances" );
            }
        }, { This: this } );

        return success;
    }

    this.TestAlarmType = function ( alarmType ) {

        var success = true;

        print( "Alarm Type " + alarmType.Name + " has " + alarmType.Instances.Length() + " alarm instances" );

        alarmType.Instances.Iterate( function ( alarmNodeId, alarmInstance, args ) {
            if ( !args.This.TestAlarmInstance( alarmInstance, alarmType ) ) {
                success = false;
            }
        }, { This: this } );

        return success;

    };

    this.TestAlarmInstance = function ( alarmInstance, alarmType ) {

        var success = true;

        var alarmInstanceName = "Alarm Instance " + alarmInstance.Name + " ";
        var errorPrefix = "AlarmType " + alarmType.Name + " " + alarmInstanceName + ": ";

        var maps = CUVariables.Instances.GetTypeMaps( this.AlarmTester, alarmType );

        if ( !this.ValidateConditionType( alarmInstance, alarmType ) ) {
            success = false;
        }

        var eventFields = this.AlarmUtilities.ReadEventFields( alarmInstance, maps.Optional );

        if ( eventFields != null ){
            var alarmUtilities = this.AlarmUtilities;

            maps.Optional.Iterate( function( fieldName, selectField ) {
                var errorMessage = alarmUtilities.TestMandatoryProperty( fieldName, 
                    eventFields, maps.Optional, maps.Mandatory, maps.Optional );
                if ( errorMessage.length > 0 ){
                    addError( errorPrefix + errorMessage );
                    success = false;
                }
            } );

        }else{
            addError(errorPrefix + "Unable to read Alarm Instance Values" );
            success = false;
        }
        
        return success;
    };

    this.ValidateConditionType = function ( alarmInstance, alarmType ) {
        
        var success = false;

        if ( isDefined( alarmInstance.ReferenceDescriptions ) ) {
            success = this.ValidateConditionTypeAgainstSpec( alarmInstance, alarmType, alarmInstance.ReferenceDescriptions );
        } else {
            addError( "Alarm Instance " + alarmInstance.Name + " does not contain any reference descriptions" );
        }

        return success;
    }

    this.ValidateConditionTypeAgainstSpec = function( alarmInstance, alarmType, referenceDescriptions ){
        var success = false;
        for( var index = 0; index < referenceDescriptions.length; index++ ){
            var referenceDescription = referenceDescriptions[ index ];
            if ( referenceDescription.IsForward && referenceDescription.ReferenceTypeId.equals( this.HasTypeDefinition ) ){
                var typeDefinition = referenceDescription.NodeId.NodeId.toString();
                if ( typeDefinition == alarmType.SpecAlarmTypeId ){
                    success = true;
                }else{
                    if ( alarmType.SpecAlarmTypeId == alarmType.AlarmType ){
                        addError( "Alarm instance " + alarmInstance.Name + " is not derived from expected type " + alarmType.SpecAlarmTypeId );
                    }else{
                        var typeParent = this.ModelMap.Get( typeDefinition );
                        if ( isDefined( typeParent ) && isDefined( typeParent.ReferenceDescriptions ) ){
                            // recurse
                            success = this.ValidateConditionTypeAgainstSpec( alarmInstance, alarmType, typeParent.ReferenceDescriptions );
                        }else{
                            addError( "Alarm instance " + alarmInstance.Name + " unable to find model references for type " + typeDefinition );
                        }
                    }
                }
                break;
            }
        }

        return success;
    }

    this.GetTypeMaps = function ( specAlarmTypeId ) {
        if ( !this.TypeMaps.Contains( specAlarmTypeId ) ) {

            var maps = {
                Mandatory: this.AlarmTester.GetMandatoryMap( specAlarmTypeId ),
                Optional: this.AlarmTester.GetOptionalMap( specAlarmTypeId )
            }

            this.TypeMaps.Set( specAlarmTypeId, maps );
        }

        return this.TypeMaps.Get( specAlarmTypeId );
    }

    return this.Run();
}

Test.Execute( { Procedure: Test_001 } );

