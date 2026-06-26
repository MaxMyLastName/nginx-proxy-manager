import { useQuery } from "@tanstack/react-query";
import { getDeadHostLogs, type DeadHostLogs } from "src/api/backend";

const useDeadHostLogs = (id: number, options = {}) => {
	return useQuery<DeadHostLogs, Error>({
		queryKey: ["dead-host-logs", id],
		queryFn: () => getDeadHostLogs(id),
		staleTime: 30 * 1000,
		...options,
	});
};

export { useDeadHostLogs };
