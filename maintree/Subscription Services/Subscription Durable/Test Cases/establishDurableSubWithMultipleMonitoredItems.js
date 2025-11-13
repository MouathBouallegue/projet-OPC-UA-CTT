/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description: Establish a durable subscription with multiple monitored items. Shutdown the server and restart it. Reclaim the subscription, and check the status of the subscription.
    Expectation: Subscription exists and all subscription/monitoredItems settings are preserved.
*/
addSkipped( "This is a manual test case because it needs a restart of the server." );