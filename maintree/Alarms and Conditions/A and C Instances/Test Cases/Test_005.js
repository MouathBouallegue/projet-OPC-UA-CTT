/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Instances/Level/Test Cases/Test_005.js

    Description:    
        1	Time Shelve an Alarm from an instance
        2	Unshelve the Alarm from an instance
        3	One shot shelve the alarm from an instance
        4	Unshelve the Alarm from an instance

    Test Requirements:
        Alarm supports shelving, skip if instance does not support it 

    Expectation:
        1   The statemachine variable exposes the correct values 
        2   The statemachine variable exposes the correct values 
        3   The statemachine variable exposes the correct values 
        4   The statemachine variable exposes the correct values 
    
*/

function Test_005 () {

    this.TestName = "Test_005";

    this.States = {
        Initial: "Initial",
        TimedShelved: "TimedShelved",
        TimedUnshelved: "TimedUnshelved",
        OneShot: "OneShot",
        OneShotUnshelved: "OneShotUnshelved",
        RequiresUnshelve: "RequiresUnshelve",
        Failed: "Failed",
        UnusableState: "UnusableState",
        Completed: "Completed"
    }

    this.ShelvingStateNames = new KeyPairCollection();

    this.TestCaseMap = new KeyPairCollection();
    this.TimeToShelve = 30000;
    this.TimedShelveParameter = null;

    this.Unshelved = new UaNodeId( Identifier.ShelvedStateMachineType_Unshelved );
    this.TimedShelved = new UaNodeId( Identifier.ShelvedStateMachineType_TimedShelved );
    this.OneShotShelved = new UaNodeId( Identifier.ShelvedStateMachineType_OneShotShelved );

    this.ModelMapHelper = null;

    this.Initialize = function ( collector ) {
        this.ShelvingStateNames.Set( this.Unshelved.toString(), "Unshelved" );
        this.ShelvingStateNames.Set( this.TimedShelved.toString(), "TimedShelved" );
        this.ShelvingStateNames.Set( this.OneShotShelved.toString(), "OneShotShelved" );

        var alarmTester = collector.GetAlarmTester();
        this.ModelMapHelper = alarmTester.GetAlarmUtilities().GetModelMapHelper();

        var typesToNotIgnore = [];

        var alarmTypes = alarmTester.GetSupportedAlarmTypes();
        var conditionType = new UaNodeId( Identifier.ConditionType ).toString();
        var acknowledgeableConditionType = new UaNodeId( Identifier.AcknowledgeableConditionType ).toString();
        alarmTypes.Iterate( function( alarmTypeString, alarmTypeObject ) {
            if ( alarmTypeObject.SpecAlarmTypeId != conditionType && 
                alarmTypeObject.SpecAlarmTypeId != acknowledgeableConditionType ){
                    typesToNotIgnore.push( alarmTypeString );
            }
        });

        collector.AddIgnoreSkips( typesToNotIgnore, this.TestName );
    }


    this.TestEvent = function ( eventFields, testCase, collector ) {
        if ( !this.CanRunTest( eventFields, collector ) ) {
            return;
        }

        var conditionId = collector.GetConditionId( eventFields );
        var conditionIdString = conditionId.toString();

        if ( !this.TestCaseMap.Contains( conditionIdString ) ) {

            var testCaseObject = {
                ConditionId: conditionId,
                State: this.States.Initial,
                TestCase: testCase,
                Instance: collector.GetInstance( eventFields ),
                ShelvingState: null,
                OneShotShelve: null,
                TimedShelve: null,
                Unshelve: null,
                LastTransition: null,
                CurrentState: null,
                Id: null
            };

            this.TestCaseMap.Set( conditionIdString, testCaseObject );

            if ( !this.GetNodeIds( testCaseObject ) ) {
                collector.Error( this.TestName, conditionId, testCaseObject, this.States.Failed,
                    "Unable to retrieve node Ids required for test" );
                return;
            }
        }

        var localTestCase = this.TestCaseMap.Get( conditionIdString );
        var alarmShelvingState = collector.GetSelectField( eventFields, "ShelvingState.CurrentState" );
        var currentShelvingState = collector.GetSelectField( eventFields, "ShelvingState.CurrentState.Id" ).toNodeId();
        if ( !isDefined( currentShelvingState ) ) {
            collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                "Unable to retrieve current shelving state" );
            return;
        }

        print( this.TestName + ":" + conditionIdString + " state " + localTestCase.State + " Shelving State " + alarmShelvingState.toString() );

        if ( localTestCase.State == this.States.Initial ) {
            if ( currentShelvingState.equals( this.Unshelved ) && collector.IsActive( eventFields ) ) {
                var status = collector.Call( {
                    MethodsToCall: [ {
                        MethodId: localTestCase.TimedShelve,
                        ObjectId: localTestCase.ShelvingState,
                        InputArguments: [ this.GetTimeParameter() ]
                    } ],
                    SuppressMessaging: true
                } );

                if ( status.isGood() ) {
                    localTestCase.State = this.States.TimedShelved;
                } else {
                    collector.Error( this.TestName, conditionId, localTestCase, this.States.Failed,
                        "Unable to TimeShelve " + status.toString() );
                }
            } else {
                collector.Skip( this.TestName, conditionId, localTestCase, this.States.UnusableState );
            }
        } else if ( localTestCase.State == this.States.TimedShelved ) {
            this.TestState( currentShelvingState,
                this.TimedShelved,
                localTestCase,
                collector,
                localTestCase.Unshelve,
                "Unshelve",
                this.States.TimedUnshelved );
        } else if ( localTestCase.State == this.States.TimedUnshelved ) {
            this.TestState( currentShelvingState,
                this.Unshelved,
                localTestCase,
                collector,
                localTestCase.OneShotShelve,
                "OneShotShelved",
                this.States.OneShot );
        } else if ( localTestCase.State == this.States.OneShot ) {
            this.TestState( currentShelvingState,
                this.OneShotShelved,
                localTestCase,
                collector,
                localTestCase.Unshelve,
                "Unshelve",
                this.States.OneShotUnshelved );
        } else if ( localTestCase.State == this.States.OneShotUnshelved ) {
            this.TestState( currentShelvingState,
                this.Unshelved,
                localTestCase,
                collector,
                null,
                "",
                this.States.Completed );

            if ( localTestCase.State == this.States.Completed ) {
                collector.AddMessage( localTestCase.TestCase, collector.Categories.Activity,
                    this.TestName + ":" + conditionIdString + " Test Completed" );
                localTestCase.TestCase.TestsPassed++;
                collector.TestCompleted( conditionId, this.TestName );
            }
        }
    }

    this.CanRunTest = function ( eventFields, collector ) {
        var canRun = false;
        var conditionId = collector.GetConditionId( eventFields );
        if ( collector.CanRunTest( conditionId, this.TestName ) ) {
            var instance = collector.GetInstance( eventFields );
            var unshelveTime = collector.GetSelectField( eventFields, "ShelvingState.UnshelveTime" );
            var maxShelveTime = this.GetMaxTimeShelved( eventFields, collector );
            if ( isDefined( instance ) &&
                maxShelveTime > this.TimeToShelve &&
                unshelveTime.DataType != 0 ) {
                canRun = true;
            } else {
                // Not necessary unless more tests are added
                collector.TestCompleted( conditionId, this.TestName );
            }
        }

        return canRun;
    }

    this.TestState = function ( currentShelvingState, expectedState, localTestCase, collector, methodId, methodName, nextState ) {
        var failedState = this.States.Failed;
        if ( expectedState.equals( this.Unshelved ) ) {
            failedState = this.States.RequiresUnshelve;
        }

        if ( currentShelvingState.equals( expectedState ) ) {
            var callStatus = true;
            if ( isDefined( methodId ) ) {
                var status = collector.Call( {
                    MethodsToCall: [ {
                        MethodId: methodId,
                        ObjectId: localTestCase.ShelvingState
                    } ],
                    SuppressMessaging: true
                } );

                collector.DebugPrint(this.TestName + ":" + localTestCase.ConditionId.toString() + " state " + localTestCase.State +
                    " calling " + methodId.toString() + " result [" + status.toString() + "]" );

                if ( !status.isGood() ) {
                    collector.Error( this.TestName, localTestCase.ConditionId, localTestCase, failedState,
                        "Unable to " + methodName + ": " + status.toString() );
                    callStatus = false;
                }
            }

            if ( callStatus ) {
                localTestCase.State = nextState;
            }
        } else {
           
            collector.Error( this.TestName, localTestCase.ConditionId, localTestCase, failedState,
                "Invalid Shelving State, expected [" + this.GetReadableStateName( expectedState ) + 
                "] Actual [" + this.GetReadableStateName( currentShelvingState.toString() ) + "]" );
        }
    }

    this.GetReadableStateName = function( state ){
        var name = this.ShelvingStateNames.Get( state );
        if ( !isDefined( name ) ){
            name = state;
        }
        return name;
    }

    this.Shutdown = function ( collector ) {
        // try one last time to unshelve everything.  Don't care about the results.
        var methods = [];

        var states = this.States;
        this.TestCaseMap.Iterate( function ( conditionIdString, localTestCase ) {
            if ( localTestCase.State == states.RequiresUnshelve ||
                localTestCase.State == states.TimedShelved ||
                localTestCase.State == states.OneShot ) {
                collector.AddMessage( localTestCase.TestCase, collector.Categories.Activity,
                    conditionIdString + " Requires Unshelving at shutdown, current state = " + localTestCase.State );

                    methods.push( {
                        MethodId: localTestCase.Unshelve,
                        ObjectId: localTestCase.ConditionId
                } );
            }
        } );

        if ( methods.length > 0 ) {
            collector.Call( {
                MethodsToCall: methods,
                SuppressMessaging: true
            } );
        }
    }

    this.GetTimeParameter = function () {

        if ( !isDefined( this.TimedShelveParameter ) ) {
            this.TimedShelveParameter = new UaVariant();
            this.TimedShelveParameter.setDouble( this.TimeToShelve );
        }

        return this.TimedShelveParameter;
    }

    this.GetMaxTimeShelved = function ( eventFields, collector ) {
        var maxTime = Number.MAX_VALUE;

        var maxTimeShelved = collector.GetSelectField( eventFields, "MaxTimeShelved" );
        if ( maxTimeShelved.DataType == BuiltInType.Double ) {
            maxTime = maxTimeShelved.toDouble();
        }

        return maxTime;
    }

    this.GetNodeIds = function ( localTestCase ) {
        var success = false;

        var instanceReferenceDescriptions = localTestCase.Instance.ReferenceDescriptions;

        var instanceSearchDefinitions = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "ShelvingState" } )
            } ];

        this.ModelMapHelper.FindReferences( instanceReferenceDescriptions, instanceSearchDefinitions );

        if ( this.FillValue( localTestCase, instanceReferenceDescriptions, instanceSearchDefinitions[ 0 ] ) ) {
            var shelvingStateModel = this.ModelMapHelper.GetModelMap().Get( localTestCase.ShelvingState );
            if ( isDefined( shelvingStateModel ) ) {
                var shelvingStateSearchDefinitions = [
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "CurrentState" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "OneShotShelve" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "TimedShelve" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Unshelve" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "LastTransition" } )
                    } ];

                this.ModelMapHelper.FindReferences( shelvingStateModel.ReferenceDescriptions, shelvingStateSearchDefinitions );
                var shelvingStateSuccess = true;
                for ( var index = 0; index < shelvingStateSearchDefinitions.length; index++ ) {
                    if ( !this.FillValue( localTestCase, shelvingStateModel.ReferenceDescriptions, shelvingStateSearchDefinitions[ index ] ) ) {
                        shelvingStateSuccess = false;
                    }
                }

                if ( shelvingStateSuccess ) {
                    var currentStateModel = this.ModelMapHelper.GetModelMap().Get( localTestCase.CurrentState );
                    if ( isDefined( currentStateModel ) ) {
                        var idSearchDefinitions = [
                            {
                                ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                                IsForward: true,
                                BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Id" } )
                            } ];
                        this.ModelMapHelper.FindReferences( currentStateModel.ReferenceDescriptions, idSearchDefinitions );
                        if ( this.FillValue( localTestCase, currentStateModel.ReferenceDescriptions, idSearchDefinitions[ 0 ] ) ) {
                            success = true;
                        }
                    }
                }
            }
        }

        return success;
    }

    this.FillValue = function ( localTestCase, referenceDescriptions, searchDefinition ) {
        var success = false;

        if ( isDefined( searchDefinition.ReferenceIndex ) ) {
            localTestCase[ searchDefinition.BrowseName.Name ] =
                referenceDescriptions[ searchDefinition.ReferenceIndex ].NodeId.NodeId;
            success = true;
        }

        return success;
    }

    this.CheckResults = function () {

        return CUVariables.AlarmCollector.CheckResults( this.TestName, CUVariables.PrintResults );
    }

    if ( isDefined( CUVariables.AutoRun ) ) {
        if ( !CUVariables.AutoRun ) {
            CUVariables.AlarmCollector.RunSingleTest( CUVariables, this.TestName, this );
            return this.CheckResults();
        } else if ( CUVariables.CheckResults ) {
            return this.CheckResults();
        }
    }
}

if ( isDefined( CUVariables.AutoRun ) ) {
    if ( !CUVariables.AutoRun ) {
        Test.Execute( { Procedure: Test_005 } );
    } else if ( CUVariables.CheckResults ) {
        Test.Execute( { Procedure: Test_005 } );
    }
}



