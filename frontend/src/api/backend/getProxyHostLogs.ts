import * as api from "./base";

export interface ProxyHostLogs {
	access: string[];
	error: string[];
}

export async function getProxyHostLogs(id: number): Promise<ProxyHostLogs> {
	return await api.get({ url: `/nginx/proxy-hosts/${id}/logs` });
}
