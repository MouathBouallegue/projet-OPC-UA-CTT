/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    File
        ./maintree/Alarms and Conditions/A and C Base/Refresh/Test Cases/Test_000.js
        Test is shared between [ConditionRefresh][ConditionRefresh2]

    Description:    
        1	Walk through the address space and verify the [ConditionRefresh][ConditionRefresh2] method exists on "ConditionType" type.
        2   Verify the ConditionRefresh() method does not exist for derived types.

    Requirements: 
        The browse path should be Root\Types\ObjectTypes\BaseEventType\ConditionType\[ConditionRefresh][ConditionRefresh2]
        The ConditionType ObjectType node
    
    Expectation:
        1   The method exists in the right places and its signature matches the specifications, 
            i.e. "void ConditionRefresh( [in] integerId subscriptionId )". 
            The BrowseName is "ConditionRefresh" and has 3 references: "HasProperty" and 2 instances of "AlwaysGeneratesEvent".
        2   The method only exists on the  ConditionType definition object:
                ObjectId: i=2782
                MethodId: i=3875    [ConditionRefresh]
                MethodId: i=12912    [ConditionRefresh2]
        
    How this test works:
        Retrieve the object model from the server, search for all alarm types,
        then verify the ConditionType against the Spec, with specific checks for 
        ConditionRefresh/ConditionRefresh2.  All other types are checked
        to ensure the ConditionRefresh does not exist.
*/

