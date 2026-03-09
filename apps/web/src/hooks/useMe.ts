import { useQuery } from "@tanstack/react-query";
import { gqlFetch } from "../lib/graphql";
import { useAuthStore } from "../stores/authStore";

const ME_QUERY = `
query MeWithMembers {
  me {
    user { id email firstName lastName }
    activeOrg { id name }
    role
    members { id email firstName lastName role orgName }
  }
}
`;

export type MeData = {
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
  activeOrg: { id: string; name: string };
  role: string;
  members: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    orgName: string;
  }>;
};

type MeQueryResponse = {
  me: MeData;
};

export function useMe() {
  const status = useAuthStore((s) => s.status);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const data = await gqlFetch<MeQueryResponse>(ME_QUERY);
      return data.me;
    },
    enabled: status === "authed",
  });
}
