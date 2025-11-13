// Don't think this is needed

if ( isDefined( CUVariables.Refresh.Test_006_ShutdownThread ) &&
    CUVariables.Refresh.Test_006_ShutdownThread == true ) {
    CUVariables.Refresh.Test_006_ExtraAlarmThread.End();
}

if ( isDefined( CUVariables.Refresh.Test_008_ShutdownThread ) &&
    CUVariables.Refresh.Test_008_ShutdownThread == true ) {
    CUVariables.Refresh.Test_008_ExtraAlarmThread.End();
}