function Test_000 () {

    this.Test = function () {

        var success = true;
        var runConformanceUnit = true;
        var foundConditionType = false;

        var alarmTypeKeys = CUVariables.AlarmTypes.Keys();
        for ( var alarmTypeIndex = 0; alarmTypeIndex < alarmTypeKeys.length; alarmTypeIndex++ ) {
            var alarmTypeId = alarmTypeKeys[ alarmTypeIndex ];
            var alarmType = CUVariables.AlarmTypes.Get( alarmTypeId );

            if ( CUVariables.Refresh.ConditionTypeString == alarmTypeId ) {
                if ( !this.TestConditionType( alarmType ) ) {
                    success = false;
                }

                runConformanceUnit = this.CanRunConformanceUnit( alarmType );

                foundConditionType = true;
            } else {
                if ( !this.TestNonConditionType( alarmType ) ) {
                    success = false;
                }
            }
        }

        if ( !runConformanceUnit ) {
            var message = "Method " + CUVariables.Refresh.Virtual.BrowseNameText +
                " Not Found. Unable to run " + CUVariables.Refresh.Virtual.Name + " Conformance Unit";
            if ( CUVariables.Refresh.Virtual.Mandatory ) {
                addError( message );
                success = false;
            } else {
                addWarning( message );
            }
            stopCurrentUnit();
        }

        return success;
    }

    this.TestConditionType = function ( alarmType ) {

        var success = true;

        var referenceDetail = this.GetMethodReferenceDetail( alarmType );
        if ( isDefined( referenceDetail ) ) {

            var alarmUtilities = CUVariables.AlarmTester.GetAlarmUtilities();
            var modelHelper = alarmUtilities.GetModelMapHelper();
            var modelMap = modelHelper.GetModelMap();
            var methodInstance = modelMap.Get( CUVariables.Refresh.Virtual.MethodIdString );

            if ( isDefined( methodInstance ) ) {

                modelHelper.FindPaths( methodInstance, modelMap, 0 );

                if ( isDefined( methodInstance.Paths ) ) {
                    var rootPath = "Root/Types/ObjectTypes/BaseObjectType/BaseEventType";
                    var desiredPath = rootPath + "/ConditionType";
                    var found = false;
                    for ( var index = 0; index < methodInstance.Paths.length; index++ ) {
                        var path = methodInstance.Paths[ index ];
                        print( path );
                        if ( path == desiredPath ) {
                            found = true;
                        } else {
                            if ( alarmType.Paths[ index ].indexOf( rootPath ) == 0 ) {
                                addError( CUVariables.Refresh.Virtual.BrowseNameText +
                                    " has an unexpected definition: " +
                                    path );
                                success = false;
                            }
                        }
                    }

                    if ( !found ) {
                        addError( "Desired Path for " + alarmType.Name + " was not found" );
                        success = false;
                    }
                } else {
                    addError( "Unable to determine paths for " + alarmType.Name );
                    success = false;
                }

                var alarmMethod = alarmType.ReferenceDetails.Method.Get(
                    CUVariables.Refresh.Virtual.MethodIdString );

                CUVariables.AlarmTester.GetAlarmType().GetReferenceDetails( alarmMethod.ModelObject );

                // Compare Type will Validate Refresh Methods, and automatically add errors
                var compareSubTypes = false;
                CUVariables.AlarmTester.CompareTypeTest( CUVariables.Refresh.ConditionTypeString,
                    compareSubTypes );
                if ( !this.CompareMethodReferences( alarmType, alarmMethod ) ) {
                    success = false;
                }
            } else {
                var message = "Unable to find Method " + CUVariables.Refresh.Virtual.BrowseNameText;
                if ( CUVariables.Refresh.Virtual.Mandatory ) {
                    addError( message );
                    success = false;
                } else {
                    print( message );
                }
            }
        } else {
            success = !CUVariables.Refresh.Virtual.Mandatory;
            if ( !success ) {
                addError( "Unable to find Mandatory Method " + CUVariables.Refresh.Virtual.BrowseNameText );
                success = false;
            }
        }

        return success;
    }

    this.TestNonConditionType = function ( alarmType ) {
        var success = true;

        var referenceDetail = this.GetMethodReferenceDetail( alarmType );
        if ( isDefined( referenceDetail ) ) {
            addError( "Alarm Type " + alarmType.Name + " Supports " +
                CUVariables.Refresh.Virtual.BrowseNameText + " when it should not" );
            success = false;
        }

        return success;
    }

    this.CanRunConformanceUnit = function ( alarmType ) {
        var canRun = false;

        if ( isDefined( this.GetMethodReferenceDetail( alarmType ) ) ) {
            canRun = true;
        }

        return canRun;
    }

    this.GetMethodReferenceDetail = function ( alarmType ) {
        var referenceDetail = null;

        if ( isDefined( alarmType.ReferenceDetails ) &&
            isDefined( alarmType.ReferenceDetails.Method ) ) {
            referenceDetail = alarmType.ReferenceDetails.Method.Get(
                CUVariables.Refresh.Virtual.MethodIdString );
        }

        return referenceDetail;
    }

    /**
     * These compareMethodReferences methods were built to check references 
     * including AlwaysGeneratesEvents At this point, it is only valid for 
     * ConditionType:Refresh/Refresh2 as RefreshStartEvent and RefreshEndEvent are mandatory
     */       
    this.CompareMethodReferences = function ( alarmType, alarmMethod ) {
        var success = true;
        var nodeSetUtility = CUVariables.AlarmTester.GetAlarmUtilities().GetNodeSetUtility();
        var nodeSetEntity = nodeSetUtility.GetEntity( alarmMethod.NodeId.toString() );
        // Get the references of the nodeSet Entity
        if ( isDefined( nodeSetEntity ) &&
            isDefined( nodeSetEntity.References ) &&
            isDefined( nodeSetEntity.References.Reference ) ) {
            var references = nodeSetEntity.References.Reference;

            for ( var index = 0; index < references.length; index++ ) {
                var reference = references[ index ];
                var nodeSetParameterNodeId = reference.__text;
                var nodeSetParameterObject = nodeSetUtility.GetEntity( nodeSetParameterNodeId );

                if ( !this.CompareMethodReference( alarmMethod.ModelObject, reference ) ) {
                    addError( CUVariables.AlarmTester.GetAlarmUtilities().GetAlarmEntityName( [ alarmType, alarmMethod ] ) +
                        " Unable to find reference to " + nodeSetParameterObject._BrowseName );
                    success = false;
                }
            }

        }
        return success;
    }

    this.CompareMethodReference = function ( alarmReferenceObject, nodeSetReference ) {
        var success = false;
        var nodeSetUtility = CUVariables.AlarmTester.GetAlarmUtilities().GetNodeSetUtility();
        var isForward = nodeSetUtility.IsForward( nodeSetReference );
        if ( isForward ) {
            var nodeSetReferenceType = nodeSetUtility.GetReferenceTypeNodeId( nodeSetReference );
            var nodeSetNodeId = nodeSetUtility.GetNodeId( nodeSetReference.__text );
            var nodeSetReferenceObject = nodeSetUtility.GetEntity( nodeSetNodeId.toString() );
            var nodeSetReferenceName = nodeSetReference.__text;

            if ( isDefined( nodeSetReferenceObject ) && isDefined( nodeSetNodeId ) ) {
                nodeSetReferenceName = nodeSetReferenceObject._BrowseName;

                for ( var index = 0; index < alarmReferenceObject.ReferenceDescriptions.length; index++ ) {
                    var reference = alarmReferenceObject.ReferenceDescriptions[ index ];
                    if ( reference.IsForward == isForward &&
                        reference.NodeClass == nodeSetReferenceObject.NodeClass &&
                        reference.ReferenceTypeId.equals( nodeSetReferenceType ) &&
                        reference.NodeId.NodeId.equals( nodeSetNodeId ) &&
                        reference.BrowseName.Name == nodeSetReferenceName ) {
                        success = true;
                        break;
                    }
                }
            }
        } else {
            // Just checking forward references
            success = true;
        }

        return success;
    }


    return this.Test();
}

Test.Execute( { Procedure: Test_000 } );
