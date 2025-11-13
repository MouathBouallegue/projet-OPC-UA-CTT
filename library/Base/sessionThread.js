include( "./library/Base/sessionCreator.js" );
include( "./library/Base/threadHelper.js" );

/*
    A Generic Class to instantiate a new channel, session, and thread.
*/

function SessionThread() {

    this.Channel = null;
    this.Session = null;
    this.DiscoverySession = null;
    this.ThreadId = 0;
    this.Started = false;
    this.Helpers = null;

    this.Start = function ( args ) {
        var started = false;
        var connected = false;

        if ( isDefined( args ) && isDefined( args.Session ) ) {
            this.Session = args.Session;
            connected = true;
        } else {
            if ( this.Connect( args ) ) {
                connected = true;
            }
        }

        if ( connected ) {
            this.Helpers = new ThreadHelper( { ThreadSession: this.Session } );
            if ( this.CreateThread() ) {
                this.Started = true;
                started = true;
            }
        }

        return started;
    }

    this.End = function () {
        if ( this.Started ) {
            this.StopThread();
        }
        this.Disconnect();
        return true;
    }



    this.Connect = function ( args ) {

        var connectResult = SessionCreator.Connect( args );

        if ( connectResult.result === false ) {
            return false;
        }

        if ( isDefined( connectResult.channel ) ) {
            this.Channel = connectResult.channel;
        }

        if ( isDefined( connectResult.session ) ) {
            this.Session = connectResult.session;
        }

        if ( isDefined( connectResult.discoverySession ) ) {
            this.DiscoverySession = connectResult.discoverySession;
        }

        return true;
    }

    this.Disconnect = function ( args ) {
        // The thread could just be added to an existing session. 
        // In these cases, let the normal disconnect happen.
        if ( this.Channel != null ) {
            if ( !isDefined( args ) ) args = new Object();
            args.channel = this.Channel;
            args.session = this.Session;
            var disconnectResult = SessionCreator.Disconnect( args );
        }

        this.Channel = null;
        this.Session = null;
        this.DiscoverySession = null;
        this.ThreadId = 0;
        this.Started = false;
        this.Helpers = null;

        return disconnectResult;
    }

    this.CreateThread = function ( args ) {
        var created = false;
        var args = new Object();
        args.ThreadId = 0;
        var startThreadResult = this.Helpers.StartThreadSessionHelper.Execute( args );
        if ( startThreadResult.status ) {
            print( "SessionThread::CreateThread Started Successfully" );
            this.ThreadId = startThreadResult.threadId;
            created = true;
        } else {
            print( "SessionThread::CreateThread Started Failed!" );
        }

        return created;
    }

    this.StopThread = function () {
        var stopThreadArgs = new Object();
        stopThreadArgs.Session = this.Session;
        stopThreadArgs.ThreadId = this.ThreadId;
        var stopThreadResult = this.Helpers.StopThreadHelper.Execute( stopThreadArgs );
        if ( stopThreadResult ) {
            print( "SessionThread::StopThread thread stopped successfully " );
            this.Started = false;
        } else {
            print( "SessionThread::StopThread thread failed to stop" );
        }
    }

    this.StartPublish = function ( args ) {
        var started = false;

        if ( this.ThreadId > 0 && this.Started ) {
            if ( !isDefined( args ) ) {
                args = new Object();
            }
            args.ThreadId = this.ThreadId;
            var startPublishResult = this.Helpers.StartThreadPublishHelper.Execute( args );

            if ( startPublishResult ) {
                print( "SessionThread::StartPublish Started Successfully" );
                started = true;
            } else {
                print( "SessionThread::StartPublish Started Failed!" );
            }
        } else {
            print( "SessionThread::StartPublish called without a thread created" );
        }
        return started;
    }

    this.ClearThreadData = function ( args ) {
        var argsToSend = args;
        if ( !isDefined( args ) ) {
            // Delete all
            args = new Object();
            args.ThreadId = this.ThreadId;
            args.SubscriptionId = 0;
            args.ClearEvents = true;
            args.ClearExpectedEvents = true;
            args.ClearData = true;
            args.ClientId = 0;
            args.ClearStatistics = true;
        }

        return this.Helpers.ClearThreadDataHelper.Execute( args );
    }

    this.GetDataValues = function ( args ) {

        if ( isDefined( args ) && isDefined( args.SubscriptionId ) && isDefined( args.ClientId ) ) {
            if ( this.Started === true ) {
                if ( !isDefined( args.ThreadId ) ) {
                    args.ThreadId = this.ThreadId;
                }

                var results = this.Helpers.GetDataValuesHelper.Execute( args );

                if ( results.status === true ) {
                    print( 'SessionThread::GetDataValues succeeded' );
                } else {
                    print( 'SessionThread::GetDataValues failed' );
                }

                return results;

            } else {
                print( 'SessionThread::GetDataValues failed due to no thread started' );
            }
        } else {
            print( 'SessionThread::GetDataValues failed on bad args' );
        }

        return { status: false, values: null };
    }

    this.GetThreadPublishStatistics = function () {

        if ( this.Started === true ) {
            var results = this.Helpers.GetThreadPublishStatisticsHelper.Execute( {
                ThreadId: this.ThreadId
            } );

            if ( results.status === true ) {
                print( 'SessionThread::GetThreadPublishStatistics succeeded' );
            } else {
                print( 'SessionThread::GetThreadPublishStatistics failed' );
            }

            return results;

        } else {
            print( 'SessionThread::GetThreadPublishStatistics failed due to no thread started' );
        }

        return { status: false, statistics: null };
    }

    this.PausePublish = function () {
        return this.PausePublishInternal( "PausePublish", true );
    }

    this.ResumePublish = function () {
        return this.PausePublishInternal( "ResumePublish", false );
    }

    this.PausePublishInternal = function ( name, pause ) {
        // Pause = true
        // resume = false
        var success = false;

        if ( this.Started === true ) {

            success = this.Helpers.PausePublishHelper.Execute(
                {
                    ThreadId: this.ThreadId,
                    Pause: pause
                }
            );

            if ( success === true ) {
                print( "SessionThread::" + name + " succeeded" );
            } else {
                print( "SessionThread::" + name + " failed" );
            }

        } else {
            print( "SessionThread::" + name + " failed due to thread not started" );
        }

        return success;
    }

    this.PublishStoreData = function( publish ){
        var success = false;

        if ( this.Started === true ) {

            success = this.Helpers.PublishStoreDataHelper.Execute(
                {
                    ThreadId: this.ThreadId,
                    Publish: publish
                }
            );

            if ( success === true ) {
                print( "SessionThread::PublishStoreData succeeded" );
            } else {
                print( "SessionThread::PublishStoreData failed" );
            }

        } else {
            print( "SessionThread::PublishStoreData failed due to thread not started" );
        }

        return success;
    }

    this.ClearPublishData = function( ){
        var success = false;

        if ( this.Started === true ) {

            success = this.Helpers.ClearPublishDataHelper.Execute(
                {
                    ThreadId: this.ThreadId
                }
            );

            if ( success === true ) {
                print( "SessionThread::ClearPublishData succeeded" );
            } else {
                print( "SessionThread::ClearPublishData failed" );
            }

        } else {
            print( "SessionThread::ClearPublishData failed due to thread not started" );
        }

        return success;
    }

    this.GetPublishData = function( clear ){
        var success = { status : false, values : null };

        if ( this.Started === true ) {

            success = this.Helpers.GetPublishDataHelper.Execute(
                {
                    ThreadId: this.ThreadId,
                    Clear: clear
                }
            );

            if ( success.status === true ) {
                print( "SessionThread::GetPublishData succeeded" );
            } else {
                print( "SessionThread::GetPublishData failed" );
            }

        } else {
            print( "SessionThread::GetPublishData failed due to thread not started" );
        }

        return success;
    }


};

