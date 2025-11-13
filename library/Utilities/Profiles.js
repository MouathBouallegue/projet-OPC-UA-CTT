/**
 * This script is meant to be a helper to read the profile and conformance unit models
 * This is a preliminary script, primarily focused on the Profile Model.
 * It is meant to continuously developed as uses cases are provided.
 */
function ProfilesHelper () {

    /**
     * The model.  And object that contains the Profile model and Conformance Model
     * @param ProfileModel information in the Profile model
     * @param ConformanceModel information in the Conformance model
     */
    this.Model = null;

    /**
     * Get the model
     * @returns The Model
     */
    this.GetModel = function () {
        if ( !isDefined( this.Model ) ) {
            this.Read();
        }

        return this.Model;
    }

    /**
     * Read the model from the CTT.
     * Meant to be an internal function call. External users should use this.GetModel()
     */
    this.Read = function () {

        var profiles = getProfiles();
        var profileModel = [];
        var conformanceModel = [];

        for ( var index = 0; index < profiles.length; index++ ) {
            var instance = profiles[ index ];
            if ( instance.ListType == "Profiles" ) {
                profileModel.push( instance );
            } else {
                conformanceModel.push( instance );
            }
        }

        this.Model = new Object();
        this.Model.ProfileModel = profileModel;
        this.Model.ConformanceModel = conformanceModel;
    }

    /**
     * Retrieve a conformance unit map from the Profiles Model.
     * @returns KeyPairCollection
     */
    this.GetConformanceUnitMapFromProfiles = function () {
        var model = this.GetModel();
        var map = new KeyPairCollection();

        for ( var index = 0; index < model.ProfileModel.length; index++ ) {
            var profile = model.ProfileModel[ index ];
            this.GetProfileCormanceUnits( profile, true, map );
        }

        return map;
    }

    /**
     * Retrieve a conformance unit map from the Profiles Model for specific profile uri.
     * @param uri unique profile uri to specify which conformance units are desired
     * @param includeSubProfiles - walk through all subprofiles of the desired profile
     * @returns KeyPairCollection
     */
    this.GetConformanceUnitsForProfileUri = function ( uri, includeSubProfiles ) {
        return this.GetConformanceUnitsForKey( "Uri", uri, includeSubProfiles );
    }

    /**
     * Retrieve a conformance unit map from the Profiles Model for specific profile Guid.
     * @param guid unique profile guid to specify which conformance units are desired
     * @param includeSubProfiles walk through all subprofiles of the desired profile
     * @returns KeyPairCollection
     */
     this.GetConformanceUnitsForProfileGuid = function ( guid, includeSubProfiles ) {
        return this.GetConformanceUnitsForKey( "Guid", guid, includeSubProfiles );
    }

    /**
     * Retrieve a conformance unit map from the Profiles Model for specific search parameter.
     * Primarily used as the main function for both GetConformanceUnitsForProfileUri and
     * GetConformanceUnitsForProfileGuid, but can be used for 'Name' as well.
     * @param key parameter to search for unique parameter value
     * @param value profile uri to specify which conformance units are desired
     * @param includeSubProfiles walk through all subprofiles of the desired profile
     * @returns KeyPairCollection
     */
     this.GetConformanceUnitsForKey = function ( key, value, includeSubProfiles ) {
        var model = this.GetModel();
        var map = new KeyPairCollection();

        var profile = this.GetProfile( key, value );
        if ( isDefined( profile ) ) {
            this.GetProfileCormanceUnits( profile, includeSubProfiles, map );
        }

        return map;
    }

    /**
     * Retrieve all conformance units map from the Profiles Model for specific profile.
     * Primarily used as the main function for both GetConformanceUnitsForProfileUri and
     * GetConformanceUnitsForProfileGuid, but can be used for 'Name' as well.
     * @param profile profile to walk through
     * @param includeSubProfiles walk through all subprofiles of the desired profile
     * @param map Storage for found conformance units
     */
     this.GetProfileCormanceUnits = function ( profile, includeSubProfiles, map ) {
        // Get all the Conformance Units
        for ( var index = 0; index < profile.ConformanceUnits.length; index++ ) {
            var conformanceUnit = profile.ConformanceUnits[ index ];
            if ( !map.Contains( conformanceUnit.Name ) ) {
                map.Set( conformanceUnit.Name, conformanceUnit );
            }
        }

        if ( includeSubProfiles ) {
            for ( var index = 0; index < profile.SubProfiles.length; index++ ) {
                var subProfile = profile.SubProfiles[ index ];
                this.GetProfileCormanceUnits( subProfile, includeSubProfiles, map );
            }
        }
    }

    /**
     * Find a profile based off the desired key and value
     * @param {string} profileKey desired parameter to look for the value
     * @param {string} profileValue desired value
     * @returns UaProfile
     */
    this.GetProfile = function ( profileKey, profileValue ) {
        var desiredProfile = null;
        var model = this.GetModel();

        for ( var index = 0; index < model.ProfileModel.length; index++ ) {
            var profile = model.ProfileModel[ index ];
            if ( isDefined( profile[ profileKey ] ) ) {
                print("ProfileHelper.GetProfile profileValue", profile[ profileKey ], "Desired Value", profileValue)
                if ( profile[ profileKey ].valueOf() == profileValue.valueOf() ) {
                    desiredProfile = profile;
                    break;
                }
            }
        }

        return desiredProfile;
    }

    /**
     * Get a tab string for displaying hierarchical data
     * @param {int} level 
     * @returns tab string
     */
    this.GetTab = function ( level ) {
        var tab = "";
        for ( var index = 0; index < level; index++ ) {
            tab += "\t";
        }
        return tab;
    }

    /**
     * Retrieve a user friendly name for a Qt defined CheckState
     * @param {int} value Qt::CheckState
     * @returns string
     */
    this.GetCheckName = function ( value ) {
        var name = "";
        switch ( value ) {
            case 0:
                name = "Unchecked";
                break;
            case 1:
                name = "PartiallyChecked";
                break;
            case 2:
                name = "Checked";
                break;
        }
        return name;
    }

    /**
     * Print either the ProfileModel or the ConformanceModel
     * @param {object} profiles the desired model list
     */
    this.Print = function ( profiles ) {
        for ( var index = 0; index < profiles.length; index++ ){
            this.PrintProfile( profiles[index], 0 );
        }
    }

    /**
     * Print a specific profile.  Recursive to print subprofiles and conformance units
     * @param {object} profiles the desired model object
     * @param {int} level Hierchical place for tab printing
     */
     this.PrintProfile = function ( profile, level ) {
        var tab = this.GetTab( level );

        print( tab, "ListType: " + profile.ListType );
        print( tab, "ObjectType: " + profile.ObjectType );
        print( tab, "Category: " + profile.CategoryName );
        print( tab, "Name: " + profile.Name );
        print( tab, "State: " + this.GetCheckName( profile.State ) );

        for ( var index = 0; index < profile.ConformanceUnits.length; index++ ) {
            if ( index == 0 ) {
                print( tab, "ConformanceUnit count", profile.ConformanceUnits.length );
            }
            this.PrintProfile( profile.ConformanceUnits[ index ], level + 1 );
        }

        for ( var index = 0; index < profile.SubProfiles.length; index++ ) {
            if ( index == 0 ) {
                print( tab, "SubProfile count", profile.SubProfiles.length );
            }
            this.PrintProfile( profile.SubProfiles[ index ], level + 1 );
        }
    }

    /**
     * Print out a ConformanceUnit map
     * @param {KeyPairCollection} map of conformance Units 
     */
    this.PrintConformanceUnits = function ( map ) {
        if ( isDefined( map ) ) {
            map.Iterate( function ( key, object, args ) {
                print( "ConformanceUnit " + key + ":" + object.Name + " has a state of " + args.This.GetCheckName( object.State ) );
            }, { This: this } )
        }
    }

}

