/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description:    
        Browse the type definitions in the address space for Conditions and locate the AddComment method.
    
    Expectation:
        The method matches the signature defined in the specifications 

    How this test works:
        Use the retrieved object model and compare against the node set description
        Comparing the complete ConditionType tests the AddComment Method.
*/

function Test_000 () {

    var success = false;

    var alarmTypes = CUVariables.AlarmTester.GetSupportedAlarmTypes();
    if ( isDefined( alarmTypes ) ) {
        var conditionType = alarmTypes.Get( CUVariables.Comment.ConditionTypeNodeIdString );

        if ( isDefined( conditionType ) &&
            isDefined( conditionType.ReferenceDetails ) &&
            isDefined( conditionType.ReferenceDetails.Method ) ) {
            var addComment = conditionType.ReferenceDetails.Method.Get(
                CUVariables.Comment.AddCommentNodeIdString );
            if ( isDefined( addComment ) ) {
                success = CUVariables.AlarmTester.CompareTypeTest(
                    CUVariables.Comment.ConditionTypeNodeIdString, false );
            }
            else {
                addError( "Unable to find AddComment Method on ConditionType" );
            }
        } else {
            addError( "Unable to find Methods for ConditionType" );
        }
    } else {
        addError( "No AlarmTypes found" );
    }

    return success;
}

Test.Execute( { Procedure: Test_000 } );