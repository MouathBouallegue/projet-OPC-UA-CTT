/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Create a session using one set of user credentials.
					Create a subscription that is monitoring at least 1 item.
					Create another session using a different set of user credentials which belongs to a different group/role from the other user and does not have permissions to acquire the subscription (e.g. not an admin)..
					Transfer the subscription.
    Expectation:    TransferSubscription fails with error Bad_UserAccessDenied.
*/

function subscriptionTransferErr010() {

    var result = true;
    addSkipped( "Test script is not available yet. Test case has to be executed manually." )
    return ( result );
}

Test.Execute( { Procedure: subscriptionTransferErr010 } );