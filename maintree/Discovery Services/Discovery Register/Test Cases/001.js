/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: RegisterServer() default values; IsOnline=TRUE. */

function registerServer001()
{
    pseudoServer = getDefaultPseudoServer();
    RegisterServerHelper.Execute( { Server: pseudoServer } );
    return( true );
}

Test.Execute( { Procedure: registerServer001 } );