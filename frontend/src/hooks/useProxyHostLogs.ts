import { useQuery } from "@tanstack/react-query";
import { getProxyHostLogs, type ProxyHostLogs } from "src/api/backend";

const useProxyHostLogs = (id: number, options = {}) => {
	return useQuery<ProxyHostLogs, Error>({
		queryKey: ["proxy-host-logs", id],
		queryFn: () => getProxyHostLogs(id),
		staleTime: 30 * 1000,
		...options,
	});
};

export { useProxyHostLogs };
