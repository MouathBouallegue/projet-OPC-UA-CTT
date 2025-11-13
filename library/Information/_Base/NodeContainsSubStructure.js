include( "./library/Base/Objects/expectedResults.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds.js" );
include( "./library/Information/_Base/CttObjectHelpers.js" );
include( "./library/Information/_Base/InformationModelObjectHelper.js" );



var TBPTNI = new Object();

/*  Dynamically decorate the TranslateBrowsePath object with a new function that will
    convert the specified object definition into a series of requests and browse paths */
TBPTNI.GetBrowsePaths = function( nodeId, objectDefinition, parent ) {
    if( !isDefined( [ objectDefinition, nodeId ] ) ) throw( "TBPTNI.GetBrowsePaths argument(s) missing: objectDefinition or nodeId." );
    if(  isDefined( objectDefinition.BrowseName ) && !isDefined( objectDefinition.Name ) ) objectDefinition.Name = objectDefinition.BrowseName;
    if( !isDefined( objectDefinition.Name ) ) throw( "TBPTNI.GetBrowsePaths argument of wrong type. Expected a 'Name' property, but wasnt found." );
    var browsePaths = [];
    // iteratively scour the references on the specified object, building the browse paths
    for( var r=0; r<objectDefinition.References.length; r++ ) {
        // create a new browse path
        var newBP = new UaBrowsePath();
        newBP.StartingNode = nodeId;
        newBP.RelativePath.Elements[0].IncludeSubTypes = true;
        // if any parent names were specified (this is a recursively called function) then insert them here
        var eIndex = 0;
        if( isDefined( parent ) ) {
            for( p=0; p<parent.length; p++ ) {
                newBP.RelativePath.Elements[eIndex].IncludeSubtypes = true;
                newBP.RelativePath.Elements[eIndex++].TargetName.Name = parent[p];
            }//for p...
        }
        // now add the "current" name to the path.
        newBP.RelativePath.Elements[eIndex].IncludeSubtypes = true;
        newBP.RelativePath.Elements[eIndex].TargetName.Name = objectDefinition.References[r].BrowseName.substring(objectDefinition.References[r].BrowseName.indexOf(":") + 1, objectDefinition.References[r].BrowseName.length);
        if ( !isDefined( objectDefinition.References[r].NodeId ) ) {
            newBP.RelativePath.Elements[eIndex].TargetName.NamespaceIndex = 0;
        }
        else {
            newBP.RelativePath.Elements[eIndex].TargetName.NamespaceIndex = objectDefinition.References[r].NodeId.NamespaceIndex;
        }
        // add the browse path to the return collection
        browsePaths.push( newBP.clone() );
        // look for nested objects, and recursively build the nested objects...
        if( isDefined( objectDefinition.References[r].TypeInstance ) ) {
            if( !isDefined( parent ) ) parent = [];
            // get the "current" Name into the parent array
            parent.push( objectDefinition.References[r].BrowseName );
            var subPaths = TBPTNI.GetBrowsePaths( nodeId, objectDefinition.References[r].TypeInstance, parent );
            if( isDefined( subPaths ) ) {
                for( var s=0; s<subPaths.length; s++ ) {
                    browsePaths.push( subPaths[s] );
                }//for s...
            }
            parent.pop();
        }
    }//for r...
    return( browsePaths );
}


// params: Paths, Separator, ShowNumber
TBPTNI.BrowsePathsToString = function( args ) {
    // check params
    if( !isDefined( args ) ) throw( "TBPTNI.BrowsePathsToString::args not specified." );
    if( !isDefined( args.Paths ) ) throw( "TBPTNI.BrowsePathsToString::Paths not specified." );
    if( !isDefined( args.Separator ) ) args.Separator = " -> ";
    if( !isDefined( args.ShowNumber ) ) args.ShowNumber = true;
    // now to iterate thru all browsePaths
    var s = "";
    if( isDefined( args.Paths ) ) {
        if( args.Paths.length === undefined ) args.Paths = [args.Paths];
        for( var i=0; i<args.Paths.length; i++ ) {
            if( args.ShowNumber ) s += "[" + i + "] ";
            for( var e=0; e<args.Paths[i].RelativePath.Elements.length; e++ ) {
                s += args.Separator + args.Paths[i].RelativePath.Elements[e].TargetName.Name;
            }//for e...
            if( i < ( args.Paths.length - 1 ) ) s += "\n";
        }//for i...
    }
    return( s );
}


