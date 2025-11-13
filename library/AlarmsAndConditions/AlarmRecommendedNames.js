/**
 * Helper object to determine whether the server is using recommended names
 */
function AlarmRecommendedNames () {
    /**
     * Object with all names
     */
    this.RecommendedNames = {
        en: {
            TwoStateVariableType: {
                EnabledState: {
                    False: "Disabled",
                    True: "Enabled"
                },
                DialogState: {
                    False: "Inactive",
                    True: "Active"
                },
                AckedState: {
                    False: "Unacknowledged",
                    True: "Acknowledged"
                },
                ConfirmedState: {
                    False: "Unconfirmed",
                    True: "Confirmed"
                },
                ActiveState: {
                    False: "Inactive",
                    True: "Active"
                },
                SuppressedState: {
                    False: "Unsuppressed",
                    True: "Suppressed"
                },
                OutOfServiceState: {
                    False: "In Service",
                    True: "Out of Service"
                },
                SilenceState: {
                    False: "Silenced",
                    True: "Not Silenced"
                },
                LatchedState: {
                    // TODO Confirm with the spec Mantis issue 5585
                    False: "UnLatched",
                    True: "Latched"
                },
                HighHighState: {
                    False: "HighHigh inactive",
                    True: "HighHigh active"
                },
                HighState: {
                    False: "High inactive",
                    True: "High active"
                },
                LowState: {
                    False: "Low inactive",
                    True: "Low active"
                },
                LowLowState: {
                    False: "LowLow inactive",
                    True: "LowLow active"
                }
            },
            DisplayNames: {
                Unshelved: {
                    BrowseName: "Unshelved",
                    DisplayName: "Unshelved"
                },
                TimedShelved: {
                    BrowseName: "TimedShelved",
                    DisplayName: "Timed Shelved"
                },
                OneShotShelved: {
                    BrowseName: "OneShotShelved",
                    DisplayName: "One Shot Shelved"
                },
                HighHigh: {
                    BrowseName: "HighHigh",
                    DisplayName: "HighHigh"
                },
                High: {
                    BrowseName: "High",
                    DisplayName: "High"
                },
                Low: {
                    BrowseName: "Low",
                    DisplayName: "Low"
                },
                LowLow: {
                    BrowseName: "LowLow",
                    DisplayName: "LowLow"
                }
            },
            DialogResponses: {
                Ok: "Ok",
                Cancel: "Cancel",
                Yes: "Yes",
                No: "No",
                Abort: "Abort",
                Retry: "Retry",
                Ignore: "Ignore",
                Next: "Next",
                Previous: "Previous"
            }
        },
        de: {
            TwoStateVariableType: {
                EnabledState: {
                    False: "Ausgeschaltet",
                    True: "Eingeschaltet"
                },
                DialogState: {
                    False: "Inaktiv",
                    True: "Aktiv"
                },
                AckedState: {
                    False: "Unquittiert",
                    True: "Quittiert"
                },
                ConfirmedState: {
                    False: "Unbestätigt",
                    True: "Bestätigt"
                },
                ActiveState: {
                    False: "Inaktiv",
                    True: "Aktiv"
                },
                SuppressedState: {
                    False: "Nicht unterdrückt",
                    True: "Unterdrückt"
                },
                OutOfServiceState: {
                    False: "In Betrieb",
                    True: "Außer Betrieb"
                },
                SilenceState: {
                    False: "Stumm",
                    True: "Nicht Stumm"
                },
                LatchedState: {
                    // TODO Confirm with the spec Mantis issue 5585
                    False: "Entriegelt",
                    True: "Verriegelt"
                },
                HighHighState: {
                    False: "HighHigh inaktiv",
                    True: "HighHigh aktiv"
                },
                HighState: {
                    False: "High inaktiv",
                    True: "High aktiv"
                },
                LowState: {
                    False: "Low inaktiv",
                    True: "Low aktiv"
                },
                LowLowState: {
                    False: "LowLow inaktiv",
                    True: "LowLow aktiv"
                }
            },
            DisplayNames: {
                Unshelved: {
                    BrowseName: "Unshelved",
                    DisplayName: "Nicht zurückgestellt"
                },
                TimedShelved: {
                    BrowseName: "TimedShelved",
                    DisplayName: "Befristet zurückgestellt"
                },
                OneShotShelved: {
                    BrowseName: "OneShotShelved",
                    DisplayName: "Einmalig zurückgestellt"
                },
                HighHigh: {
                    BrowseName: "HighHigh",
                    DisplayName: "HighHigh"
                },
                High: {
                    BrowseName: "High",
                    DisplayName: "High"
                },
                Low: {
                    BrowseName: "Low",
                    DisplayName: "Low"
                },
                LowLow: {
                    BrowseName: "LowLow",
                    DisplayName: "LowLow"
                }
            },
            DialogResponses: {
                Ok: "Ok",
                Cancel: "Abbrechen",
                Yes: "Ja",
                No: "Nein",
                Abort: "Abbrechen",
                Retry: "Wiederholen",
                Ignore: "Ignorieren",
                Next: "Nächster",
                Previous: "Vorheriger"
            }
        },
        fr: {
            TwoStateVariableType: {
                EnabledState: {
                    False: "Hors Service",
                    True: "En Service"
                },
                DialogState: {
                    False: "Inactive",
                    True: "Active"
                },
                AckedState: {
                    False: "Non-acquitté",
                    True: "Acquitté"
                },
                ConfirmedState: {
                    False: "Non-Confirmé",
                    True: "Confirmé"
                },
                ActiveState: {
                    False: "Inactive",
                    True: "Active"
                },
                SuppressedState: {
                    False: "Présent",
                    True: "Supprimé"
                },
                OutOfServiceState: {
                    False: "En Fonction",
                    True: "Hors Fonction"
                },
                SilenceState: {
                    False: "Muette",
                    True: "Non-Muette"
                },
                LatchedState: {
                    // TODO Confirm with the spec Mantis issue 5585
                    False: "Déverrouillé",
                    True: "Verrouillé"
                },
                HighHighState: {
                    False: "Très Haute inactive",
                    True: "Très Haute active"
                },
                HighState: {
                    False: "Haute inactive",
                    True: "Haute active"
                },
                LowState: {
                    False: "Low inactive",
                    True: "Low active"
                },
                LowLowState: {
                    False: "Très basse inactive",
                    True: "LowLow active"
                }
            },
            DisplayNames: {
                Unshelved: {
                    BrowseName: "Unshelved",
                    DisplayName: "Surveillée"
                },
                TimedShelved: {
                    TimedShelved: "TimedShelved",
                    DisplayName: "Mise de coté temporelle"
                },
                OneShotShelved: {
                    OneShotShelved: "OneShotShelved",
                    DisplayName: "Mise de coté unique"
                },
                HighHigh: {
                    BrowseName: "HighHigh",
                    DisplayName: "Très haute"
                },
                High: {
                    BrowseName: "High",
                    DisplayName: "Haute"
                },
                Low: {
                    BrowseName: "Low",
                    DisplayName: "Basse"
                },
                LowLow: {
                    BrowseName: "LowLow",
                    DisplayName: "Très basse"
                }
            },
            DialogResponses: {
                Ok: "Ok",
                Cancel: "Annuler",
                Yes: "Oui",
                No: "Non",
                Abort: "Abandonner",
                Retry: "Réessayer",
                Ignore: "Ignorer",
                Next: "Prochain",
                Previous: "Precedent"
            }
        },
    };

    /**
     * Checks and returns the expected recommended text
     * @param {string} field - field to check for exmaple AckedState.Id
     * @param {UaLocalizedText} localizedText - existing value
     * @param {boolean} boolValue - expected boolean value
     * @returns {string}
     */
    this.GetTwoStateName = function ( field, localizedText, boolValue ) {
        var expectedName = null;
        if ( isDefined( localizedText ) && isDefined( localizedText.Locale ) && isDefined( localizedText.Text ) ) {
            var locale = localizedText.Locale;
            if ( isDefined( this.RecommendedNames[ locale ] ) ) {
                var names = this.RecommendedNames[ locale ].TwoStateVariableType;

                if ( isDefined( names[ field ] ) ) {
                    expectedName = names[ field ][ this.GetTwoStateFieldName( boolValue ) ];
                    if ( expectedName != localizedText.Text ) {
                        var oppositeName = names[ field ][ this.GetTwoStateFieldName( !boolValue ) ];
                        if ( localizedText.Text == oppositeName ) {
                            addError( "Text value " + localizedText.Text + " for " + field +
                                " matches the opposite boolean value " + oppositeName );
                        }
                        else {
                            addWarning( "Text value " + localizedText.Text + " for " + field +
                                " does not match expected " + expectedName );
                        }
                    }
                } else {
                    addWarning( "CTT cannot retrieve recommended text " + field );
                }
            } else {
                addWarning( "CTT cannot retrieve recommended text for " + field + " in the supplied locale " + locale );
            }
        } else {
            addWarning( "AlarmRecommendedNames::GetTwoStateName localizedText invalid" );
        }

        return expectedName;
    }

    this.GetTwoStateFieldName = function ( value ) {
        return value ? "True" : "False";
    }

    /**
     * Checks and returns the expected recommended text
     * @param {UaLocalizedText} localizedText - CurrentValue
     * @param {boolean} oneShotShelved - expects one shot shelved
     * @param {boolean} timedShelved - expectes timed shelved
     * @returns {string}
     */
    this.GetShelvingStateName = function ( localizedText, oneShotShelved, timedShelved ) {
        if ( isDefined( localizedText ) && isDefined( localizedText.Locale ) && isDefined( localizedText.Text ) ) {

            var locale = localizedText.Locale;
            var expectedName = null;
            if ( isDefined( this.RecommendedNames[ locale ] ) ) {
                var names = this.RecommendedNames[ locale ].DisplayNames;

                if ( oneShotShelved == true ) {
                    expectedName = names.OneShotShelved.BrowseName;
                } else if ( timedShelved == true ) {
                    expectedName = names.TimedShelved.BrowseName;
                } else {
                    expectedName = names.Unshelved.BrowseName;
                }

                var error = false;
                var warning = false;
                if ( localizedText.Text != expectedName ) {
                    if ( oneShotShelved == true ) {
                        if ( expectedName == names.TimedShelved.BrowseName ||
                            expectedName == names.Unshelved.BrowseName ) {
                            error = true;
                        } else {
                            warning = true;
                        }
                    } else if ( timedShelved == true ) {
                        if ( expectedName == names.OneShotShelved.BrowseName ||
                            expectedName == names.Unshelved.BrowseName ) {
                            error = true;
                        } else {
                            warning = true;
                        }
                    } else {
                        if ( expectedName == names.TimedShelved.BrowseName ||
                            expectedName == names.OneShotShelved.BrowseName ) {
                            error = true;
                        } else {
                            warning = true;
                        }
                    }
                }

                if ( error ) {
                    addError( "Unexpected Shelving State Name, Expected " + expectedName + " Actual " + localizedText.Text );
                } else if ( warning ) {
                    addWarning( "Unexpected Shelving State Name, Expected " + expectedName + " Actual " + localizedText.Text );
                }

            } else {
                addWarning( "CTT cannot retrieve text for ShelvingState.CurrentState in the supplied locale " + locale );
            }
        }else {
            addError( "AlarmRecommendedNames::GetShelvingStateName localizedText invalid" );
        }


        return expectedName;
    }

}

