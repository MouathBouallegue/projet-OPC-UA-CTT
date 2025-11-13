/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
   
    Search for instances of "Conditions" (or sub-types, such as an Alarm) in the address-space.
    Cache the NodeIds of these conditions so that they can be accessed quickly by the other scripts within this CU.
    
    Expectation:
        Conditions provide the "Enable" and "Disable" methods and their signatures match the specifications; 
        the BrowseName is either 'Enable' or 'Disable' and it has reference 'AlwaysGeneratesEvent' 
        (of type AuditConditionEnableEventType). If no instance exist this test can be skipped    

    How this test works:
        1. AlarmTester is auto initialized to read all the alarm types 
            and instances in the server by reading the address space
        2. Compare the Desired parameters for each instance against ConditionType 
            definition in Opc.Ua.NodeSet2.Part9.xml
*/

function Test_001 () {

    var alarmUtilities = CUVariables.AlarmTester.GetAlarmUtilities();
    var alarmInstance = CUVariables.AlarmTester.GetAlarmInstance();

    var nodeSetUtility = alarmUtilities.GetNodeSetUtility();

    var typeKeys = CUVariables.AlarmTypes.Keys();
    for ( var typeIndex = 0; typeIndex < typeKeys.length; typeIndex++ ) {
        var typeKey = typeKeys[ typeIndex ];
        var typeObject = CUVariables.AlarmTypes.Get( typeKey );
        var typeNodeSet = nodeSetUtility.GetEntity( typeObject.SpecAlarmTypeId );
        if ( isDefined( CUVariables.AlarmTypes.Get( typeKey ).Instances ) ) {
            var instances = CUVariables.AlarmTypes.Get( typeKey ).Instances;
            var instanceKeys = instances.Keys();
            for ( var instanceIndex = 0; instanceIndex < instanceKeys.length; instanceIndex++ ) {
                // Debug reduce the length of this test
                if ( instanceIndex > 0 ) {
                    continue;
                }
                var instanceKey = instanceKeys[ instanceIndex ];
                var instance = instances.Get( instanceKey );

                var nodeSetPlaceholders = alarmInstance.RetrieveInstanceData( instance, typeNodeSet );

                for ( var index = 0; index < nodeSetPlaceholders.length; index++ ) {
                    var placeHolder = nodeSetPlaceholders[ index ];
                    if ( placeHolder.NodeSetReference.DisplayName == "Enable" ||
                        placeHolder.NodeSetReference.DisplayName == "Disable" ) {
                        alarmUtilities.CompareMethod(
                            instance,
                            typeNodeSet,
                            placeHolder.AlarmReferenceObject,
                            placeHolder.NodeSetReference );
                    }
                }
            }
        }else{
            print("No instances found for type " + typeKey );
        }
    }

    print( "Test_001 Complete" );
    return ( true );
}

Test.Execute( { Procedure: Test_001 } );

