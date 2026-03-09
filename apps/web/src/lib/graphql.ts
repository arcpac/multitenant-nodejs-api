import { apiFetch } from "./api";

type GqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };
const DEBUG_GRAPHQL_DELAY_MS = 1500;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function gqlFetch<T, V = Record<string, unknown>>(
    query: string,
    variables?: V
): Promise<T> {
    // Debug-only: simulate slow network/large payload responses.
    if (DEBUG_GRAPHQL_DELAY_MS > 0) {
        await sleep(DEBUG_GRAPHQL_DELAY_MS);
    }

    const res = await apiFetch<GqlResponse<T>>("/graphql", {
        method: "POST",
        body: JSON.stringify({ query, variables }),
    });

    if (res.errors?.length) throw new Error(res.errors[0].message);
    if (!res.data) throw new Error("No GraphQL data returned");
    return res.data;
}
