/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: OpenSecureChannel using default parameters; check if audit event AuditOpenSecureChannelEventType received */

function testx() {
    // step 1: create and destroy a new channel
    var channel2 = new OpenSecureChannelService();
    if( !channel2.Execute() ) {
        addError( "Unable to create a new channel." );
        return( false );
    }
    var closeChannel2 = new CloseSecureChannelService();
    closeChannel2.Execute( { Channel: channel2 } );

    // step 2: check if an audit event occurred
    if( Assert.True( test.lookForEvents(), "AuditOpenSecureChannelEventType not received for newly opened channel." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditOpenSecureChannelEventType ), "AuditOpenSecureChannelEventType not found in the Publish notification.", "Found AuditOpenSecureChannelEventType in the Publish response!" );
    }

    return( true );
}

Test.Execute( { Debug: true, Procedure: testx } );