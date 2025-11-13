/**
 * Helper to launch and retrieve Script Message Boxes
 */
function DialogCallHelper () {

    /**
     * @typedef {object} DialogResult
     * @property {number} State - Index MessageBoxResultIndex.State - Current State of the dialog - Unknown, Waiting, Complete
     * @property {number} Id - Index MessageBoxResultIndex.Id - Current Id of the dialog, used for retrieving Async results
     * @property {number} Button - Index MessageBoxResultIndex.Button - Button pressed in the dialog
     * @property {string} Text - Index MessageBoxResultIndex.Text - Text captured by the dialog
     */


    /**
     * Show a Message Box
     * Required Parameters
     * Title - Title of the message box
     * Message - Message for the messsage box
     * Optional parameters
     * Buttons - Supported Button.NoButton, Button.Ok, Button.Cancel, Button.Yes, Button.No
     * Async - 0 for Sync, 1 for Async
     * BlockMode - Required for Async, where should the dialog be blocked in the script operation - See structure MessageBoxBlockState
     * DialogStyle - Default is simple MessageBoxCapture.MessageBox, also supports MessageBoxCapture.TextCapture, MessageBoxCapture.CharacterCapture
     * AcceptedCharacters - Required for MessageBoxCapture.CharacterCapture
     * Image - Path to image file.  Can be Full path, path relative to CTT Executable, or relative to project
     * @param {object} args 
     * @returns {DialogResult}
     */
    this.Execute = function ( args ) {

        //#region Initialize

        if ( !isDefined( args ) ) throw ( "DialogHelper.js::Execute() args not specified." );
        if ( !isDefined( args.Title ) ) throw ( "DialogHelper.js::Execute() Title not specified." );
        if ( !isDefined( args.Message ) ) throw ( "DialogHelper.js::Execute() Message not specified." );

        var title = args.Title;
        var message = args.Message;
        var buttons = this.GetProperty( args, "Buttons", Button.NoButton );
        var async = this.GetProperty( args, "Async", 0 );
        var blockMode = this.GetProperty( args, "BlockMode", MessageBoxBlockState.None );
        var dialogStyle = this.GetProperty( args, "DialogStyle", MessageBoxCapture.MessageBox );
        var acceptedCharacters = this.GetProperty( args, "AcceptedCharacters", "" );
        var image = this.GetProperty( args, "Image", "" );

        //#endregion

        //#region Check Rules

        // 1.) Async must have a block rule
        if ( async ) {
            if ( blockMode == MessageBoxBlockState.None || blockMode > MessageBoxBlockState.Run ) {
                throw ( "Async MessageBoxes must have a BlockState" );
            }
        }

        // 2.) DialogStyle of MessageBoxCapture.CharacterCapture must have AcceptedCharacters
        if ( dialogStyle == MessageBoxCapture.CharacterCapture ) {
            if ( !isDefined( acceptedCharacters ) || !isDefined( acceptedCharacters.length ) || acceptedCharacters.length <= 0 ) {
                throw ( "Character Capture MessageBoxes must have Accepted Characters" );
            }
        } else if ( dialogStyle > MessageBoxCapture.CharacterCapture ) {
            throw ( "Invalid DialogStyle" );
        }

        // 3.) Capture Text must have Buttons
        if ( dialogStyle == MessageBoxCapture.TextCapture ) {
            if ( !isDefined( buttons ) || buttons == 0 ) {
                throw ( "Text Capture MessageBoxes must have a success button" );
            }
        } else if ( dialogStyle > MessageBoxCapture.Capture ) {
            throw ( "Invalid TextCapture" );
        }

        //#endregion

        var response = launchMessageBox(
            title,
            message,
            buttons,
            async,
            blockMode,
            dialogStyle,
            acceptedCharacters,
            image );

        if ( !isDefined( response ) ) {
            throw ( "Launch of MessageBox resulted in Syntax error" );
        }

        return response;
    }

    /**
     * Retrieves a specific argument property with a default value if not found
     * @param {object} args Arguments passed in to Execute
     * @param {string} property Desired Property to find
     * @param {object} defaultValue default value for the property if not found
     * @returns {object} value for the property
     */
    this.GetProperty = function ( args, property, defaultValue ) {
        var returnValue = defaultValue;
        var numeric = this.IsNumeric( defaultValue );

        if ( isDefined( args ) && isDefined( args[ property ] ) ) {
            var propertyValue = args[ property ];
            var propertyNumeric = this.IsNumeric( propertyValue );
            if ( propertyNumeric == numeric ) {
                returnValue = propertyValue;
            }
        }

        return returnValue;
    }

    /**
     * Determines if a value is numeric
     * Only used for strings and numbers in the context of this object
     * @param {object} value value to determine datatype
     * @returns true if numeric, fals if string
     */
    this.IsNumeric = function ( value ) {
        var numeric = false;
        if ( typeof ( defaultValue ) == "number" ) {
            numeric = true;
        }
        return numeric;
    }

    /**
     * Helper method to execute a specific custom user script, or a dialog to provide instruction for user input
     * Required Parameters
     * Title - Title of MessageBox
     * Message - Message of MessageBox
     * Script - Script to execute to see if there is an automated operation
     * Optional - see Execute function
     * @param {object} args parameters for the function
     */
    this.ExecuteAutomation = function ( args ) {
        if ( !isDefined( args ) ) throw ( "DialogHelper.js::ExecuteAutomation() args not specified." );
        if ( !isDefined( args.Title ) ) throw ( "DialogHelper.js::ExecuteAutomation() Title not specified." );
        if ( !isDefined( args.Message ) ) throw ( "DialogHelper.js::ExecuteAutomation() Message not specified." );
        if ( !isDefined( args.Script ) ) throw ( "DialogHelper.js::ExecuteAutomation() Script not specified." );

        Test.UserCustomResult = false;

        include( args.Script );

        if ( !Test.UserCustomResult ) {
            launchMessageBox( args.Title, args.Message );
        }
    }

    /**
     * Wait for an async MessageBox to complete
     * @param {DialogResult} dialogHolder the result of the initial launch of the dialog, the Id is used to retrieve the current state
     * @returns {DialogResult} the final result of the async dialog
     */
    this.WaitForSingleDialog = function ( dialogHolder ) {
        debugger;
        if ( !isDefined( dialogHolder ) ) throw ( "DialogHelper.js::WaitForDialog() dialogHolder not specified." );
        if ( !isDefined( dialogHolder.length ) || dialogHolder.length != MessageBoxResultIndex.Length ) {
            throw ( "DialogHelper.js::WaitForDialog() dialogHolder not a valid dialog holder." );
        }

        var keepWaiting = true;
        var id = dialogHolder[ MessageBoxResultIndex.Id ];
        var waitInterval = 250;
        var printInterval = 5000;
        var currentInterval = 0;
        var returnResult = null;
        while ( keepWaiting ) {

            var responseArray = retrieveMessageBox( [ id ] );

            if ( isDefined( responseArray ) && isDefined( responseArray.length ) ) {
                var response = responseArray[ 0 ];

                if ( response.length == MessageBoxResultIndex.Length ) {
                    var state = response[ MessageBoxResultIndex.State ];
                    if ( state == MessageBoxState.Complete ) {
                        returnResult = response;
                        keepWaiting = false;
                    } else if ( state == MessageBoxState.Waiting ) {
                        wait( waitInterval );
                        currentInterval += waitInterval;
                        if ( currentInterval >= printInterval ) {
                            currentInterval = 0;
                            print( "Close MessageBox to continue" );
                        }
                    } else {
                        throw ( "Unexpected MessageBoxState [" + this.GetMessageBoxState( state ) +
                            "]from retrieveMessageBox, Validate Implementation" );
                    }
                }
            }
        }

        return returnResult;
    }

    /**
     * Retrieve a user friendly string for the MessageBoxState
     * @param {number} state current state found in DialogResult[ MessageBoxResultIndex.State ]
     * @returns {string} user friendly string
     */
    this.GetMessageBoxState = function ( state ) {
        var stateString = "Invalid";
        if ( state == MessageBoxState.Complete ) {
            stateString = "Complete";
        } else if ( state == MessageBoxState.Waiting ) {
            stateString = "Waiting";
        } else if ( state == MessageBoxState.Unknown ) {
            stateString = "Unknown";
        }
        return stateString;
    }

    /**
     * Prints a user friendly response for a DialogResult
     * @param {DialogResult} response 
     */
    this.PrintResponse = function ( response ) {
        if ( isDefined( response ) ) {
            if ( isDefined( response.length ) && response.length == MessageBoxResultIndex.Length ) {
                print( "Message Box response" +
                    "\r\n\tState = " + this.GetMessageBoxState( response[ MessageBoxResultIndex.State ] ) +
                    "\r\n\tId = " + response[ MessageBoxResultIndex.Id ] +
                    "\r\n\tButtons = " + response[ MessageBoxResultIndex.Button ] +
                    "\r\n\tText = " + response[ MessageBoxResultIndex.Text ] );
            } else {
                print( "MessageBox response is invalid" );
            }
        } else {
            print( "MessageBox response is empty" );
        }
    }

    /**
     * Examples of how to use DialogHelper
     */
    this.Examples = function () {

        this.PrintResponse( this.Execute( {
            Title: "MessageBox Examples",
            Message: "This is a simple MessageBox"
        } ) );

        this.PrintResponse( this.Execute( {
            Title: "MessageBox Examples",
            Message: "This is a simple MessageBox with Ok/Cancel Buttons",
            Buttons: ( Button.Ok + Button.Cancel )
        } ) );

        this.PrintResponse( this.Execute( {
            Title: "MessageBox Examples",
            Message: "This is a simple MessageBox with Yes/No Buttons",
            Buttons: ( Button.Yes + Button.No )
        } ) );

        this.PrintResponse( this.Execute( {
            Title: "MessageBox Examples",
            Message: "This is a Text Capture MessageBox, Type Anything and hit return",
            DialogStyle: MessageBoxCapture.TextCapture,
            Buttons: ( Button.Yes + Button.No )
        } ) );

        this.PrintResponse( this.Execute( {
            Title: "MessageBox Examples",
            Message: "This is a Character Capture MessageBox, Type (Y/N) to complete",
            DialogStyle: MessageBoxCapture.CharacterCapture,
            AcceptedCharacters: "YN"
        } ) );

        this.PrintResponse( this.Execute( {
            Title: "MessageBox Examples",
            Message: "This is an Image (hopefull)",
            Image: "/help/favicon.ico"
        } ) );

        var asyncResponse = this.Execute( {
            Title: "MessageBox Examples",
            Message: "This is an Async MessageBox, with a WaitForSingleDialog to make it synchronous - Hit Return when ready",
            Async: 1,
            BlockMode: MessageBoxBlockState.Script,
            Buttons: Button.Yes
        } );

        print( "Waiting for return" );

        this.PrintResponse( this.WaitForSingleDialog( asyncResponse ) );
    }
}

