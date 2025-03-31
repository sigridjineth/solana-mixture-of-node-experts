import { NodeFunction } from "@/types/function";

// 텍스트 변환 함수
export const fetchDataFunction: NodeFunction = {
  id: "fetch-data",
  name: "Fetch Data",
  description: "Fetches data from an API endpoint",
  category: "Data",
  inputs: [
    {
      name: "url",
      type: "string",
      required: true,
    },
    {
      name: "method",
      type: "string",
      required: false,
      default: "GET",
    },
  ],
  output: {
    name: "response",
    type: "object",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { url, method = "GET" } = inputs;
      const response = await fetch(url, { method });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch data: ${(error as Error).message}`);
    }
  },
};

export const filterDataFunction: NodeFunction = {
  id: "filter-data",
  name: "Filter Data",
  description: "Filters an array based on a key and value",
  category: "Data",
  inputs: [
    {
      name: "data",
      type: "array",
      required: true,
    },
    {
      name: "key",
      type: "string",
      required: true,
    },
    {
      name: "value",
      type: "string",
      required: true,
    },
  ],
  output: {
    name: "filtered",
    type: "array",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { data, key, value } = inputs;
      if (!Array.isArray(data)) {
        throw new Error("Input data must be an array");
      }

      const filtered = data.filter(
        (item) => item[key] && item[key].toString().includes(value)
      );

      return filtered;
    } catch (error) {
      throw new Error(`Failed to filter data: ${(error as Error).message}`);
    }
  },
};

export const sortDataFunction: NodeFunction = {
  id: "sort-data",
  name: "Sort Data",
  description: "Sorts an array based on a key",
  category: "Data",
  inputs: [
    {
      name: "data",
      type: "array",
      required: true,
    },
    {
      name: "key",
      type: "string",
      required: true,
    },
    {
      name: "ascending",
      type: "boolean",
      required: false,
      default: true,
    },
  ],
  output: {
    name: "sorted",
    type: "array",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { data, key, ascending = true } = inputs;
      if (!Array.isArray(data)) {
        throw new Error("Input data must be an array");
      }

      const sorted = [...data].sort((a, b) => {
        if (a[key] < b[key]) return ascending ? -1 : 1;
        if (a[key] > b[key]) return ascending ? 1 : -1;
        return 0;
      });

      return sorted;
    } catch (error) {
      throw new Error(`Failed to sort data: ${(error as Error).message}`);
    }
  },
};

export const calculateStatisticsFunction: NodeFunction = {
  id: "calculate-statistics",
  name: "Calculate Statistics",
  description: "Calculates basic statistics for a numerical array",
  category: "Analytics",
  inputs: [
    {
      name: "data",
      type: "array",
      required: true,
    },
    {
      name: "key",
      type: "string",
      required: false,
    },
  ],
  output: {
    name: "statistics",
    type: "object",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { data, key } = inputs;
      if (!Array.isArray(data)) {
        throw new Error("Input data must be an array");
      }

      let values: number[];

      if (key) {
        values = data.map((item) => Number(item[key])).filter((n) => !isNaN(n));
      } else {
        values = data.filter((n) => !isNaN(Number(n))).map((n) => Number(n));
      }

      if (values.length === 0) {
        throw new Error("No numeric values found in the data");
      }

      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      return {
        count: values.length,
        sum,
        average: avg,
        min,
        max,
      };
    } catch (error) {
      throw new Error(
        `Failed to calculate statistics: ${(error as Error).message}`
      );
    }
  },
};

export const delayFunction: NodeFunction = {
  id: "delay",
  name: "Delay",
  description: "Delays execution for the specified milliseconds",
  category: "Utility",
  inputs: [
    {
      name: "data",
      type: "object",
      required: true,
    },
    {
      name: "ms",
      type: "number",
      required: false,
      default: 1000,
    },
  ],
  output: {
    name: "data",
    type: "object",
  },
  execute: async (inputs: Record<string, any>) => {
    const { data, ms = 1000 } = inputs;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, ms);
    });
  },
};
