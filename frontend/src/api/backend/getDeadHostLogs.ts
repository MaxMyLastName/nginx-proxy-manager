import * as api from "./base";

export interface DeadHostLogs {
	access: string[];
	error: string[];
}

export async function getDeadHostLogs(id: number): Promise<DeadHostLogs> {
	return await api.get({ url: `/nginx/dead-hosts/${id}/logs` });
}
