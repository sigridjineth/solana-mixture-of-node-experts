"use client";

import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type CronFrequency = "minutely" | "hourly" | "daily" | "weekly" | "custom";

export default function PermissionlessCronNode() {
  const [frequency, setFrequency] = useState<CronFrequency>("hourly");
  const [customCron, setCustomCron] = useState<string>("0 * * * *");
  const [taskName, setTaskName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [nodeStatus, setNodeStatus] = useState<"idle" | "success" | "error">("idle");
  const [estimatedReward, setEstimatedReward] = useState<number>(0.05);
  
  // Map of preset frequencies to cron expressions
  const cronExpressions = {
    minutely: "* * * * *",
    hourly: "0 * * * *",
    daily: "0 0 * * *", 
    weekly: "0 0 * * 0",
    custom: customCron
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value as CronFrequency);
    if (value !== "custom") {
      setEstimatedReward(value === "minutely" ? 0.01 : value === "hourly" ? 0.05 : value === "daily" ? 0.25 : 1.0);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!taskName) return;
    
    setIsSubmitting(true);
    
    try {
      // This would actually connect to a Clockwork-style API in production
      // For the proof-of-concept, we're just simulating the creation of a cron job
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log({
        taskName,
        cronExpression: cronExpressions[frequency],
        estimatedReward
      });
      
      setNodeStatus("success");
      setTimeout(() => setNodeStatus("idle"), 3000);
    } catch (error) {
      console.error("Error scheduling task:", error);
      setNodeStatus("error");
      setTimeout(() => setNodeStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  }, [taskName, frequency, cronExpressions, estimatedReward]);

  return (
    <Card className="w-[350px] bg-gray-900 border-gray-800 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>Permissionless Cron Node</span>
          <Badge variant="outline" className={nodeStatus === "success" ? "bg-green-900 text-green-300" : 
              nodeStatus === "error" ? "bg-red-900 text-red-300" : "bg-blue-900 text-blue-300"}>
            {nodeStatus === "success" ? "Scheduled" : 
             nodeStatus === "error" ? "Failed" : "Ready"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Schedule tasks to run periodically in a decentralized network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Task Name</label>
            <Input
              placeholder="My periodic task"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Frequency</label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="minutely">Every Minute</SelectItem>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Every Day</SelectItem>
                <SelectItem value="weekly">Every Week</SelectItem>
                <SelectItem value="custom">Custom Cron</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {frequency === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Custom Cron Expression</label>
              <Input
                placeholder="* * * * *"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-400">Format: min hour day month weekday</p>
            </div>
          )}
          
          <div className="pt-2 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Network Fee:</span>
              <span>0.001 SOL</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Estimated Reward:</span>
              <span>{estimatedReward.toFixed(3)} SOL/execution</span>
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !taskName}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Task"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}