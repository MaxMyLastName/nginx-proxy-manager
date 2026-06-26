import * as api from "./base";

export interface StreamLogs {
	access: string[];
	error: string[];
}

export async function getStreamLogs(id: number): Promise<StreamLogs> {
	return await api.get({ url: `/nginx/streams/${id}/logs` });
}
