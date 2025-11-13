/*  Test prepared prepared by Alexander Allmendinger; compliance@opcfoundation.org
    Description: per Errata 1.02.2: attempt a DoS attack on Server by consuming SecureChannels and using only SOME of them!
                 When creating a valid/real SecureChannel, prior [unused] channels should be clobbered. */

Test.Include( { File: "./maintree/Security/Security None/Test Cases/dosAttackConsumeSecureChannelsCreateSessions.js" } );
Test.Execute( { Procedure: DoSAttempt007,
                Args: { RequestedSecurityPolicyUri: SecurityPolicy.Basic256Sha256 } } );