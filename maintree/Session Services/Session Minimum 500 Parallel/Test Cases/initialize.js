include( "./library/Base/safeInvoke.js" );

const MAX_SESSIONS = 950;
if ( Settings.ServerTest.Capabilities.MaxSupportedSessions < MAX_SESSIONS && Settings.ServerTest.Capabilities.MaxSupportedSessions > 0 ) {
    addSkipped("This conformance unit requires a minimum of 500 sessions. As only " + Settings.ServerTest.Capabilities.MaxSupportedSessions + "are configured the conformance unit is skipped.");
    stopCurrentUnit();
}
if( !Test.Connect( { SkipCreateSession: true } ) ) stopCurrentUnit();