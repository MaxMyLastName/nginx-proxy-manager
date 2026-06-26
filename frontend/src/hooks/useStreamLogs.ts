import { useQuery } from "@tanstack/react-query";
import { getStreamLogs, type StreamLogs } from "src/api/backend";

const useStreamLogs = (id: number, options = {}) => {
	return useQuery<StreamLogs, Error>({
		queryKey: ["stream-logs", id],
		queryFn: () => getStreamLogs(id),
		staleTime: 30 * 1000,
		...options,
	});
};

export { useStreamLogs };
