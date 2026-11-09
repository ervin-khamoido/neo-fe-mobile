export enum UserLevel {
  Level0 = 'level_0',
  Level1 = 'level_1',
  Level2 = 'level_2',
  Level3 = 'level_3',
}

export enum LevelZeroRequirement {
  PersonalInfo_Phone = 'internal:personal_info:phone',
  PersonalInfo_Email = 'internal:personal_info:email',
}

export enum LevelOneRequirement {
  PersonalInfo_FullName = 'internal:personal_info:full_name',
  PersonalInfo_DoB = 'internal:personal_info:dob',
  BankAccount = 'internal:bank_account',
}

export enum LevelTwoRequirement {
  PersonalInfo_Address = 'internal:personal_info:address',
  KYCProviderVerification_KYCLevel2 = 'external:kyc_provider_verification:kyc_level_2',
}

export type LevelRequirement = LevelZeroRequirement | LevelOneRequirement | LevelTwoRequirement

export enum StatusDetailsAction {
  ContactSupport = 'contact_support',
}

export enum LevelStatus {
  NotAvailable = 'not_available',
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Error = 'error',
}

export const LevelStatusName: Record<LevelStatus, string> = Object.freeze({
  [LevelStatus.NotAvailable]: 'Not Available',
  [LevelStatus.NotStarted]: 'Not Started',
  [LevelStatus.InProgress]: 'In Progress',
  [LevelStatus.Pending]: 'Pending',
  [LevelStatus.Approved]: 'Approved',
  [LevelStatus.Rejected]: 'Rejected',
  [LevelStatus.Error]: 'Error',
})
