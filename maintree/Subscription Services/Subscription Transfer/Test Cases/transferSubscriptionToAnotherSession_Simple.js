/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Create a subscription that is monitoring events and data.
                    Transfer the subscription to another session where the client’s profile does not show support for either “DataChange Subscriber Client Facet” or “Event Subscriber Client Facet”.
    Expectation:    TransferSubscription fails with error Bad_InsufficientClientProfile.
*/

function subscriptionTransfer016() {
    var result = true;
    addSkipped( "Test script is not available yet. Test case has to be executed manually." )
    return ( result );
}

Test.Execute( { Procedure: subscriptionTransfer016 } );