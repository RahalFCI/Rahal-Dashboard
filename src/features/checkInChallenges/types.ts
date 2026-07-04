export interface GetCheckInChallengeDto {
  id: string;
  challengeId: string;
  challengeName: string;
  checkInId: string;
  explorerId: string;
  explorerName: string;
  proofMediaUrl: string | null;
  validationStatus: string;
}