TBPTNI.BrowsePathsToExpectedErrors = function( objectDefinition ) {
    var errs = [];
    if( isDefined( objectDefinition ) ) {
        for( var r=0; r<objectDefinition.References.length; r++ ) {
            if( objectDefinition.References[r].Required ) errs.push( new ExpectedAndAcceptedResults( StatusCode.Good ) );
            else {
                errs.push( new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNoMatch ] ) );
            }
            // search for nested/sub-definitions
            if( isDefined( objectDefinition.References[r].TypeInstance ) ) {
                var innerErrs = TBPTNI.BrowsePathsToExpectedErrors( objectDefinition.References[r].TypeInstance );
                if( isDefined( innerErrs ) ) {
                    for( var i=0; i<innerErrs.length; i++ ) {
                        errs.push( innerErrs[i] );
                    }
                }// if innerErrs
            }
        }//for r
    }//if paths
    return( errs );
}


// params: StartingNode, ObjectDefinition, TranslateBrowsePathsToNodeIdsHelper
// out: True/False 
TBPTNI.CheckChildStructure = function( args ) {
    if( !isDefined( args ) ) throw( "TBPTNI.CheckChildStructure::args not specified." );
    if( !isDefined( [ args.StartingNode, args.ObjectDefinition, args.TranslateBrowsePathsToNodeIdsHelper ] ) ) throw( "TBPTNI.CheckChildStructure arguments missing." );
    if ( args.ObjectDefinition == null) throw ("TBPTNI.CheckChildStructure arguments missing.");
    // first, obtain the browsePath definitions, and the expectedResults
    var browsePaths = TBPTNI.GetBrowsePaths( args.StartingNode.NodeId, args.ObjectDefinition );
    if( browsePaths == null || browsePaths.length == undefined || browsePaths.length == null || browsePaths.length == 0 ) return( null );
    var expectedResults = TBPTNI.BrowsePathsToExpectedErrors( args.ObjectDefinition );
    // invoke the TranslateBrowsePathsToNodeIds helper function call, while specifying the expected outcome
    print( "Structure verification on NodeId: " + args.StartingNode.NodeId + ( args.StartingNode.NodeSetting.length > 0 ? " (setting: " + args.StartingNode.NodeSetting + ")." : "" ) );
    args.TranslateBrowsePathsToNodeIdsHelper.Execute( { 
            UaBrowsePaths: browsePaths,
            OperationResults: expectedResults,
            SuppressMessaging: true,
            SuppressErrors: true
            } );
    result = TBPTNI.GetTestResults( args );
    return( result );
}


// params: Item
// out: List of References.
TBPTNI.recursivelyGetReferences = function( args ) {
    if( !isDefined( args ) )throw( "TBPTNI.recursivelyGetReferences::args not specified." );
    if( !isDefined( args.Item ) ) throw( "TBPTNI.recursivelyGetReferences::args.Item not specified." );
    var _refs = [];
    if( isDefined( args.Item.References ) ) {
        // copy all references into our collection
        for( r in args.Item.References ) {
            var _cr = args.Item.References[r];
            _refs.push( _cr );
            // any nested types?
            if( isDefined( _cr.TypeInstance ) ) {
                var _nestedRefs = TBPTNI.recursivelyGetReferences( { Item: _cr.TypeInstance } );
                if( _nestedRefs.length > 0 ) for( r in _nestedRefs ) _refs.push( _nestedRefs[r] );
            }
        }
    }
    return( _refs );
}// TBPTNI.recursivelyGetReferences = function( args )


