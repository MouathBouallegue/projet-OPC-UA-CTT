/*  SettingsValidation.js
    This script will read the Settings configured with the COMPLIANCE project, which is used for compliance testing
    OPC UA Servers. */

include( "./library/ServiceBased/Helpers.js" );
include( "./library/Base/settings.js" );
include( "./library/Information/BuildObjectCacheMap.js" );
include( "./library/Utilities/Profiles.js" );

// Get profiles model to determine selected CUs and needed settings
var profilesHelper   = new ProfilesHelper();
var conformanceModel = profilesHelper.GetModel().ConformanceModel;

var other_than_opcuafx_pubsub_selected = false;

for( var cu=0; cu<conformanceModel.length; cu++ ) {
    if( 
        conformanceModel[cu].State > 0 &&
        conformanceModel[cu].CategoryName != "OPC UA FX" &&
        conformanceModel[cu].CategoryName != "PubSub General"
    ) {
        other_than_opcuafx_pubsub_selected = true;
        break;
    }
}

/* Validation of the settings include:
    . Make sure all REQUIRED settings contain a value 
    . Make sure all numeric values are within a reasonable range
    . NodeIds: minimum number configured, each setting is valid meets criteria
    . Connectivity: channel, session, and related settings
    . NodeIds actually exist and meets criteria
*/

// STEP 1: check all ESSENTIAL settings contain a value 
if( Assert.StringNotNullOrEmpty( Settings.ServerTest.ServerUrl ) ) Assert.True( Settings.ServerTest.ServerUrl.indexOf( "opc.tcp://" ) == 0 || Settings.ServerTest.ServerUrl.indexOf( "https://" ) == 0, "EndpointUrl does not begin with 'opc.tcp://' or 'https://'" )
Assert.StringNotNullOrEmpty( Settings.ServerTest.Session.LoginNameGranted1 );
Assert.StringNotNullOrEmpty( Settings.ServerTest.Session.LoginNameGranted2 );
Assert.StringNotNullOrEmpty( Settings.ServerTest.Session.LoginNameAccessDenied, "/Server Test/Session/LoginNameAccessDenied" );
if( other_than_opcuafx_pubsub_selected ) Assert.StringNotNullOrEmpty( Settings.ServerTest.NodeIds.Paths.StartingNode, "/Server Test/NodeIds/Paths/StartingNode" );
if( other_than_opcuafx_pubsub_selected ) Assert.StringNotNullOrEmpty( Settings.ServerTest.NodeIds.NodeClasses.Variable, "/Server Test/NodeIds/NodeClasses/Variable" );
Assert.StringNotNullOrEmpty( Settings.ServerTest.NodeIds.NodeClasses.Object );

Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTE);
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTEPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha1_1024);
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha1_1024PrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha1_2048 );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha1_2048PrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha256_2048 );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha256_2048PrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha256_4096 );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha256_4096PrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSincorrect );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSincorrectPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSip );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSipPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSuri );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSuriPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTV );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTVPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appUE );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appUEPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1IC_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1IC_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1IC_appTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1IC_appTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1IC_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1IC_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1IC_appUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1IC_appURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_ca2T_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_ca2T_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_ca2T_appTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_ca2T_appTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_ca2T_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_ca2T_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_ca2T_appUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_ca2T_appURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_ca2U_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_ca2U_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_ca2U_appTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_ca2U_appTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_ca2U_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_ca2U_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_ca2U_appUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_ca2U_appURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_ca2I_appT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_ca2I_appTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_ca2I_appTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_ca2I_appTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_ca2I_appU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_ca2I_appUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_ca2I_appUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_ca2I_appURPrivateKey );

Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTE );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTEPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTSincorrect );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTSincorrectPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTV );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrTVPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrUE );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_usrUEPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_usrURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1IC_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1IC_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1IC_usrTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1IC_usrTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1IC_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1IC_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1IC_usrUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1IC_usrURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_usrURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_usrTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_usrTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_usrUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_usrURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1U_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1U_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1U_usrTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1U_usrTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1U_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1U_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1U_usrUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1U_usrURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_ca2T_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_ca2T_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_ca2T_usrTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_ca2T_usrTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_ca2T_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_ca2T_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_ca2T_usrUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1I_ca2T_usrURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_ca2U_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_ca2U_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_ca2U_usrTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_ca2U_usrTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_ca2U_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_ca2U_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_ca2U_usrUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1T_ca2U_usrURPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_ca2I_usrT );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_ca2I_usrTPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_ca2I_usrTR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_ca2I_usrTRPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_ca2I_usrU );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_ca2I_usrUPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_ca2I_usrUR );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.X509UserIdentityCertificates.ctt_ca1TC_ca2I_usrURPrivateKey );

Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ctt_ca1T );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ctt_ca1TPrivateKey );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ctt_ca1TC );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ctt_ca1I );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ctt_ca1IC );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ctt_ca1U );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ctt_ca1T_ca2U );
Assert.StringNotNullOrEmpty( Settings.Advanced.Certificates.ctt_ca1TC_ca2I );

Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.NodeId1 );
Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.NodeId2 );
Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.Unknown1 );
Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.Unknown2 );
Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.Unknown3 );
Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.Unknown4 );
Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.Unknown5 );
Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.Invalid1 );
Assert.StringNotNullOrEmpty( Settings.Advanced.NodeIds.Invalid.Invalid2 );
Assert.StringNotNullOrEmpty( Settings.Discovery.EndpointUrl );

