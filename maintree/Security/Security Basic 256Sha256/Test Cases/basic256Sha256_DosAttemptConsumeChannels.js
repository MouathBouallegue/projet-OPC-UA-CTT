/*  Test prepared by Alexander Allmendinger; compliance@opcfoundation.org
    Description: per Errata 1.02.2: attempt a DoS attack on Server by consuming SecureChannels and NOT using them!
                 When creating a valid/real SecureChannel, prior [unused] channels should be clobbered. */


Test.Include( { File: "./maintree/Security/Security None/Test Cases/dosAttemptConsumeChannels.js" } );
Test.Execute( { Procedure: DoSAttempt006,
                Args: { RequestedSecurityPolicyUri: SecurityPolicy.Basic256Sha256 } } );