// params: StartingNode; ObjectDefinition; TranslateBrowsePathsToNodeIdsHelper, SuppressMessaging, Level
// out: string[] containing test-results 
TBPTNI.GetTestResults = function( args ) {
    if( !isDefined( args ) ) throw( "TBTNI.PrintTestResults::args not specified." );
    if( !isDefined( [ args.StartingNode, args.ObjectDefinition, args.TranslateBrowsePathsToNodeIdsHelper ] ) ) throw( "TBTNI.PrintTestResults::arguments not specified." );
    if (args.ObjectDefinition == null) throw ("TBPTNI.PrintTestResults arguments missing.");
    if( !isDefined( args.SuppressMessage ) ) args.SuppressMessaging = false;
    var result = true;
    // get the object definition in a flat list
    var allObjectDefinitionReferences = TBPTNI.recursivelyGetReferences( { Item: args.ObjectDefinition } );
    // there is a 1-to-1 mapping between the object-definition, and the results of TranslateBrowsePathsToNodeIds 
    for( var i=0; i<allObjectDefinitionReferences.length; i++ ) {
        // get the name of the item that we're looking for
        var msg = args.ObjectDefinition.Name + 
            TBPTNI.BrowsePathsToString( {
                    Paths: args.TranslateBrowsePathsToNodeIdsHelper.Request.BrowsePaths[i],
                    ShowNumber: false
                    } );
        // add a message that says if we found it or not
        msg += " ==>" + ( args.TranslateBrowsePathsToNodeIdsHelper.Response.Results[i].StatusCode.isGood() ? "[ok]" : "[NOT FOUND]" );
        // if it wasn't found, was it OPTIONAL? either log an error, or warning
        if( args.TranslateBrowsePathsToNodeIdsHelper.Response.Results[i].StatusCode.isBad() ) {
            if( allObjectDefinitionReferences[i].Required ) {
                msg += " REQUIRED";
                addError( msg );
                result = false;
            }
            else {
                msg += " --- Optional"
                addLog( msg );
            }
        }
        // show what was found:
        if( !args.SuppressMessaging ) print( msg );
    }//for i...
    // return our test results analysis
    return( result );
}

var ObjectDefinition = new Object();
ObjectDefinition = {
    Definitions: null,

    /* This function searches through the object definition (JSON) in search of an object whose 
       definition matches the specified BrowseName.
       Arguments: 
           BrowseName:  the name of the object to search for...
           Definitions: the object(s) that we will search through */
    GetObject: function( args ) {
        if( args == undefined || args == null ) return( false );
        if( args.BrowseName == undefined || args.BrowseName == null ) return( false );
        if( args.Definitions == undefined && this.Definitions == null ) return( false );
        var theseDefinitions = this.Definitions;
        if( args.Definitions != undefined && args.Definitions != null ) theseDefinitions = args.Definitions;
        if( theseDefinitions.length == undefined ) theseDefinitions = [ theseDefinitions ];
        // search through each object for a matching definition
        for( var i=0; i<theseDefinitions.length; i++ ) {
            if( theseDefinitions[i].BrowseName == args.BrowseName ) return( theseDefinitions[i] );

            if( theseDefinitions[i].SubObjects !== undefined && theseDefinitions[i].SubObjects.length !== undefined ) {
                for( var s=0; s<theseDefinitions[i].SubObjects.length; s++ ) {
                    var obj = this.GetObject( { BrowseName: args.BrowseName, Definitions: theseDefinitions[i].SubObjects[s] } );
                    if( obj !== undefined && obj !== null ) return( obj );
                }//for s...
            }// do we have sub-objects defined?

        }//for i...
        return( null );
    },

    /* This function compares an object definition to the TranslateBrowsePathsToNodeIds response
       Arguments:
           ObjectDefinition: the JSON object containing the definition
           BrowseResponse:   the TranslateBrowsePathsToNodeIds response */
    MatchesTranslateBrowsePaths: function( args ) {
        if( args == undefined || args == null ) return( false );
        if( args.ObjectDefinition == undefined || args.ObjectDefinition == null ) return( false );
        if( args.BrowseResults == undefined || args.BrowseResults == null ) return( false );
        // convert our object definition into browse paths
        var browsePaths = TBPTNI.GetBrowsePaths( args.StartingNode.NodeId, args.ObjectDefinition );
        var expectedResults = TBPTNI.BrowsePathsToExpectedErrors( args.ObjectDefinition );
        // invoke the TranslateBrowsePathsToNodeIds helper function call, while specifying the expected outcome
        print( "Structure verification on NodeId: " + args.StartingNode.NodeId + " (setting: " + args.StartingNode.NodeSetting + ")." );
        args.TranslateBrowsePathsToNodeIdsHelper.Execute( { 
                UaBrowsePaths: browsePaths,
                OperationResults: expectedResults,
                SuppressMessaging: true
                } );

        return( true );
    }

}