import { NodeFunction, FunctionInputType } from "@/types/function";

// Permissionless cron job function
export const permissionlessCronFunction: NodeFunction = {
  id: "permissionless-cron",
  name: "Permissionless Cron",
  description: "Schedule tasks to run periodically in a decentralized network",
  category: "Utility",
  groups: ["utilities"],
  inputs: [
    {
      name: "taskName",
      type: "string",
      required: true,
      description: "Name of the scheduled task",
    },
    {
      name: "cronExpression",
      type: "string",
      required: true,
      description: "Cron expression (e.g., '0 * * * *' for hourly)",
    },
    {
      name: "instructions",
      type: "object",
      required: true,
      description: "Instructions to execute when the task runs",
    },
    {
      name: "rewardAmount",
      type: "number",
      required: false,
      default: 0.05,
      description: "Amount in SOL to reward executors per run",
    }
  ],
  output: {
    name: "scheduledTask",
    type: "object" as FunctionInputType,
    description: "The scheduled task information",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { taskName, cronExpression, instructions, rewardAmount = 0.05 } = inputs;

      if (!taskName) {
        throw new Error("Task name is required");
      }

      if (!cronExpression) {
        throw new Error("Cron expression is required");
      }

      if (!instructions) {
        throw new Error("Instructions are required");
      }

      // In a real implementation, this would interact with a Clockwork-style API
      // to schedule the task on a decentralized network of nodes
      
      // For this proof-of-concept, we're just returning a simulated response
      const taskId = `task_${Math.random().toString(36).substring(2, 10)}`;
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: taskId,
        name: taskName,
        cronExpression,
        status: "scheduled",
        nextExecution: calculateNextExecution(cronExpression),
        rewardPerExecution: rewardAmount,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to schedule task: ${(error as Error).message}`);
    }
  },
};

// Helper function to calculate next execution time based on cron expression
function calculateNextExecution(cronExpression: string): string {
  // This is a simplified implementation for the proof-of-concept
  // In reality, we would use a proper cron parser library
  
  // Parse the cron expression
  const parts = cronExpression.split(" ");
  
  // Get current date
  const now = new Date();
  let next = new Date(now);
  
  // Simple logic for common patterns
  if (cronExpression === "* * * * *") {
    // Every minute
    next.setMinutes(now.getMinutes() + 1);
    next.setSeconds(0);
  } else if (cronExpression === "0 * * * *") {
    // Every hour
    next.setHours(now.getHours() + 1);
    next.setMinutes(0);
    next.setSeconds(0);
  } else if (cronExpression === "0 0 * * *") {
    // Every day at midnight
    next.setDate(now.getDate() + 1);
    next.setHours(0);
    next.setMinutes(0);
    next.setSeconds(0);
  } else if (cronExpression === "0 0 * * 0") {
    // Every Sunday at midnight
    next.setDate(now.getDate() + (7 - now.getDay()));
    next.setHours(0);
    next.setMinutes(0);
    next.setSeconds(0);
  } else {
    // For custom expressions, just add a day as a placeholder
    next.setDate(now.getDate() + 1);
  }
  
  return next.toISOString();
}