import xml.etree.ElementTree as ET
import openpyxl
import re

# Load and parse the XML file
tree = ET.parse('Serv-Config.results.xml')  # Replace with your XML file path
root = tree.getroot()

# List of test steps to include
include_test_steps = [
 


"001.js","002.js","003.js","004.js","005.js","006.js","007.js","008.js","009.js","0010.js","0011.js","0012.js","0013.js","0014.js","0015.js","0016.js","0017.js","0018.js","0019.js","0020.js","0021.js","0022.js","001-01.js", "001-02.js", "001-03.js", "001-04.js", "002-01.js", "002-02.js", "002-03.js", "002-04.js", "003-01.js", "003-02.js", "003-03.js", "003-04.js", "004-01.js", "004-02.js", "004-03.js", "004-04.js", "005-01.js", "005-02.js", "005-03.js", "Err-004.js", "Err-005.js", "Err-006.js", "Err-007.js", "Err-008.js", "Err-009.js", "Err-010.js", "Err-011.js", "Err-012.js", "Err-013.js", "Err-014.js", "Err-015.js", "Err-016.js", "Err-017.js", "Err-018.js", "Err-019.js", "Err-020.js", "Err-021.js", "Err-022.js", "Err-023.js", "Err-024.js", "Err-025.js","test.js","Err-026.js", "Err-027.js", "Err-028.js", "Err-029.js", "Err-030.js", "Err-031.js", "Err-032.js", "Err-033.js", "Err-034.js", "Err-035.js", "Err-036.js", "Err-037.js", "Err-038.js", "Err-039.js", "Err-040.js", "Err-041.js", "Err-042.js", "Err-043.js", "Err-044.js", "Err-045.js", "Err-046.js", "Err-047.js", "Err-048.js", "Err-049.js", "Err-050.js", "Err-051.js", "Err-052.js", "Err-053.js", "Err-054.js", "Err-055.js", "Err-056.js", "Err-057.js", "Err-058.js", "Err-059.js", "Err-060.js",

"000.js", "001.js", "002.js", "003.js", "004.js", "005.js", "006.js", "007.js", "008.js", "009.js", "010.js", "011.js", "012.js", "013.js", "014.js", "015.js", "016.js", "017.js", "018.js", "019.js", "020.js", "021.js", "022.js", "023.js", "024.js", "025.js", "026.js", "027.js", "028.js", "029.js", "030.js", "031.js", "032.js", "033.js", "034.js", "035.js", "036.js", "037.js", "038.js", "039.js", "040.js", "041.js", "042.js", "043.js", "044.js", "045.js", "046.js", "047.js", "048.js", "049.js", "050.js", "051.js", "052.js", "053.js", "054.js", "055.js", "056.js", "057.js", "058.js", "059.js", "060.js", "061.js", "062.js", "063.js", "064.js", "065.js", "066.js", "067.js", "068.js", "069.js", "070.js", "071.js", "072.js", "073.js", "074.js", "075.js", "076.js", "077.js", "078.js", "079.js", "080.js", "081.js", "082.js", "083.js", "084.js", "085.js", "086.js", "087.js", "088.js", "089.js", "090.js", "091.js", "092.js", "093.js", "094.js", "095.js", "096.js", "097.js", "098.js", "099.js", "100.js",

"AASET-001.js", "AASET-002.js", "AASET-004.js", "AASET-005.js", "ACSET-001.js", "ACSET-002.js", "ACSET-004.js", "AOSCET-001.js", "AOSCET-002.js", "AOSCET-003.js", "AOSCET-004.js", "AOSCET-005.js", "AOSCET-006.js", "ASET-003.js",


"Test_001.js", "Test_002.js", "Test_003.js", "Test_004.js", "Test_005.js", "Test_006.js", "Test_007.js", "Test_008.js", "Test_009.js", "Test_010.js", "Test_011.js", "Test_012.js", "Test_013.js", "Test_014.js", "Test_015.js", "Test_016.js", "Test_017.js", "Test_018.js", "Test_019.js", "Test_020.js", "Test_021.js", "Test_022.js", "Test_023.js", "Test_024.js", "Test_025.js", "Test_026.js", "Test_027.js", "Test_028.js", "Test_029.js", "Test_030.js", "Test_031.js", "Test_032.js", "Test_033.js", "Test_034.js", "Test_035.js", "Test_036.js", "Test_037.js", "Test_038.js", "Test_039.js", "Test_040.js", "Test_041.js", "Test_042.js", "Test_043.js", "Test_044.js", "Test_045.js", "Test_046.js", "Test_047.js", "Test_048.js", "Test_049.js", "Test_050.js", "Test_051.js", "Test_052.js", "Test_053.js", "Test_054.js", "Test_055.js", "Test_056.js", "Test_057.js", "Test_058.js", "Test_059.js", "Test_060.js", "Test_061.js", "Test_062.js", "Test_063.js", "Test_064.js", "Test_065.js", "Test_066.js", "Test_067.js", "Test_068.js", "Test_069.js", "Test_070.js", "Test_071.js", "Test_072.js", "Test_073.js", "Test_074.js", "Test_075.js", "Test_076.js", "Test_077.js", "Test_078.js", "Test_079.js", "Test_080.js", "Test_081.js", "Test_082.js", "Test_083.js", "Test_084.js", "Test_085.js", "Test_086.js", "Test_087.js", "Test_088.js", "Test_089.js", "Test_090.js", "Test_091.js", "Test_092.js", "Test_093.js", "Test_094.js", "Test_095.js", "Test_096.js", "Test_097.js", "Test_098.js", "Test_099.js", "Test_100.js",


"insecureChannelWithCertificatesAndNonce.js",
"insecureChannelWithNonceNoCertificates.js",
"insecureChannelWithNonceOnly.js",
"insecureChannelNoCertOrNonceExpectSecure.js",
"provideInvalidCertificateExpectChannelOpen.js",
"doAttemptConsumeChannels.js",
"dosAttackConsumeSecureChannelsCreateSessions.js",

"insecureChannelAuthSuccess.js",
"secureChannelAuthSuccess.js",
"insecureChannelEmptyUserPassExpectTokenInvalid.js",
"insecureChannelNonExistentUserExpectTokenRejected.js",
"insecureChannelValidUserEmptyPassNonceExpectGoodOrRejected.js",
"insecureChannelValidUserEmptyPassNoNonceExpectGoodOrRejected.js",
"insecureChannelWrongPasswordExpectTokenRejected.js",
"insecureChannelUsernameDoesNotExistExpectTokenRejected.js",
"insecureChannelPolicyIdMismatchExpectTokenInvalid.js",
"insecureChannelEncryptionAlgorithmMismatchExpectTokenInvalid.js",
"secureChannelEmptyEncryptionAlgorithmExpectTokenInvalid.js",
"insecureChannelValidUserNoAccessExpectAccessDenied.js",
"getEndpointsVerifyUniqueUserIdentificationPolicyId.js",
"validCertForValidConnection.js",
"validCertForNotTrustedUser.js",
"notYetValidCertTrusted.js",
"expiredX509Certificate.js",
"revokedUserX509Cert.js",
"applicationInstanceCertificateInstead.js",
"specifyDifferentPolicyId.js",
"invalidUserCertificate.js",
"validCertLocalCANotTrusted.js",
"validTrustedCertLocalCATrusted.js",
"validTrustedCertLocalCANotTrustedButKnown.js",
"validNotTrustedCertLocalCANotTrustedButKnown.js",
"notTrustedCertRevokedServerPolicyId.js",
"validTrustedUserCertEmptyUserIdentitySignature.js",
"validTrustedUserCertInvalidUserIdentitySignature.js",
"validTrustedUserCertUserIdentitySignatureInvalidAlgorithm.js",
"SecurityCertificateValidation:ActivateInsecureSessionValidateCertPerSpecification.js",
"SecurityCertificateValidation:ConnectWithClientCertSignedByUntrustedButKnownCAWithoutRevocation.js",
"SecurityCertificateValidation:AttemptSecureSessionWithEmptyClientCertificate.js",
"SecurityCertificateValidation:SecureChannelUntrustedCertificateExpectsBadSecurityChecksFailed.js",
"SecurityCertificateValidation:SecureChannelExpiredCertificateExpectsGoodOrBadCertificateTimeInvalid.js",
"SecurityCertificateValidation:SecureChannelNotYetValidCertificateExpectsGoodOrBadCertificateTimeInvalid.js",
"SecurityCertificateValidation:SecureChannelIssuerUnknownExpectsBadSecurityChecksFailed.js",
"SecurityCertificateValidation:SecureChannelCertificateSignedWithWrongKeyExpectsBadSecurityChecksFailed.js",
"SecurityCertificateValidation:UsingInsecureConnectionSecurityNoneActivateSessionWhileSendingRevokedCertificate.js",
"SecurityCertificateValidation:AttemptSecureChannelAndSendACA.js",
"SecurityCertificateValidation:ConnectWithExpired/UntrustedCertificate.js",
"SecurityCertificateValidation:SecureChannelIssuedCertificateExpectsGood.js",
"SecurityCertificateValidation:EncryptedChannelUsingRevokedCertificate.js",
"SecurityCertificateValidation:ConnectUsingUntrustedIssuedCertOfCAWithNoRevocationList.js",
"SecurityCertificateValidation:ConnectUsingAnUntrustedIssuedCertOfCAWithNoRevocationListAvailable.js",
"SecurityCertificateValidation:ConnectUsingAnUntrustedIssuedCertOfCAThatIsNotTrustedButAvailable.js",
"SecurityCertificateValidation:ConnectUsingAnUntrustedIssuedCertOfCAThatIsNotTrustedButAvailable.js",
"SecurityCertificateValidation:AttemptSecureChannelAndSendNotTrustedCertificateIssuedByUnknownCertificateAuthority.js",
"SecurityCertificateValidation:ConnectUsingARevokedCertificateThatIsNotTrusted.js",
"SecurityCertificateValidation:ConnectUsingATrustedClientCertificate.js",
"SecurityCertificateValidation:ConnectUsingATrustedClientCertificate(sha1-1024).js",
"SecurityCertificateValidation:ConnectUsingATrustedClientCertificate(sha1-2048).js",
"SecurityCertificateValidation:ConnectUsingATrustedClientCertificate(sha2-2048).js",
"SecurityCertificateValidation:ConnectUsingATrustedClientCertificate(sha2-4096).js",
"SecurityCertificateValidation:ConnectUsingATrustedClientCertificate(sha2-2048).js",
"Write_IndexRange_Equals_One_For_Each_Core_DataType.js",
"Write_IndexRange_Equals_OneHalf_For_Each_Core_DataType_As_Array.js",
"Write_IndexRange_Equals_ZeroTwo_To_First_Three_Elements_Of_Array_For_Each_DataType.js",
"Write_IndexRange_Equates_To_Last_Three_Items_Of_An_Array.js",
"Write_Array_Complete_Array_For_Each_DataType.js",
"Write_Element_Outside_Bounds_Of_Array.js",
"Write_IndexRange_One_Index_Of_MultiDimensional_Array_First_Element_From_Second_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_First_Element_From_Each_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_First_Three_Elements_Of_Each_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_Last_Three_Elements_Of_Each_Dimension.js",
"Write_IndexRange_To_Subset_Of_Array_Verify_Timestamps_Updated.js",
"Error_IndexRange_Is_Out_Of_Bounds_Int32_Divide_By_2.js",
"Error_IndexRange_Is_Invalid_7_2_For_Node_DataType.js",
"Error_IndexRange_Syntax_Invalid_Used_For_DataType_Node.js",
"Error_IndexRange_Invalid_Syntax_Range_Not_Actually_Specified_As_Range.js",
"Error_IndexRange_Invalid_Using_Negative_Numbers_For_Each_DataType.js",
"Write_IndexRange_Equals_One_For_Each_Core_DataType.js",
"Write_IndexRange_Equals_OneHalf_For_Each_Core_DataType_As_Array.js",
"Write_IndexRange_Equals_ZeroTwo_To_First_Three_Elements_Of_Array_For_Each_DataType.js",
"Write_IndexRange_Equates_To_Last_Three_Items_Of_An_Array.js",
"Write_Array_Complete_Array_For_Each_DataType.js",
"Write_Element_Outside_Bounds_Of_Array.js",
"Write_IndexRange_One_Index_Of_MultiDimensional_Array_First_Element_From_Second_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_First_Element_From_Each_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_First_Three_Elements_Of_Each_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_Last_Three_Elements_Of_Each_Dimension.js",
"Write_IndexRange_To_Subset_Of_Array_Verify_Timestamps_Updated.js",
"Error_IndexRange_Is_Out_Of_Bounds_Int32_Divide_By_2.js",
"Error_IndexRange_Is_Invalid_7_2_For_Node_DataType.js",
"Error_IndexRange_Syntax_Invalid_Used_For_DataType_Node.js",
"Error_IndexRange_Invalid_Syntax_Range_Not_Actually_Specified_As_Range.js",
"Error_IndexRange_Invalid_Using_Negative_Numbers_For_Each_DataType.js",
"AccessLevelEx_AtomicityFlags_Check.js",
"Default_Atomicity_Behavior_ManualCheck.js",
"Default_Atomicity_Behavior_ManualCheck_2.js",
"BaseNodeClassComplianceCheck.js",
"TypeSystemStructureValidation.js",

"EventNotifierAttributeValidation.js",
"ServerObjectEventReception.js",
"WriteToAccessLevel_CurrentWrite.js",
"InvalidWrite_ReadOnlyAccess.js",
"WriteToWritableAttributes.js",
"WriteDeniedByUserAccessLevel.js",
"UserReadAccess.js",
"AccessLevelRead.js",

"WriteAllWritableAttributesBasedOnWriteMask.js",
"WriteMultipleAttributesWithOneInvalidAttributedId.js",
"WriteValidValuesToWritableAttributesBasedOnWriteMask.js",
"WriteToInvalidNodesMultipleAttributes.js",

"ReadSingleScalarNodeValueWithServerTimestamp.js",
"ReadMultipleAttributesFromValidNode.js",
"readAllAttributesFromVariableNode.js",
"readMultipleAttributesWithMaxAgeZero.js",
"readDataValueWithBothTimestamps.js",
"readDataValueWithSourceTimestampOnly.js",
"readDataValueWithServerTimestampOnly.js",
"readDataValueWithNoTimestamps.js",
"readBrowseNameAttribute.js",
"readBrowseName_MultipleNodes.js",
"ReadAllMandatoryAttributes_MultipleNodeTypes.js",
"ReadSameAttributeMultipleTimes_SingleNode.js",
"ReadEachSupportedScalarDataType.js",
"Read_MaxAge_Exceeds_Int32_With_Both_Timestamps.js",
"Read_SingleNode_SequentialAttributes_NoSourceTimestamp.js",
"Read_ServerState_ExpectRunning.js",
"Read_Array_Attribute_ExpectArraySizeGreaterThanTwo.js",
"Read_MultipleArrayAttributes_ValidateBuiltinTypesAndArrayFlag.js",
"ReadSingleElementFromArrayByIndexRange_ValidateAgainstFullArrayRead.js",
"ReadArraySubrange_IndexRange2to4_CompareWithFullArray.js",
"ReadArray_Last3Elements_IndexRange.js",
"ReadEventNotifierAttribute.js",
"ReadNonValueAttributesWithTimestampCheck.js",
"ReadMultiDimensionalArrayValueAttribute.js",
"ReadMultiDimensionalArrayValues_DifferentDataTypes.js",
"AttributeRead_MultiDimArray_SingleElement.js",
"ReadRange_MultiDimArray_2To4_SecondDimension.js",
"ReadRange_Last3_LastDimension_MultiDimArray.js",
"ReadArray_IndexRange_BoundsCheck_PartialReturn.js",

"Read_InvalidAttribute_Executable_NotSupported_BadAttributeInvalid.js",
"Read_Attributes_MultipleValidOneInvalid_ErrorForInvalid.js",
"Read_SameInvalidAttribute_MultipleRequests_BadAttributeInvalid.js",
"Read_Attribute_FromInvalidNodeId.js",
"Read_BrowseName_EmptyNodeId.js",
"ReadValidAttributeFromNodeIdWithEmptyStringId.js",
"ReadMultipleAttributes_MixedValidUnknownInvalidNodes.js",
"ReadValidAttributes_FromMultipleNonExistentNodes.js",
"ReadValidAttributes_FromNodesWithInvalidNodeIdSyntax.js",
"ReadEmptyNodesArray.js",
"ReadArrayWithInvalidIndexRangeShouldReturnBadIndexRangeNoData.js",
"ReadArrayWithNegativeIndexRangeReturnsBadIndexRangeInvalid.js",
"ReadWithNegativeMaxAgeReturnsBadMaxAgeInvalid.js",
"ReadAttributesWithInvalidIndexRangeShouldReturnBadIndexRangeNoData.js",
"ReadNotReadableNodeShouldReturnBadNotReadableOrBadUserAccessDenied.js",
"ReadValueWithinInvalidDataEncodingShouldReturnBadDataEncodingInvalid.js",
"ReadWithInvalidTimestampsToReturnShouldReturnBadTimestampsToReturnInvalid.js",
"ReadWithinInvalidIndexRangeContainingDashShouldReturnBadIndexRangeInvalid.js",
"ReadWithSingleIndexRangeShouldReturnBadIndexRangeInvalid.js",
"ReadWithBackwardIndexRangeShouldReturnBadIndexRangeInvalid.js",

"Write_IndexRange_Equals_One_For_Each_Core_DataType.js",
"Write_IndexRange_Equals_OneHalf_For_Each_Core_DataType_As_Array.js",
"Write_IndexRange_Equals_ZeroTwo_To_First_Three_Elements_Of_Array_For_Each_DataType.js",
"Write_IndexRange_Equates_To_Last_Three_Items_Of_An_Array.js",
"Write_Array_Complete_Array_For_Each_DataType.js",
"Write_Element_Outside_Bounds_Of_Array.js",
"Write_IndexRange_One_Index_Of_MultiDimensional_Array_First_Element_From_Second_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_First_Element_From_Each_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_First_Three_Elements_Of_Each_Dimension.js",
"Write_IndexRange_Range_Of_Indexes_Of_MultiDimensional_Array_Last_Three_Elements_Of_Each_Dimension.js",
"Write_IndexRange_To_Subset_Of_Array_Verify_Timestamps_Updated.js",
"Write_IndexRange_Is_Out_Of_Bounds_Int32_Divide_By_2.js",
"Write_IndexRange_Is_Invalid_7_2_For_Node_DataType.js",
"Write_IndexRange_Syntax_Invalid_Used_For_DataType_Node.js",
"Write_IndexRange_Invalid_Syntax_Range_Not_Actually_Specified_As_Range.js",

"Write_IndexRange_Invalid_Using_Negative_Numbers_For_Each_DataType.js",

"Read_Request_Default_Binary_Encoding.js",
"Read_Request_DataEncoding_Of_Xml.js",
"Read_Request_Unknown_Encoding_For_Node.js",
"Read_Request_Encoding_For_Non_Value_Attribute_Of_Variable.js",
"CreateMonitoredItems_Request_Unsupported_DataEncoding_Modbus.js",
"CreateMonitoredItems_DataEncoding_Namespace_Does_Not_Exist.js",
"CreateMonitoredItems_Request_Encoding_For_Non_Value_Attribute.js",

"Write_Valid_Attribute_Of_Node_NoTimestamps.js",
"Write_Value_Attribute_Multiple_Nodes.js",
"Write_to_Single_Node_Multiple_Times_In_Same_Call.js",
"Write_AccessLevel_CurrentWrite_Expects_Good.js",
"Write_Minimum_Value_For_Each_Supported_DataType.js",
"Write_Max_Value_Of_Each_Supported_DataType.js",
"Write_ByteString_To_Byte_Expects_Success.js",
"Write_LocalizedText_All_Some_No_Parameters_Of_Structure_Type.js",
"Write_Values_That_Are_Subtype_Of_UInteger.js",
"Write_Values_That_Are_Subtype_Of_ULongInteger.js",
"Write_NaN_To_All_Floats.js",
"Write_String_In_Extended_Codepage.js",
"Write_Value_Attribute_NoStatus_NoTime_Node_ValueRank_Array_Entire_Array.js",
"Write_Value_Attribute_NoStatus_NoTime_Several_Nodes_ValueRank_Array_Entire_Array.js",
"Write_Value_Attribute_NoStatus_NoTime_Node_ValueRank_MultiDimensional_Array_Entire_MultiDimensional_Array.js",
"Write_Value_Attribute_NoStatus_NoTime_Several_Nodes_ValueRank_MultiDimensional_Array_Entire_MultiDimensional_Array.js",
"Write_Empty_Nodes_To_WriteArray.js",
"Write_To_Invalid_Attribute_Of_Invalid_Node.js",
"Write_Valid_Node_For_Node_Using_Invalid_Syntax.js",
"Write_Value_To_And_DisplayName_Name_Attributes_On_Multiple_Invalid_Nodes.js",

"Write_Invalid_Attribute.js",
"Write_Invalid_Attribute_To_Valid_Node_Multiple_Times_In_Same_Call.js",
"Write_To_Node_Whose_AccessLevel_Is_ReadOnly_Expect_Bad_NotWritable.js",
"Write_Value_Using_Wrong_DataType.js",
"Write_Null_To_Each_DataType.js",
"WriteIntegerType_Receives_Values_Of_Incorrect_SubType.js",
"WriteInteger_Receives_Values_Of_Incorrect_SubType.js",
"WriteInteger_Receives_Values_Of_Incorrect_SubType_AnotherCase.js",
"WriteError_Write_LocalizedText_With_Non_Existent_Locale.js",

"eventFilterWithContradictoryConditionsShouldFailOrReturnNoEvents.js",

"ServerObject.StructureConsistency.NamespaceMapping.js",
"CoreSystemNodes.BrowseName.Read.js",

"Read_ServerDiagnostics_BrowseName.js",
"ServerDiagnostics_Type_DefinedCorrectly.js",
"Check_CurrentSessionCount_And_CumulatedSessionCount.js",
"Check_SamplingIntervalDiagnosticsArray.js",
"Check_SubscriptionDiagnosticsArray.js",
"Check_SubscriptionDiagnosticsArray_In_Real_Time.js",
"Verify_ModifyCount_Subscription_Diagnostic.js",
"Check_RepublishMessageCount_Subscription_Diagnostic.js",
"Check_PublishRequestCount_And_DataChangeNotificationsCount_Subscription_Diagnostics.js",

"Check_DisabledMonitoredItemCount_Diagnostics_Property.js",
"Check_MonitoringQueueOverflowCount_Subscription_Diagnostic.js",
"Check_Current_CumulatedSubscriptionCount.js",
"Repeat_Current_CumulatedSubscriptionCount.js",
"Check_ServerDiagnostics_EnabledFlag.js",
"Verify_EnabledFlag_Toggle_DoesNot_Increase_SessionCount.js",
"Static_Diagnostics_Return_BadNotReadable_When_EnabledFlag_Is_False.js",
"Test_Sessions_Are_Added_To_SessionsDiagnosticsSummary.js",
"Check_Security_RejectedSessionCount.js",
"SessionDiagnostics_RejectedSessionCount.Security.RejectedSessionCount.IncrementVerification.js",
"Call_GetMonitoredItems_With_Two_Subscriptions_Two_Items.js",
"CreateSubscription_With_Zero_Items.js",
"Two_Subscriptions_Both_Checked.js",
"Invalid_SubscriptionId.js",
"Call_GetMonitoredItems_SubscriptionId_Belongs_To_Another_Session.js",

"EventQueueOverflow.SingleEventLostCheck.js",

"Validate_Correctness_Of_ResendData_Method.js",
"Verify_DataChangeNotifications_Sent_AllMonitoredItems_MonitoringModeReporting.js",
"Verify_DataChangeNotifications_Sent_AllMonitoredItems_MonitoringModeReporting_PublishingIntervalNotTriggered.js",
"Verify_DataChangeNotifications_NotSent_AllMonitoredItems_MonitoringModeSampling.js",

"Verify_DataChangeNotifications_NotSent_AllMonitoredItems_MonitoringModeDisabled.js",
"Verify_DataChangeNotifications_Only_Generated_For_MonitoredItems_Of_Subscription_MonitoringModeReporting.js",
"Verify_DataChangeNotifications_Sent_EvenIf_MaxNotificationsPerPublish_Exceeded.js",
"Verify_ResendData_Method_DoesNot_Trigger_Resending_Of_Events.js",
"Verify_Server_Only_Generates_DataChangeNotifications_For_Given_SubscriptionID.js",
"Validate_Server_Keeps_Operating_When_Calling_ResendData_With_Empty_Subscription.js",
"Verify_After_Calling_ResendData_Only_One_Value_Per_MonitoredItem_Reported.js",
"Invoke_ResendData_With_Non_Existent_Subscription.js",
"ResendData_Method_Cannot_Be_Invoked_From_Another_Session.js",
"Call_ResendData_Method_Without_Having_Subscription_In_Server.js",

"Verify_ServerCapabilities_Object.js",
"Check_MinSupportedSampleRate.js",
"Check_MaxBrowseContinuationPoints.js",
"Check_MaxArrayLength.js",
"Check_MaxStringLength.js",
"Check_MaxByteStringLength.js",
"Check_MaxNodesPerRead.js",
"Check_MaxNodesPerWrite.js",
"Check_MaxNodesPerMethodCall.js",
"Check_MaxNodesPerBrowse.js",
"Check_MaxNodesPerRegisterNodes.js",

"CheckTypesFolderStructure.js",
"DataTypesValidation.js",
"EventTypesValidation.js",
"ObjectTypesValidation.js",
"ReferenceTypesValidation.js",

"VariableTypesValidation.js",

"Type_Defined_In_AddressSpace.js",
"DataItems_ShouldOperate_With_TranslateBrowsePathsToNodeIds.js",
"DataItems_ShouldOperate_With_TranslateBrowsePathsToNodeIds_MultipleDataItems.js",
"Read_Value_Attribute_DataItemNodes_EachDataType_Byte_Double_Float_GUID_Int16_Int32_Int64_UInt16_UInt32_UInt64_SByte_String.js",
"Write_Three_Values_EachSupportedDataType_Min_Max_Middle_Of_DataTypeRange.js",
"Write_To_Multiple_DataItemNodes_AllSupportedDataTypes_SingleCall_Max_Value_Of_CorrespondingDataType.js",
"Write_To_Definition_Property_Of_DataItem_AcquireHandle_Using_TranslateBrowsePathsToNodeIds.js",
"Write_To_ValuePrecision_Property_Of_DataItem_AcquireHandle_Using_TranslateBrowsePathsToNodeIds.js",

"Write_To_DataItemNode_ValuePrecision_Integer_Value_ReadBack_Values_Same_Or_Else_Differ_Within_Range_Specified_By_Precision.js",
"Write_Value_To_DataItemNode_Float_Double_ThatMatchesIts_ValuePrecision.js",
"Write_Value_To_DataItemNode_Float_Double_ExceedsIts_ValuePrecision.js",
"Write_Current_SystemTime.js_DataItemNode_DataType_DateTime_Supports_ValuePrecision_Variable.js",
"Subscribe_AddMonitoredItems_DataItem_EachSupportedDataType_EnabledSubscription_CallPublish_VerifyValuesMatchExpected.js",
"Subscribe_AddMonitoredItem_EachSupportedDataType_EnabledSubscription_WriteMax_Value_Corresponding_DataType_CallPublish.js",
"Subscribe_AddMonitoredItem_AbsoluteDeadband_Value_10_EachSupportedDataType_EnabledSubscription_CallPublish_Pass_NotPassDeadband.js",
"Browse_AvailableInverseReferences_DataItemNode.js",
"Browse_AvailableReferences_BothDirections_DataItemNode.js",
"TranslateBrowsePathsToNodeIds_GetProperties_For_AllConfiguredItems.js",
"Read_Attributes_Value_DataType_AccessLevel_MinimumSamplingInterval.js",
"Write_Value_Using_WrongDataType_To_DataItem_HasProperty_Definition.js",
"Write_Value_UsingWrongDataType_To_DataItem_HasProperty_ValuePrecision.js",

"MultiStateDiscreteType_StructureValidation.js",
"Read_Node_Of_This_Type_Check_EnumStrings_Variable_Exists.js",
"Read_MultipleNodes_Of_ThisType_InSingleCall.js",
"Write_To_SingleNode_ThisType_EachValue_SupportedByEnumerationLength.js",
"Subscription_SingleNode_ThisType_Loop_Write_CallPublish_CompareReceivedVsWritten",
"Subscription_MultipleNodes_ThisType_WriteValues_CallPublish_CompareReceivedVsWritten",
"Subscription_EnumStrings_Variable",
"Browse_All_Forward_References",
"Browse_Node_Of_TwoStateDiscreteType_Requesting_All_Forward_References",
"Browse_Node_Of_MultiState_Type_Requesting_All_Forward_References",
"TranslateBrowsePathsToNodeIds_Request_EnumValues_And_ValueAsText",
"Write_To_EnumStrings_Property",
"Write_To_ValueAsText_Property",
"Write_Value_Exceeds_Range_Defined_By_EnumStrings_Property",
"Write_Value_As_String_Within_Bounds_Of_EnumStrings_Length",

"TwoStateDiscreteType_Structure",
"WriteMultipleTwoStateDiscreteValues",
"WriteMultipleTwoStateDiscreteValuesFalse",
"WriteMultipleTwoStateDiscreteTypesAlternating",
"subscribeWritePublishCompareLoop",
"subscribeMultipleNodesWritePublishCompareLoop",
"subscribeMultipleNodesWritePublishCompareLoop",
"browseForwardInverseBothReferences",
"translateBrowsePathsToNodeIdsBothProperties",
"WriteToTrueStateAndFalseState",
"WriteTrueBadTypeMismatch",
"WriteTrueUppercaseBadTypeMismatch",
"WriteIncorrectStringDataType",
"WriteIncorrectStringDataType3",
"WriteIncorrectStringDataType2",
"WriteIncorrectStringDataType4",
"WriteIncorrectStringDataType5",
"WriteIncorrectStringDataType6",
"WriteIncorrectStringDataType3",
"WriteIncorrectStringDataType7",
"testObservedTimestampsReturn",
"testStartEndDateVaryingNodesPartialRequest",
"testStartEndDateNoHistoryData",
"testStartEndDateNoHistoryDataBoundaryValues",
"testStartEndDateNoDataBetweenTimeBounds",
"testStartEndDateNoDataBetweenTimestampsVaryingOrderAndBounds",
"testStartEndDateNoDataBetweenButExistsAtEndpoints",
"testContinuationPointsMaintainedUntilEOF",
"testContinuationPointsMaintainedUntilEOF_Loop2",
"testReceiveBoundsWithStartEndDatePartialRequest",
"testIndexRangeParameterAllArrayBasedNodes",
"testIndexRangeParameterExceedsDimensions",
"testTwoDimensionalIndexRangeParameterAllArrayNodes",
"testReceiveBoundsStartEndSingleNodeRequest",
"testReceiveBoundsPartialExistVaryingNodesPartialRequest",
"requestHistoryMax5ValuesExistingDataBoundaryValues",
"requestRangeWithBadQualityData",
"requestRangeWithUncertainQualityData",
"requestHistoryMax5ValuesExistingDataBoundaryValues_2",
"initMultipleHistoryReadRequestsExceedContinuationPoints",
"errSpecifyEmptyInvalidRequestHeader",
"errInvalidTimestampsToReturnRequest",
"errInvalidTimestampsToReturnValue",
"errRequestServerTimestampsToReturnUnsupported",
"errRequestBothTimestamps",
"errDoNotPopulateReadRawModifiedDetails",
"errRequestHistoryInvalidNodeId",
"errRequestHistoryNodeDoesNotExist",
"errRequestIndexRangeNonArrayNode",
"errRequestSyntacticallyIncorrectIndexRangeArrayNode",
"errUnknownEncodingValue",
"errRequestRawValuesNodeNotAccessible",
"errReusePreviouslyUsedContinuationPoint",
"errUseBrowseCPInHistoryCall",
"errReadHistoryReleaseCPThenReuse",
"errRequestUnsupportedTimestampFormat",
"errReadModifiedValuesWithReturnBoundsTrue",
"errReadRawValuesNoRecordsTimespan",
"errReadRawHistoryStartEndDatesNotExist",
"errReadRawHistoryServerNotCollectingData",









"errReadRawDataHistorianOffline",
"errSpecifyIndexRangeNonArrayNode_2",
"errSpecifyRandomContinuationPoint",
"errSpecifyHistoryValidNodeNoHistoryAccess",
"errSpecifyEmptyInvalidRequestHeader_2",
"errDoNotSpecifyTwoOfThreeRequiredParameters",



"basic128Rsa15_SignOnly",
"basic128Rsa15_SignEncrypt",
"basic128Rsa15_DosAttemptConsumeChannels",
"basic128Rsa15_DosAttackConsumeSecureChannelsCreateSessions",


"basic256Sha256_SignOnly",
"basic256Sha256_SignEncrypt",
"basic256Sha256_DosAttemptConsumeChannels",
"basic256Sha256_DosAttackConsumeSecureChannelsCreateSessions",

"aes128Sha256RsaOaep_SignOnly_Success",
"aes128Sha256RsaOaep_SignEncrypt_Success",
"aes128Sha256RsaOaep_DosAttemptConsumeChannels",
"aes128Sha256RsaOaep_DosAttackConsumeSecureChannelsCreateSessions",

"aes256Sha256RsaPss_SignOnly",
"aes256Sha256RsaPss_SignEncrypt",
"aes256Sha256RsaPss_DosAttemptConsumeChannels",
"aes256Sha256RsaPss_DosAttackConsumeSecureChannelsCreateSessions",


"basic256_SignOnly",
"basic256_SignEncrypt",
"basic256_DosAttemptConsumeChannels",
"basic256_DosAttackConsumeSecureChannelsCreateSessions",

"createSubscriptionDefaultParameters",
"createSubscriptionPublishingIntervalOne",
"createSubscriptionPublishingIntervalZero",
"createSubscriptionPublishingIntervalIntMax",
"createSubscriptionLifetimeKeepAliveZero",
"createSubscriptionLifetime3KeepAlive1",
"createSubscriptionLifetimeEqualsKeepAlive",
"createSubscriptionLifetimeLessThanKeepAlive",
"createSubscriptionLifetimeLess Than3xKeepAlive",
"createSubscriptionLifetimeUInt32MaxKeepAliveHalfMax",
"createSubscriptionLifetimeUInt32MaxKeepAliveHalfMax_2",
"createSubscriptionLifetimeKeepAliveUInt32Max",
"createSubscriptionLifetimeKeepAliveBothUInt32Max",
"createSubscriptionPublishingDisabledNoPublish",
"createSubscriptionNoMonitoredItemsExpectKeepAlive",
"createSubscriptionNoEarlyExpiry",
"createSubscriptionZeroMonitoredItemsKeepAlives",
"createSubscriptionNoMonitoredItemsKeepAlives_2",
"createSubscriptionNoMonitoredItemsKeepAliveChecking",
"createSubscriptionPublishingDisabledSequenceNum1",
"createSubscriptionZeroMonitoredItemsVariousWaitKeepAlives",
"createSubscriptionOneMonitoredItemVariousTimingValues",
"modifySubscriptionDefaultParameters",
"modifySubscriptionPublishingIntervalGreater",
"modifySubscriptionPublishingIntervalLess",
"modifySubscriptionPubIntervalInvalidReturnsFalse",
"modifySubscriptionPubIntervalRevisesValue",
"modifySubscriptionPubIntervalZeroRevises",
"modifySubscriptionPubIntervalMaxUInt32",
"modifySubscriptionLifetimeKeepAlive3xConflict",
"modifySubscriptionLifetimeKeepAliveZero",
"modifySubscriptionLifetimeKeepAliveRevisesMin",
"modifySubscriptionLifetimeEqualsKeepAliveRevisesMin",
"modifySubscriptionLifetimeLess ThanKeepAlive",
"modifySubscriptionLifetimeLess Than3xKeepAlive",
"modifySubscriptionLifetimeMaxUInt32KeepAliveThird",
"modifySubscriptionLifetimeHalfUInt32KeepAliveMax",
"modifySubscriptionLifetimeKeepAliveBothMaxUInt32",
"modifySubscriptionMaxNotificationsPerPublish",
"modifySubscriptionMaxNotificationsToTenDiscardOldestTrue",
"republishRequestsOutOfOrder",
"setPublishingModeDisabledEnabledSub",
"setPublishingModeEnabledDisabledSub",
"setPublishingModeEnableAlreadyEnabledSub",
"setPublishingModeDisableAlreadyDisabledSub",
"modifySubscriptionSpecifySameSubFiveTimes",
"modifySubscriptionSpecifySameSubIdMultipleTimes",
"publishDefaultParameters",
"publishAcknowledgeValidSequenceNumber",
"publishAcknowledgeMultipleSeqNumbersSingleSub",
"publishAcknowledgeMultipleSeqNumbersMultipleSubs",
"publishAcknowledgeSequenceNumberZero",
"publishVerifyScanRatesDataChanges",
"publishAcknowledgeValidInvalidSeqNumbers",
"republishDefaultParameters",
"republishRetrievesLastThreeUpdates",
"republishIgnoreInitialDataChangeLongWait",
"republishRequestMissingSeqBetweenAcknowledged",
"deleteSubscriptionsDefaultParameters",
"deleteSubscriptionsNoPreDeleteMonitoredItems",
"republishRequestSequenceNumberFuture",
"createSubscriptionTimeoutExtendsOnServiceCall",
"requestHeaderTimeoutHintSmallerThanKeepAlive",
"createSubscriptionNegativePublishingInterval",
"createSubscriptionMaxSubscriptionsPlusOne",
"createSubscriptionPublishingIntervalNaN",
"modifySubscriptionExpiresAfterLifetime",
"modifySubscriptionInvalidSubscription",
"modifySubscriptionIdZero",
"modifySubscriptionPublishingIntervalNegative",
"modifySubscriptionSpecifyNegativePublishingInterval",
"setPublishingModeDisableInvalidSubscription",
"setPublishingModeEnableInvalidSubscription",
"setPublishingModeEnableNonExistentSubNoSessionSubs",
"publishNoSubscriptionDefined",
"publishExpectBadSubscriptionIdInvalidResult",
"publishAcknowledgeSameSeqNumberTwice",
"publishAcknowledgeMultipleInvalidSequenceNumbers",
"publishAcknowledgeMultipleInvalidSeqNumbersUnknown",
"publishAcknowledgeMultipleInvalidSeqNumbersMultipleValidSubs",
"republishNoSubscriptionCreated",
"republishSubscriptionIdZero",
"republishInvalidSubscriptionId",
"republishRetransmitSequenceNumberZero",
"republishInvalidRetransmitSequenceNumber",
"republishRequestAlreadyAcknowledgedSequenceNumber",
"republishOnDeletedSubscription",
"deleteSubscriptionsInvalidSubscriptionId",
"deleteSubscriptionsAlreadyDeletedSubscription",
"deleteSubscriptionsMultipleAlreadyDeleted",
"deleteSubscriptionsEmptyIdsArray",
"deleteSubscriptionsUntilTooManyOperationsOr1000",
"createMonitoredItemsByteStringArrayIndexOutOfBounds",
"modifySubscriptionWithAnotherSessionSubscriptionId",
"setPublishingModeWithAnotherSessionSubscriptionId",
"SubscriptionDurableMethodExistsAndDefined",
"setSubscriptionDurableDefaultParameters",
"setSubscriptionDurableLifetimeHoursMaxUInt32",
"setSubscriptionDurableLifetimeHoursZero",
"setupDurableSubWithOneMonitoredItem",
"addMonitoredItemsLargeBufferSizeToDurableSub",
"establishDurableSubWithMultipleMonitoredItems",
"createDurableSubAndAddMonitoredItems",
"createDurableSubWithOneOrMoreMonitoredItems",
"createDurableSubWithServerNotifierEventFilter",
"createDurableSubWithZeroMonitoredItems",
"createDurableSubscription",
"createSubShortLifespanParams",
"setSubscriptionDurableNoParameters",
"setSubscriptionDurableSpecifyOneParameter",
"setSubscriptionDurableSpecifyThreeUIntParameters",
"setSubscriptionDurableWrongDataTypesAllInParams",
"setSubscriptionDurableOnExistingSubscription",
"setSubscriptionDurableAnotherSessionId",
"setSubscriptionDurableNonExistentId",
"createSubscriptionAckQueuedSeqNumbersOutOfOrder",
"createSubscriptionCheckInDiagnostics",
"subscriptionPrioritiesEqual",
"oneSessionTwoSubscriptions",
"subscriptionWithHigherPriority",
"subscriptionPriorityWaitForStarve",
"modifyOneSubscriptionPriorityHigher",
"modifyOneSubscriptionPriorityLower",
"modifyFirstSubscriptionPriorityHigherThenLower",
"modifySecondSubscriptionPriorityHigherThenLower",
"disableMultipleSubscriptionsSomeActiveInactive",
"enableMultipleSubscriptionsSomeActiveInactive",
"disableAlreadyDisabledSubscriptions",
"enableAlreadyEnabledSubscriptions",
"enableTwoPreviouslyDisabledSubscriptions",
"disableOneSubscriptionOtherActiveSameSession",
"enableTwoAlreadyEnabledSubscriptionsSameSession",
"deleteMultipleSubscriptions",
"publishMultipleSubscriptionServicedWithoutPrejudice",
"republishTwoSubsAckFirstOnlyRepublishSecond",
"setMonitoringModeDistinguishDifferentSubsWhenDisablingOne",
"twoSubscriptionsOneEventsOneDataChanges",
"disableMixValidInvalidSubscriptionIds",
"enablePublishingInvalidSubscriptionIds",
"enablePublishingValidInvalidSubscriptionIds",
"createSubscriptionFiveSubsVaryingPrioritiesCheckNotifications",
"createSubscriptionFiveSubsPerSessionFiveSessions",
"deleteSubscriptionsMultipleValid",
"setPublishingModeEnableFiveDisabledSubsVerifyPublish",
"setPublishingModeCreateFiveDisableTwoVerifyPublish",
"createSubscriptionThreeSubsVariousPriorities",
"publishMultipleSubscriptionServicedWithoutPrejudice",
"setPublishingModeDisableMultipleInvalidSubs",
"publishAcknowledgeMultipleInvalidSeqNumbersMultipleInvalidSubIds",
"deleteSubscriptionsMultipleInvalid",
"deleteSubscriptionsMultipleSomeValidSomeInvalid",
"deleteSubscriptionsMultipleValidAndAlreadyDeleted",
"createTenSubscriptions",
"deleteSubscriptionsMultipleValid",
"setPublishingModeEnableTenPreviouslyDisabledSubs",
"setPublishingModeTenActiveDisableOdd",
"publishMultipleSubscriptionServicedWithoutPrejudice",
"queueTwoPublishRequestsSingleSession",
"deleteSubscriptionWithTwoOutstandingPublish",
"modifySubscriptionCheckTimingsAfterPubIntervalMod",
"republishMessageRetransmissionQueueSizeExpectedTwo",
"publishTimeoutHintCausesBadTimeout",
"queueMorePublishRequestsThanServerSupport",
"browseReferenceTypeIdNullAllReferences.js",
"browseReferencesForwardDirection.js",
"browseReferencesInverseDirection.js",
"browseReferencesSpecifiedRefTypeAndNOSubtypesMatch.js",
"browseReferencesSpecifiedRefTypeAndSubtypesMatch_02.js",
"browseReferencesMatchingNodeClassMask.js",
"browseMultipleNodesInOneCall.js",
"browseMultipleNodesMixValidInvalidIds.js",
"browseAllReferencesNodeClassMaskZero.js",
"browseReturnOnlyOneRefDescriptionField.js",
"browseReferencesSpecifiedRefTypeNoSubtypesParentMatch.js",
"browseReferencesSpecifiedRefTypeSubtypesParentTypeMatch.js",
"browseReferencesNodeClassView.js",
"browseNonNullRefViewFieldsExceptTypeDefinition.js",
"browseReturnRefDescriptionFieldsByResultMask.js",
"browseRefsRefTypeRecursiveSubtypeGrandparentMatch.js",
"browseReturnDiagnosticInfoByBitMask.js",
"browseReturnDiagnosticsWhenZero.js",
"browseBadNodeInInvalidSyntax.js",
"browseBadNodeIdUnknownNotInAddressSpace.js",
"browseBadBrowseDirectionInvalid.js",
"browseBadViewIdUnknownViewNotExists.js",
"browseBadReferenceTypeIdInvalid.js",
"browseBadNothingToDNodesToBrowseEmpty.js",
"browseBadViewIdUnknownSpecifiedViewNotExists.js",
"browseBadReferenceTypeIdNotRefTypeNode.js",
"browseBadNothingToDNoContinuationPoints.js",
"browseBadSecurityCheckFailedNullAuthToken.js",
"browseBadSecurityCheckFailedAuthTokenNotExists.js",
"browseForMaximumOneReference.js",
"browseNextNextRefReleaseContinuationPoints.js",
"browseNextReturnCPWhenReleaseFalseMoreRefs.js",
"browseNextToLastRefGoodEmptyCP.js",
"browseReturnInverseRefsWhenDirectionInverse.js",
"browseReturnRefsSpecifiedTypeNoSubtypes.js",
"browseReturnRefsSpecifiedTypeWithSubtypes.js",
"browseNextReturnRefsMatchingNodeClassMask.js",
"browseNextReturnResultFieldsByResultMask.js",
"browseNextReturnFewerRefsRequestedOrRemaining.js",
"browseNextReturnViewsWhenNodeClassMaskIncludes.js",
"browseNextReturnDiagnosticsByDiagnosticMask.js",
"browseNextNoDiagnosticInfoWhenMaskZero.js",
"browseNextBadNoContinuationPointsMaxReached.js",
"browseNextBadContinuationPointInvalidPreviousSession.js",
"browseNextBadContinuationPointInvalidAfterRelease.js",
"browseNextBadContinuationPointInvalidAlreadyUsed.js",
"browseNextBadSecurityCheckFailedNullAuthToken.js",
"browseNextBadSecurityCheckFailedAuthTokenNotExists.js",
"browseNextBadInvalidTimestampRequestHeader.js",
"browseReturnFiveContinuationPoints.js",
"browseNextReturnMultipleContinuationPoints.js",
"browseNextCombineRefsFromSeparateBrowseCalls.js",
"NodesRegistration:VerifyReferenceToNodesToRegister[0].js",
"NodesRegistration:Verify5NodeReferences.js",
"NodesRegistration:Verify25NodeReferences.js",
"NodesRegistration:Verify50NodeReferences.js",
"NodesRegistration:Verify100NodeReferences.js",
"NodesRegistration:Verify20DuplicateNodeRegistrations.js",
"NodesRegistration:VerifyMixedExistingandNon-ExistentNodeRegistrations.js",
"NodesRegistration:VerifyDiagnosticInfoBasedonBitmask.js",
"NodesRegistration:VerifyNoDiagnosticInfoWhenBitmaskis0.js",
"NodesUnregistration:VerifySuccessfulSingleNodeUnregistration.js",
"NodesUnregistration:VerifySuccessful5NodeUnregistrations.js",
"NodesUnregistration:VerifySuccessful25NodeUnregistrations.js",
"NodesUnregistration:VerifySuccessful50NodeUnregistrations.js",
"NodesUnregistration:VerifySuccessful100NodeUnregistrations.js",
"NodesUnregistration:VerifySuccessfulMixedRegisteredandUnregisteredNodeUnregistrations.js",
"NodesUnregistration:VerifySuccessfulMixedRegisteredandNon-ExistentNodeUnregistrations.js",
"NodesUnregistration:VerifySuccessfulUnregistrationOfNon-ExistentNode.js",
"NodesUnregistration:VerifySuccessfulUnregistrationOfAlreadyUnregisteredNode.js",
"NodesUnregistration:VerifySuccessfulUnregistrationOfMultipleUnregisteredNodes.js",
"NodesUnregistration:VerifyNoUnregistrationWhenSourceNodeisUnregistered.js",
"NodesUnregistration:VerifyDiagnosticInfoBasedonBitmask.js",
"NodesUnregistration:VerifyNoDiagnosticInfoWhenBitmaskis0.js",
"NodesRegistration:HandleEmptyNodesToRegisterArray(Bad_NothingToDo).js",
"NodesRegistration:HandleExcessiveNodeRequests.js",
"NodesRegistration:HandleNon-ExistentSingleNodeId(Bad_NodeIdUnknown).js",
"NodesRegistration:HandleMultipleNon-ExistentNodeId(Bad_NodeIdUnknown).js",
"NodesRegistration:Error-InvalidSingleNodeId(Bad_NodeIdInvalid).js",
"NodesRegistration:Error-MixedValidandInvalidNodes(Bad_NodeIdInvalid).js",
"NodesRegistration:Error-NullAuthenticationToken(Bad_SecurityChecksFailed).js",
"NodesRegistration:Error-MissingAuthenticationToken(Bad_SecurityChecksFailed).js",
"NodesRegistration:Error-InvalidRequestTimestamp(Bad_InvalidTimestamp).js",
"NodesRegistration:Error-NoNodestoUnregister(Bad_NothingToDo).js",
"NodesUnregistration:Error-NullAuthenticationToken(Bad_SecurityChecksFailed).js",
"NodesUnregistration:Error-MissingAuthenticationToken(Bad_SecurityChecksFailed).js",
"NodesUnregistration:Error-InvalidRequestTimestamp(Bad_InvalidTimestamp).js",



"publishFiveConcurrentRequestsSingleSession.js",
"createHalfSupportedSessions.js",
"republishBasic.js",
"publishTimeoutHintCausesBadTimeout.js",
"Err-001.js",
"10SubscriptionsTenPublishCalls.js",
"setPublishingModeCreateTenDisableFiveVerifyPublish.js",
"publishTenConcurrentRequestsQueued.js",
"publishMoreRequestsThanServerHandle.js",
"closeSessionDeleteSubsFalseVerifyNotDeleted.js",
"closeSessionCreateSubsCheckDeleted.js",
"modifySubscriptionTransferedToAnotherSession.js",
"setPublishingModeModifyTransferredSubPublishing.js",
"setPublishingModeModifyMultipleTransferredSubsPublishing.js",
"publishOnTransferredSubscription.js",
"republishOnTransferredSubscription.js",
"republishCloseExistingSessionWithoutKillingSub.js",
"transferSubscriptionToAnotherSessionPublishBoth.js",
"transferSubscriptionToAnotherSessionPublishBoth_02.js",
"transferSubscriptionToAnotherSessionPublishBoth_03.js",
"transferSubscriptionToAnotherSessionPublishBoth_04.js",
"transferSubscriptionToAnotherSessionPublishBoth_05.js",
"transferSubscriptionToAnotherSessionPublishBoth_06.js",
"transferSubscriptionToAnotherSessionPublishBoth_07.js",
"transferSubscriptionToAnotherSession_Simple.js",
"deleteSubscriptionsTransferredSub.js",
"deleteSubscriptionsTransferredSubsAllDeleted.js",
"setMonitoringModeTransferSubCallFromOriginalSession.js",
"deleteSubscriptionsSomeValidInvalidTransferred.js",
"callTransferSubscriptionNoIds.js",
"callTransferSubscriptionMoreIdsThanServerCanHandle.js",
"callTransferSubscriptionInvalidNonExistentId.js",
"createSubMonitoredItemReplicateClientTransferToNewSession.js",
"createSessionUserCredsTransferSub.js",
"createSessionDifferentUserCredsTransferSub.js",
"createSessionAnonymousCredsTransferSubDifferentSecureChannel.js",

"TranslateBrowsePathToNodes:VerifyValidTargetIdFor1PathElement.js",
"TranslateBrowsePathToNodes:VerifyNodeIdofLastBrowsePathElement.js",
"TranslateBrowsePathToNodes:VerifyNodeIdofLastBrowsePathElementWhen10BrowsePathElements.js",
"TranslateBrowsePathToNodes:VerifyNodeIdofLastBrowsePathElementsWhenInverseIsTrue.js",
"TranslateBrowsePathToNodes:VerifyNodeIdofRelativePathElement.ReferenceTypeIdisParentTypeandIncludeSubtypesTrue.js",
"TranslateBrowsePathToNodes:VerifyNodeIdofMatchingBrowseNameWhenReferenceTypeIdisANullNodeId.js",
"TranslateBrowsePathToNodes:Verify4TargetIds,1forEachof4BrowsePathElements.js",
"TranslateBrowsePathToNodes:Verify4TargetIds,1forEachof10BrowsePathElements.js",
"TranslateBrowsePathToNodes:VerifyTargetNodeIdWhenRelativePathElement.ReferenceTypeIdisTargetandIncludeSubtypesTrue.js",
"TranslateBrowsePathToNodes:VerifyTargetNodeIdWhenRelativePathElement.ReferenceTypeIdisGrandparentTypeandIncludeSubtypesTrue.js",
"TranslateBrowsePathToNodes:VerifyDiagnosticInfoasSpecifiedbyReturnDiagnosticBitMask.js",
"TranslateBrowsePathToNodes:VerifyNoDiagnosticInfoWhenReturnDiagnosticsIs0.js",
"TranslateBrowsePathToNodes:Error-InvalidStartingNodeId(Bad_NodeIdInvalid).js",
"TranslateBrowsePathToNodes:Error-GoodMatchforBrowsePathandBadforNonMatchingBrowsePaths.js",
"TranslateBrowsePathToNodes:Error-EmptyRequest(Bad_NothingToDo).js",
"TranslateBrowsePathToNodes:Error-UnknownStartingNodeId(Bad_NodeIdUnknown).js",
"TranslateBrowsePathToNodes:Error-NothingToDoWhenRelativePathisEmpty.js",
"TranslateBrowsePathToNodes:Error-BrowseNameDoesNotExistMatch.js",
"TranslateBrowsePathToNodes:Error-TargetNameisANullQualifiedName.js",
"TranslateBrowsePathToNodes:Error-BadBrowseNameIdWhenBrowseNameisANullBrowseName.js",
"TranslateBrowsePathToNodes:Error-ReferenceTypeIdDoesNotExistMatch.js",
"TranslateBrowsePathToNodes:Error-ContainsInvalidNodeIdforReferenceTypeId.js",
"TranslateBrowsePathToNodes:Error-Non-ExistentNodeIdWhenReferenceTypeIdisANodeIdThatDoesNotExist.js",
"TranslateBrowsePathToNodes:Error-BrowseNameisTooLongorContainsInvalidCharacters.js",
"TranslateBrowsePathToNodes:Error-NoMatchWhenRelativePathElement.ReferenceTypeIdisParentOfReferenceTypeandIncludeSubtypesFalse.js",
"TranslateBrowsePathToNodes:Error-NoMatchWhenReferenceTypeIdisNodeIdofSomethingOtherThanReferenceType.js",
"TranslateBrowsePathToNodes:Error-NoMatchWhenRelativePathElement.IsInverseIsTrueandBrowseNameisInForwardDirection.js",
"TranslateBrowsePathToNodes:Error-AnyMatchAnyNodeWhenReferenceTypeIdisNullandIncludeSubtypesFalse.js",
"TranslateBrowsePathToNodes:TestServerCapabilitiesMaxOperationsPerMethod.js",
"TranslateBrowsePathToNodes:Error-SecurityChecksFailedWhenAuthenticationTokenIsNull.js",
"TranslateBrowsePathToNodes:Error-SecurityChecksFailedWhenAuthenticationTokenDoesNotExist.js",
"TranslateBrowsePathToNodes:Error-BadInvalidTimestampWhenRequestHeader.TimestampIsTooFarOutOfRange.js"














]

