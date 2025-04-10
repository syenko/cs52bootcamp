import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { getGroups } from "@convex/queries";

export function GroupPage() {
  const navigate = useNavigate();
  const createGroup = useMutation(api.mutations.createGroup);
  const joinGroup = useMutation(api.mutations.joinGroup);
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const groups = useQuery(api.queries.getGroups);
  const currentUser = useQuery(api.queries.getCurrentUser);

  const handleCreateGroup = async (groupName: string) => {
    if (groupName.length === 0) {
      return;
    }
    setIsLoading(true);
    await createGroup({
      name: groupName,
    });
    setIsLoading(false);
  };

  return (
    <PageContainer>
      <div>
        <h2 className="text-center py-4">Groups</h2>
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="flex flex-col gap-4">
            <Label>Group Name</Label>
            <Input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button
              size="lg"
              onClick={() => handleCreateGroup(groupName)}
              disabled={!groupName}
            >
              Create New Group
            </Button>
          </div>
          <div>
            <div className="text-lg font-bold">Your Groups</div>
            <div>
              {groups?.map((group) => <div key={group._id}>{group.name}</div>)}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