// STEP 2: Numeric Settings have a value within an acceptable range
Assert.InRange( 1, 10001,  Settings.ServerTest.DefaultSubscriptionPublishInterval, "Server Test > Default Subscription Publish Interval" );
Assert.InRange( 0, 30000,  Settings.ServerTest.TimeTolerance,                      "Server Test > Time Tolerance" );
Assert.InRange( 1, 120,    Settings.ServerTest.SubscriptionTimeout,                "Server Test > Subscription Timeout" );
Assert.InRange( 0, 65535,  Settings.ServerTest.Capabilities.MaxStringLength,            "Server Test > Capabilities > Max String Length" );
Assert.InRange( 0, 65535,  Settings.ServerTest.Capabilities.MaxSupportedSubscriptions,  "Server Test > Capabilities > Max Supported Subscriptions" );
Assert.InRange( 0, 65535,  Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems, "Server Test > Capabilities > Max Supported Monitored Items" );
if (Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems < 20 && Settings.ServerTest.Capabilities.MaxSupportedMonitoredItems != 0) addWarning("Server Test > Capabilities > Max Supported Monitored Items is small (<20). Some tests might be skipped, because they can't load enough items from the settings.");
Assert.InRange(0, 65535, Settings.ServerTest.Capabilities.RetransmissionQueueSizePerSession, "Server Test > Capabilities > Retransmission QeueSize per Session");
if (Settings.ServerTest.Capabilities.RetransmissionQueueSizePerSession == 0) addWarning("RetransmissionQueueSizePerSession = 0 is only allowed for Micro and Nano Device Server Profiles!");
Assert.InRange( 0, 30000,  Settings.ServerTest.Capabilities.FastestPublishIntervalSupported,    "Server Test > Capabilities > Fastest Publishing Interval Supported" );
Assert.InRange( 0, 30000,  Settings.ServerTest.Capabilities.FastestSamplingIntervalSupported,   "Server Test > Capabilities > Fastest Sampling Interval Supported" );
Assert.InRange( 0, 1000,   Settings.ServerTest.Capabilities.MaxPublishRequestsPerSession,       "Server Test > Capabilities > Max Publish Requests per Session" );
Assert.InRange( 0, 65535,  Settings.ServerTest.Capabilities.MaxSecureChannels,                  "Server Test > Capabilities > Max Secure Channels" );
Assert.InRange( 1, 120000, Settings.ServerTest.SecureChannel.NetworkTimeout,     "Server Test > Secure Channel > Network Timeout" );
Assert.InRange( 0, 2,      Settings.ServerTest.Session.UserAuthenticationPolicy, "Server Test > Session > User Authentication Policy" );

// STEP 3: NodeIds are configured (some settings are absolutely required)
if( other_than_opcuafx_pubsub_selected ) Assert.GreaterThan( 0, MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings ).length, "No scalar nodes defined. Check settings: Server Test > NodeIds > Static > All Profiles > Scalar" );
if( other_than_opcuafx_pubsub_selected ) Assert.GreaterThan( 0, MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.References.Settings ).length, "No reference nodes defined. Check settings: Server Test > NodeIds > References" );
Assert.GreaterThan( 0, MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.NodeClasses.Settings ).length, "No node classes defined. Check settings: Server Test > NodeIds > NodeClasses" );

// STEP 4: Connect to the Server using the endpoint and session settings (default connectivity)
function checkAccessRights( items, settingsName ) {
    if( items === undefined || items === null ) return;
    for( item in items ) items[item].AttributeId = Attribute.Value;
    Assert.True( ReadHelper.Execute( { NodesToRead:  items } ), settingsName + ": some can't be read" );
    for( item in items ) items[item].AttributeId = Attribute.AccessLevel;
    if( Assert.True( ReadHelper.Execute( { NodesToRead:  items } ), settingsName + ": some AccessLevel's couldn't be read" ) ) {
        for( item in items ) {
            if( ( AccessLevel.CurrentRead | AccessLevel.CurrentWrite ) != ( items[item].Value.Value.toByte() & ( AccessLevel.CurrentRead | AccessLevel.CurrentWrite ) ) ) {
                addWarning( "Item '" + items[item].NodeId + "' (Setting: " + items[item].NodeSetting + ") is (" + items[item].Value.Value.toByte() + ") not ReadAndWrite (" + ( AccessLevel.CurrentRead | AccessLevel.CurrentWrite ) + ")" );
            }
        }
    }
}

Test.ConnectAudit( enableAuditing );
Test.Audit.StartPublish();

