import { ResearcherAgent } from "../agents/researcher/researcher";
import type { AgentContext } from "../agents/agent-context";
import type { Mission } from "../missions/mission";
import type { Task } from "../missions/task";
import { CoreRuntime } from "./core-runtime";

export function createScientiaCore() {
  const runtime = new CoreRuntime();

  const researcher = new ResearcherAgent();

  const mission: Mission = {
    id: "mission-1",
    objective: "Conduct a scientific research task",
    createdAt: new Date(),
  };

  const task: Task = {
    id: "task-1",
    missionId: mission.id,
    objective: mission.objective,
    createdAt: new Date(),
  };

  const context: AgentContext = {
    eventBus: runtime.eventBus,
    capabilities: runtime.capabilities,
    llmProviders: runtime.llmProviders,
    mission,
    task,
  };

  return {
    runtime,
    researcher,
    context,
  };
}