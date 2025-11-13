@ECHO OFF
SET CTT_PATH="C:\Program Files (x86)\OPC Foundation\UA 1.04\Compliance Test Tool\uacompliancetest.exe"
SET SETTINGS_FILE="C:\Users\mouat\Documents\CTT\Serv-Config\Serv-Config.ctt.xml"
SET SELECTION_FILE="C:\Users\mouat\Documents\CTT\Serv-Config\Serv-Config.selection.xml"
SET RESULT_FILE="C:\Users\mouat\Documents\CTT\Serv-Config\Serv-Config.results.xml"

ECHO Running OPC UA Compliance Test Tool...
%CTT_PATH% --close --settings %SETTINGS_FILE% --selection %SELECTION_FILE% --result %RESULT_FILE%

IF %ERRORLEVEL% EQU 1 (
    ECHO Warning detected! Check test results.
) ELSE IF %ERRORLEVEL% EQU 0 (
    ECHO OK, no problems found!
) ELSE IF %ERRORLEVEL% EQU -1 (
    ECHO FAIL, check the logs!
)

PAUSE

