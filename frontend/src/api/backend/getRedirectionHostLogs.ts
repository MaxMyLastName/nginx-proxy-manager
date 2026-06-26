import * as api from "./base";

export interface RedirectionHostLogs {
	access: string[];
	error: string[];
}

export async function getRedirectionHostLogs(id: number): Promise<RedirectionHostLogs> {
	return await api.get({ url: `/nginx/redirection-hosts/${id}/logs` });
}
