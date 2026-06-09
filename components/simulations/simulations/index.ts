import { Pendulum } from "./pendulum";

export type SimulationCanvasProps = {
  isRunning: boolean;
};

export const simulations: Record<
  string,
  React.ComponentType<SimulationCanvasProps>
> = {
  pendulum: Pendulum,
};
