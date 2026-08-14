declare module '@tanstack/react-query' {
  export class QueryClient {
    constructor(config?: any);
  }
  export const QueryClientProvider: React.ComponentType<{
    client: QueryClient;
    children?: React.ReactNode;
  }>;
  export function useQuery<TData = any, TError = any>(options: any): any;
  export function useMutation<TData = any, TError = any>(options: any): any;
}
