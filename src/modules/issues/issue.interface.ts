export interface IIssue {
    title: string,
    description: string,
    type: "bug" | "feature_request";
    reporter_id: number,
    status?: "open" | "in_progress" | "resolved";
}
export interface IUpdateIssue {
    title?: string;
    description?: string;
    type?: "bug" | "feature_request";
    status?: "open" | "in_progress" | "resolved";
}