# Get the first sentence, and add second/third if needed
def get_first_sentence(text):
    sentences = re.findall(r'[^.?!]+[.?!]', text.strip())
    if not sentences:
        return text.strip()

    first = sentences[0].strip()
    if len(first) >= 25:
        return first

    # Include the second sentence if available
    if len(sentences) > 1:
        second = sentences[1].strip()
        combined = f"{first} {second}"

        # Include the third if second is too short
        if len(second) < 15 and len(sentences) > 2:
            third = sentences[2].strip()
            combined += f" {third}"
        return combined

    return first

# Determine reason from Skipped, Error or Not Supported
def get_reason(node):
    # Check if there is a 'Skipped' child
    skipped = node.find(".//ResultNode[@name='Skipped']")
    if skipped is not None:
        return skipped.get('description', '')

    # Check for 'Error'
    error = node.find(".//ResultNode[@name='Error']")
    if error is not None:
        desc = error.get('description', '')
        if desc.startswith("ActivateSession") or desc.startswith("Write()") or desc.startswith("Read()"):
            return desc
        return get_first_sentence(desc)

    # Check for 'Not Supported'
    not_supported = node.find(".//ResultNode[@name='Not Supported']")
    if not_supported is not None:
        return not_supported.get('description', '')

    return ''

# Process result nodes
def process_results(root):
    results = []

    for result_node in root.findall(".//ResultNode"):
        name = result_node.get('name')
        testresult = result_node.get('testresult')
        description = result_node.get('description', '')

        if name in include_test_steps:
            # Set failure reason
            if testresult == '3':
                reason = "Not Implemented"
            else:
                reason = get_reason(result_node)

            # Classify the test result
            if testresult in ['0', '3', '4', '5']:
                status = 'FAILED'
            elif testresult == '1':
                status = 'WARNING'
            elif testresult == '6':
                status = 'PASSED'
            else:
                continue

            results.append({
                'test_step': name,
                'description': description,
                'result': status,
                'failure_reason': reason if status in ['FAILED', 'WARNING'] else ''
            })

    return results


# Export results to XLSX
def export_to_xlsx(results, filename='filtered_test_results.xlsx'):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Test Results"
    ws.append(['Test Step', 'Description', 'Result', 'Failure Reason'])

    for r in results:
        ws.append([r['test_step'], r['result']])

    wb.save(filename)
    print(f"Results saved to {filename}")

# Run everything
results = process_results(root)
export_to_xlsx(results)




