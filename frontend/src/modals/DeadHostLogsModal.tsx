import EasyModal, { type InnerModalProps } from "ez-modal-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Alert, Tab, Tabs } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { Button, Loading } from "src/components";
import { useDeadHostLogs } from "src/hooks";
import { T } from "src/locale";

const LIVE_TAIL_INTERVAL_MS = 3000;

const showDeadHostLogsModal = (hostId: number, domainNames: string[]) => {
	EasyModal.show(DeadHostLogsModal, { hostId, domainNames });
};

interface Props extends InnerModalProps {
	hostId: number;
	domainNames: string[];
}

const LOG_PANE_STYLE: React.CSSProperties = {
	overflow: "auto",
	height: "calc(70vh - 8rem)",
	backgroundColor: "var(--tblr-bg-surface-dark)",
	color: "#c9d1d9",
	fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace",
	fontSize: "0.7rem",
	lineHeight: 1.6,
	padding: "0.75rem",
	borderRadius: "0 0.3rem 0.3rem 0.3rem",
	whiteSpace: "pre-wrap",
	wordBreak: "break-all",
	margin: 0,
};

const DeadHostLogsModal = EasyModal.create(({ hostId, domainNames, visible, remove }: Props) => {
	const [isLiveTailing, setIsLiveTailing] = useState(false);
	const { data, isLoading, error } = useDeadHostLogs(hostId, {
		refetchInterval: isLiveTailing ? LIVE_TAIL_INTERVAL_MS : false,
	});
	const title = domainNames?.length ? domainNames[0] : `Host #${hostId}`;
	const accessRef = useRef<HTMLPreElement>(null);
	const errorRef = useRef<HTMLPreElement>(null);
	const initialScrollDone = useRef(false);

	useEffect(() => {
		if (!data) return;
		if (!initialScrollDone.current || isLiveTailing) {
			accessRef.current?.scrollTo({ top: accessRef.current.scrollHeight });
			errorRef.current?.scrollTo({ top: errorRef.current.scrollHeight });
			initialScrollDone.current = true;
		}
	}, [data, isLiveTailing]);

	return (
		<Modal show={visible} onHide={remove} size="xl">
			<Modal.Header closeButton>
				<Modal.Title>
					<T id="action.view-logs" /> — {title}
				</Modal.Title>
				<button
					type="button"
					className={`status ms-auto me-3 ${isLiveTailing ? "status-lime" : "status-secondary"}`}
					onClick={() => setIsLiveTailing((t) => !t)}
					style={{
						background: "none",
						border: `1px solid ${isLiveTailing ? "var(--tblr-lime)" : "var(--tblr-border-color)"}`,
						borderRadius: "var(--tblr-border-radius)",
						cursor: "pointer",
						padding: "0.25rem 0.5rem",
					}}
				>
					<span className={`status-dot${isLiveTailing ? " status-dot-animated" : ""}`} />
					{isLiveTailing ? "Live" : "Live Tail"}
				</button>
			</Modal.Header>
			<Modal.Body style={{ padding: "1rem" }}>
				{isLoading && <Loading noLogo />}
				{!isLoading && error && (
					<Alert variant="danger">{error.message || "Failed to load logs"}</Alert>
				)}
				{!isLoading && data && (
					<Tabs defaultActiveKey="access" className="mb-0">
						<Tab eventKey="access" title="Access Log">
							<pre ref={accessRef} style={LOG_PANE_STYLE}>
								{data.access.length ? data.access.join("\n") : "(no entries)"}
							</pre>
						</Tab>
						<Tab eventKey="error" title="Error Log">
							<pre ref={errorRef} style={LOG_PANE_STYLE}>
								{data.error.length ? data.error.join("\n") : "(no entries)"}
							</pre>
						</Tab>
					</Tabs>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={remove}>
					<T id="action.close" />
				</Button>
			</Modal.Footer>
		</Modal>
	);
});

export { showDeadHostLogsModal };
