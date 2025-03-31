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

export const mapDataFunction: NodeFunction = {
  id: "map-data",
  name: "Map Data",
  description: "Maps array items by applying transformations",
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
      required: false,
      description: "Key to extract or modify (empty for whole item)",
    },
    {
      name: "targetKey",
      type: "string",
      required: false,
      description:
        "Target key to store result (default: replaces original key)",
    },
    {
      name: "transform",
      type: "string",
      required: false,
      default: "",
      description:
        "JavaScript expression to transform value (e.g., value.toUpperCase(), value * 2)",
    },
  ],
  output: {
    name: "mapped",
    type: "array",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { data, key, targetKey, transform } = inputs;
      if (!Array.isArray(data)) {
        throw new Error("Input data must be an array");
      }

      return data.map((item) => {
        const newItem = { ...item };

        // 키가 지정되지 않았으면 전체 아이템을 대상으로 함
        if (!key) {
          if (transform) {
            try {
              // eslint-disable-next-line no-new-func
              const transformFn = new Function("item", `return ${transform}`);
              return transformFn(item);
            } catch (e) {
              console.error("Transform error:", e);
              return item;
            }
          }
          return item;
        }

        // 특정 키의 값을 대상으로 함
        const value = item[key];
        let result = value;

        // 변환 표현식이 있으면 적용
        if (transform) {
          try {
            // eslint-disable-next-line no-new-func
            const transformFn = new Function("value", `return ${transform}`);
            result = transformFn(value);
          } catch (e) {
            console.error("Transform error:", e);
          }
        }

        // 결과를 지정된 타겟 키 또는 원래 키에 저장
        if (targetKey) {
          newItem[targetKey] = result;
        } else if (key) {
          newItem[key] = result;
        }

        return newItem;
      });
    } catch (error) {
      throw new Error(`Failed to map data: ${(error as Error).message}`);
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
