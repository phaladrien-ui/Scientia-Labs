export interface Task {
  readonly id: string;
  readonly missionId: string;
  readonly objective: string;
  readonly createdAt: Date;
}