if( Test.Connect() ) {

    // STEP 5: Check all NodeIds actually exist.
    var items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings );
    if( items.length > 0 ) checkAccessRights( items, "Scalar Nodes" );
    items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.Settings );
    if( items.length > 0 ) checkAccessRights( items, "Scalar Array Nodes" );
    items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.DataItemType.Settings );
    if( items.length > 0 ) checkAccessRights( items, "Data Item Nodes" );
    items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemType.Settings );
    if( items.length > 0 ) checkAccessRights( items, "Analog Type Nodes" );
    items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemTypeArrays.Settings );
    if( items.length > 0 ) checkAccessRights( items, "Analog Type Nodes" );
    items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.DiscreteItemType.Settings );
    if( items.length > 0 ) checkAccessRights( items, "Discrete Type Nodes" );
    items =  MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.MultiStateValueDiscreteType.Settings )
    if( items.length > 0 ) checkAccessRights( items, "MultiStateValueDiscrete Type Nodes" );
    items =  MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.DAProfile.ArrayItemType.Settings )
    if( items.length > 0 ) checkAccessRights( items, "ArrayItem Type Nodes" );
    items =  MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.HAProfile.Scalar.Settings )
    if( items.length > 0 ) checkAccessRights( items, "History Scalar Nodes" );
    items =  MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.HAProfile.Arrays.Settings )
    if( items.length > 0 ) checkAccessRights( items, "History Array Nodes" );
    items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.HAProfile.AccessRights.Settings )
    if( items.length > 0 ) {
        var expectedResults = [];
        for( item in items ) {
            items[item].AttributeId = Attribute.Value;
            // Items that shall not be readable
            if( items[item].NodeSetting == "/Server Test/NodeIds/Static/HA Profile/AccessRights/AccessLevel_WriteOnly" ||
                items[item].NodeSetting == "/Server Test/NodeIds/Static/HA Profile/AccessRights/AccessLevel_None" ||
                items[item].NodeSetting == "/Server Test/NodeIds/Static/HA Profile/AccessRights/UserAccessLevel_WriteOnly" ||
                items[item].NodeSetting == "/Server Test/NodeIds/Static/HA Profile/AccessRights/UserAccessLevel_None" ) {
                expectedResults.push( new ExpectedAndAcceptedResults( [StatusCode.BadUserAccessDenied, StatusCode.BadNotReadable] ) );
            }
            // Items that need to be readable
            if( items[item].NodeSetting == "/Server Test/NodeIds/Static/HA Profile/AccessRights/AccessLevel_ReadOnly" ) {
                expectedResults.push( new ExpectedAndAcceptedResults( [StatusCode.BadUserAccessDenied, StatusCode.BadNotReadable] ) );
            }
            // Items that can be readable
            else expectedResults.push( new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadUserAccessDenied, StatusCode.BadNotReadable] ) );
        }
        Assert.True( ReadHelper.Execute( { NodesToRead: items, OperationResults: expectedResults } ), "History AccessRights Nodes: unexpected result when reading the nodes. Please check CTT configuration." );
    }
    items =  MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.References.Settings )
    for( var i in items ) items[i].AttributeId = Attribute.BrowseName;
    if( items.length > 0 ) Assert.True( ReadHelper.Execute( { NodesToRead: items } ), "References Nodes: some can't be read" );
    items =  MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.NodeClasses.Settings )
    for( item in items ) items[item].AttributeId = Attribute.NodeId;
    if( items.length > 0 ) Assert.True( ReadHelper.Execute( { NodesToRead: items } ), "NodeClasses Nodes: some can't be read" );
    items =  MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.SecurityAccess.Settings )
    if( items.length > 0 ) {
        var expectedResults = [];
        for( item in items ) {
            items[item].AttributeId = Attribute.Value;
            // Items that shall not be readable
            if( items[item].NodeSetting == "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentRead_NotUser" ||
                items[item].NodeSetting == "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentWrite_NotCurrentRead" ) {
                expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.BadUserAccessDenied, StatusCode.BadNotReadable ] ) );
            }
            // Items that need to be readable
            else if( items[item].NodeSetting == "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentRead" ||
                     items[item].NodeSetting == "/Server Test/NodeIds/SecurityAccess/AccessLevel_CurrentRead_NotCurrentWrite" ) {
                expectedResults.push( new ExpectedAndAcceptedResults( StatusCode.Good ) );
            }
            // Items that can be readable
            else expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadUserAccessDenied, StatusCode.BadNotReadable ] ) );
        }
        Assert.True( ReadHelper.Execute( { NodesToRead: items, OperationResults: expectedResults } ), "SecurityAccess Nodes: some can't be read" );
    }
    items =  MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Methods.Settings )
    for( item in items ) items[item].AttributeId = Attribute.BrowseName;
    if( items.length > 0 ) Assert.True( ReadHelper.Execute( { NodesToRead: items } ), "Methods Nodes: some can't be read" );

    ClearModelCacheHelper.Execute();
    ClearRawDataCacheHelper.Execute();

    Test.Disconnect();
    BuildCacheMapServiceHelper = new BuildCacheMapService();
    BuildCacheMapServiceHelper.Execute();
}
else stopCurrentUnit();