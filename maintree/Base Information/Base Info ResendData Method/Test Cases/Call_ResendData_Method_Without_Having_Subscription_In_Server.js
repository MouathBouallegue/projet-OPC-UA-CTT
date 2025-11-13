/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the ResendData method without having a Subscription in the server.
*/

function test() {
    var TC_Variables = new Object();

    TC_Variables.TestResult = false;

    if( CallHelper.Execute( {
        MethodsToCall: [{
            MethodId: CU_Variables.ResendData.InstanceNode.NodeId,
            ObjectId: new UaNodeId( Identifier.Server ),
            InputArguments: UaVariant.New( { Value: Math.floor( Math.random() * 4294967295 ), Type: BuiltInType.UInt32 } )
        }]
    } ) ) {
        if( CallHelper.Response.Results[0].StatusCode.StatusCode !== StatusCode.BadNotImplemented ) {
            if( Assert.True( CallHelper.Response.Results[0].StatusCode.StatusCode === StatusCode.BadSubscriptionIdInvalid, "Expected to receive the StatusCode BadSubscriptionIdInvalid but got: " + CallHelper.Response.Results[0].StatusCode + ". Abort test." ) ) {

                TC_Variables.TestResult = true;
            }
        }
        else {
            addNotSupported( "The ResendData method is available in the address space of the server returned BadNotImplemented when calling it.\nPlease verify that this CU is optional in the desired target profile. Aborting Conformance Unit." );
            stopCurrentUnit();
        }
    }

    return ( TC_Variables.TestResult );
}

Test.Execute( { Procedure: test } );
