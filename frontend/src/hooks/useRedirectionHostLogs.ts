import { useQuery } from "@tanstack/react-query";
import { getRedirectionHostLogs, type RedirectionHostLogs } from "src/api/backend";

const useRedirectionHostLogs = (id: number, options = {}) => {
	return useQuery<RedirectionHostLogs, Error>({
		queryKey: ["redirection-host-logs", id],
		queryFn: () => getRedirectionHostLogs(id),
		staleTime: 30 * 1000,
		...options,
	});
};

export { useRedirectionHostLogs };
